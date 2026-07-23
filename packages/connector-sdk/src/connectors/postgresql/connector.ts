import { BaseConnector } from "../../base";
import { ConnectorConfig, ConnectionTestResult, SchemaInfo, TableInfo, ColumnInfo, TableSample, QueryResult, PushdownCapabilities } from "../../types";

export interface PostgresConfig extends ConnectorConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  schema?: string;
  maxConnections?: number;
  connectionTimeoutMs?: number;
}

export class PostgreSQLConnector extends BaseConnector {
  readonly metadata = {
    name: "postgresql",
    displayName: "PostgreSQL",
    description: "Connect to PostgreSQL databases",
    version: "1.0.0",
    icon: "postgresql",
    capabilities: {
      supportsFilter: true,
      supportsProjection: true,
      supportsAggregation: true,
      supportsGroupBy: true,
      supportsOrderBy: true,
      supportsLimit: true,
      supportsJoin: true,
      supportsSubquery: true,
      supportsWindowFunctions: true,
      maxQueryLength: 1000000,
      supportedFunctions: [
        "SUM", "AVG", "COUNT", "COUNTD", "MIN", "MAX", "MEDIAN",
        "STDEV", "VARIANCE", "CORREL",
        "CONCAT", "UPPER", "LOWER", "TRIM", "LENGTH", "SUBSTRING",
        "DATE_TRUNC", "DATE_ADD", "EXTRACT", "NOW",
        "COALESCE", "NULLIF", "CASE", "CAST",
      ],
    },
    configSchema: {
      host: {
        type: "string" as const,
        label: "Host",
        description: "Database host",
        required: true,
        placeholder: "localhost",
      },
      port: {
        type: "number" as const,
        label: "Port",
        description: "Database port",
        required: true,
        default: 5432,
      },
      database: {
        type: "string" as const,
        label: "Database",
        description: "Database name",
        required: true,
      },
      user: {
        type: "string" as const,
        label: "Username",
        description: "Database user",
        required: true,
      },
      password: {
        type: "password" as const,
        label: "Password",
        description: "Database password",
        required: true,
      },
      ssl: {
        type: "boolean" as const,
        label: "Use SSL",
        description: "Enable SSL connection",
        required: false,
        default: false,
      },
      schema: {
        type: "string" as const,
        label: "Default Schema",
        description: "Default schema to use",
        required: false,
        default: "public",
      },
    },
  };

  private createPool(config: PostgresConfig): any {
    const pg = require("pg");
    const poolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: config.maxConnections || 5,
      connectionTimeoutMillis: config.connectionTimeoutMs || 10000,
      idleTimeoutMillis: 30000,
    };

    return new pg.Pool(poolConfig);
  }

  protected async doTestConnection(config: PostgresConfig): Promise<ConnectionTestResult> {
    const pool = this.createPool(config);
    const start = Date.now();

    try {
      const client = await pool.connect();
      try {
        const result = await client.query("SELECT version() as version, now() as server_time");
        const latencyMs = Date.now() - start;
        const version = result.rows[0]?.version || "unknown";

        await client.query("SELECT 1");

        return {
          success: true,
          message: `Connected to PostgreSQL: ${version}`,
          latencyMs,
          serverVersion: version,
        };
      } finally {
        client.release();
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
        latencyMs: Date.now() - start,
      };
    } finally {
      await pool.end();
    }
  }

  protected async doListSchemas(config: PostgresConfig): Promise<SchemaInfo[]> {
    const pool = this.createPool(config);

    try {
      const result = await pool.query(`
        SELECT schema_name, catalog_name
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        ORDER BY schema_name
      `);

      return result.rows.map((row) => ({
        catalog: row.catalog_name,
        schema: row.schema_name,
        type: "schema" as const,
      }));
    } finally {
      await pool.end();
    }
  }

  protected async doListTables(config: PostgresConfig, schema?: string): Promise<TableInfo[]> {
    const pool = this.createPool(config);
    const targetSchema = schema || config.schema || "public";

    try {
      const result = await pool.query(`
        SELECT 
          t.table_catalog,
          t.table_schema,
          t.table_name,
          t.table_type,
          pg_catalog.obj_description(c.oid, 'pg_class') as comment,
          (SELECT reltuples::bigint FROM pg_class WHERE relname = t.table_name) as estimated_rows
        FROM information_schema.tables t
        LEFT JOIN pg_catalog.pg_class c ON c.relname = t.table_name
        WHERE t.table_schema = $1
        ORDER BY t.table_name
      `, [targetSchema]);

      return result.rows.map((row) => ({
        catalog: row.table_catalog,
        schema: row.table_schema,
        table: row.table_name,
        type: this.mapTableType(row.table_type),
        rowCount: row.estimated_rows ? Number(row.estimated_rows) : undefined,
      }));
    } finally {
      await pool.end();
    }
  }

  protected async doListColumns(config: PostgresConfig, schema: string, table: string): Promise<ColumnInfo[]> {
    const pool = this.createPool(config);

    try {
      const result = await pool.query(`
        SELECT 
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          col_description(
            (SELECT oid FROM pg_class WHERE relname = $2),
            c.ordinal_position
          ) as comment,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
          CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
          fk.foreign_table_name,
          fk.foreign_column_name
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_schema = $1 
            AND tc.table_name = $2 
            AND tc.constraint_type = 'PRIMARY KEY'
        ) pk ON pk.column_name = c.column_name
        LEFT JOIN (
          SELECT 
            kcu.column_name,
            ccu.table_name as foreign_table_name,
            ccu.column_name as foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.table_schema = $1 
            AND tc.table_name = $2 
            AND tc.constraint_type = 'FOREIGN KEY'
        ) fk ON fk.column_name = c.column_name
        WHERE c.table_schema = $1 
          AND c.table_name = $2
        ORDER BY c.ordinal_position
      `, [schema, table]);

      return result.rows.map((row) => ({
        name: row.column_name,
        dataType: this.mapDataType(row.data_type),
        nullable: row.is_nullable === "YES",
        isPrimaryKey: row.is_primary_key,
        isForeignKey: row.is_foreign_key,
        foreignKeyTable: row.foreign_table_name,
        foreignKeyColumn: row.foreign_column_name,
        maxLength: row.character_maximum_length,
        precision: row.numeric_precision,
        scale: row.numeric_scale,
        comment: row.comment,
      }));
    } finally {
      await pool.end();
    }
  }

  protected async doSampleData(config: PostgresConfig, schema: string, table: string, limit: number): Promise<TableSample> {
    const columns = await this.doListColumns(config, schema, table);
    const pool = this.createPool(config);

    try {
      const query = `SELECT * FROM "${schema}"."${table}" LIMIT $1`;
      const result = await pool.query(query, [limit]);

      return {
        columns,
        rows: result.rows,
        rowCount: result.rowCount,
      };
    } finally {
      await pool.end();
    }
  }

  protected async doExecuteQuery(config: PostgresConfig, query: string, params?: unknown[]): Promise<QueryResult> {
    const columns: ColumnInfo[] = [];
    const pool = this.createPool(config);
    const start = Date.now();

    try {
      const result = await pool.query(query, params);
      const executionTimeMs = Date.now() - start;

      if (result.fields && result.fields.length > 0) {
        for (const field of result.fields) {
          columns.push({
            name: field.name,
            dataType: field.dataTypeID?.toString() || "unknown",
            nullable: true,
            isPrimaryKey: false,
            isForeignKey: false,
          });
        }
      }

      return {
        columns,
        rows: result.rows,
        rowCount: result.rowCount,
        executionTimeMs,
      };
    } finally {
      await pool.end();
    }
  }

  getPushdownCapabilities(): PushdownCapabilities {
    return this.metadata.capabilities;
  }

  compileToSQL(oqlAst: Record<string, unknown>, dialect: string = "postgresql"): string {
    throw new Error("compileToSQL not implemented - use OQL compiler package");
  }

  private mapTableType(pgType: string): "table" | "view" | "materialized_view" {
    switch (pgType) {
      case "VIEW":
        return "view";
      case "BASE TABLE":
        return "table";
      default:
        return "table";
    }
  }

  private mapDataType(pgType: string): string {
    const typeMap: Record<string, string> = {
      "character varying": "string",
      "varchar": "string",
      "text": "string",
      "char": "string",
      "character": "string",
      "integer": "integer",
      "int": "integer",
      "int4": "integer",
      "bigint": "bigint",
      "int8": "bigint",
      "smallint": "smallint",
      "int2": "smallint",
      "decimal": "decimal",
      "numeric": "decimal",
      "real": "float",
      "float4": "float",
      "double precision": "float",
      "float8": "float",
      "boolean": "boolean",
      "bool": "boolean",
      "date": "date",
      "timestamp without time zone": "timestamp",
      "timestamp": "timestamp",
      "timestamp with time zone": "timestamptz",
      "timestamptz": "timestamptz",
      "time without time zone": "time",
      "time": "time",
      "time with time zone": "timetz",
      "json": "json",
      "jsonb": "jsonb",
      "uuid": "uuid",
      "bytea": "binary",
      "ARRAY": "array",
    };

    const baseType = pgType.replace(/\(\d+(\,\d+)?\)/g, "").trim().toLowerCase();
    return typeMap[baseType] || pgType;
  }
}
