import { BaseConnector } from "../../base";
import { ConnectorConfig, ConnectionTestResult, SchemaInfo, TableInfo, ColumnInfo, TableSample, QueryResult, PushdownCapabilities } from "../../types";

export interface MySQLConfig extends ConnectorConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  charset?: string;
  maxConnections?: number;
  connectionTimeoutMs?: number;
}

export class MySQLConnector extends BaseConnector {
  readonly metadata = {
    name: "mysql",
    displayName: "MySQL",
    description: "Connect to MySQL databases",
    version: "1.0.0",
    icon: "mysql",
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
        "SUM", "AVG", "COUNT", "COUNTD", "MIN", "MAX",
        "STDDEV", "VARIANCE",
        "CONCAT", "UPPER", "LOWER", "TRIM", "LENGTH", "SUBSTRING",
        "DATE_TRUNC", "DATE_ADD", "DATE_SUB", "DATEDIFF", "EXTRACT", "NOW",
        "COALESCE", "NULLIF", "CASE", "CAST", "IF", "IFNULL",
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
        default: 3306,
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
      charset: {
        type: "string" as const,
        label: "Character Set",
        description: "Connection character set",
        required: false,
        default: "utf8mb4",
      },
    },
  };

  private async createConnection(config: MySQLConfig) {
    const mysql = await import("mysql2/promise");

    const connectionConfig: Record<string, unknown> = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      charset: config.charset || "utf8mb4",
      connectTimeout: config.connectionTimeoutMs || 10000,
      ssl: config.ssl ? {} : undefined,
    };

    return mysql.createConnection(connectionConfig);
  }

  protected async doTestConnection(config: MySQLConfig): Promise<ConnectionTestResult> {
    const start = Date.now();

    try {
      const connection = await this.createConnection(config);
      const [rows] = await connection.query("SELECT VERSION() as version, NOW() as server_time");
      const latencyMs = Date.now() - start;
      const version = (rows as any[])[0]?.version || "unknown";

      await connection.end();

      return {
        success: true,
        message: `Connected to MySQL: ${version}`,
        latencyMs,
        serverVersion: version,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
        latencyMs: Date.now() - start,
      };
    }
  }

  protected async doListSchemas(config: MySQLConfig): Promise<SchemaInfo[]> {
    const connection = await this.createConnection(config);

    try {
      const [rows] = await connection.query(`
        SELECT SCHEMA_NAME as schema_name, CATALOG_NAME as catalog_name
        FROM information_schema.SCHEMATA
        WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        ORDER BY SCHEMA_NAME
      `);

      return (rows as any[]).map((row) => ({
        catalog: row.catalog_name || config.database,
        schema: row.schema_name,
        type: "schema" as const,
      }));
    } finally {
      await connection.end();
    }
  }

  protected async doListTables(config: MySQLConfig, schema?: string): Promise<TableInfo[]> {
    const connection = await this.createConnection(config);
    const targetSchema = schema || config.database;

    try {
      const [rows] = await connection.query(`
        SELECT 
          TABLE_SCHEMA,
          TABLE_NAME,
          TABLE_TYPE,
          TABLE_ROWS,
          CREATE_TIME,
          UPDATE_TIME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME
      `, [targetSchema]);

      return (rows as any[]).map((row) => ({
        catalog: config.database,
        schema: row.TABLE_SCHEMA,
        table: row.TABLE_NAME,
        type: this.mapTableType(row.TABLE_TYPE),
        rowCount: row.TABLE_ROWS ? Number(row.TABLE_ROWS) : undefined,
        lastModified: row.UPDATE_TIME ? new Date(row.UPDATE_TIME) : undefined,
      }));
    } finally {
      await connection.end();
    }
  }

  protected async doListColumns(config: MySQLConfig, schema: string, table: string): Promise<ColumnInfo[]> {
    const connection = await this.createConnection(config);

    try {
      const [rows] = await connection.query(`
        SELECT 
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.IS_NULLABLE,
          c.CHARACTER_MAXIMUM_LENGTH,
          c.NUMERIC_PRECISION,
          c.NUMERIC_SCALE,
          c.COLUMN_COMMENT,
          CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES' ELSE 'NO' END as IS_PRIMARY_KEY,
          CASE WHEN fk.COLUMN_NAME IS NOT NULL THEN 'YES' ELSE 'NO' END as IS_FOREIGN_KEY,
          fk.REFERENCED_TABLE_NAME,
          fk.REFERENCED_COLUMN_NAME
        FROM information_schema.COLUMNS c
        LEFT JOIN (
          SELECT kcu.COLUMN_NAME
          FROM information_schema.TABLE_CONSTRAINTS tc
          JOIN information_schema.KEY_COLUMN_USAGE kcu 
            ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
          WHERE tc.TABLE_SCHEMA = ? 
            AND tc.TABLE_NAME = ?
            AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ) pk ON pk.COLUMN_NAME = c.COLUMN_NAME
        LEFT JOIN (
          SELECT 
            kcu.COLUMN_NAME,
            kcu.REFERENCED_TABLE_NAME,
            kcu.REFERENCED_COLUMN_NAME
          FROM information_schema.KEY_COLUMN_USAGE kcu
          WHERE kcu.TABLE_SCHEMA = ? 
            AND kcu.TABLE_NAME = ?
            AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        ) fk ON fk.COLUMN_NAME = c.COLUMN_NAME
        WHERE c.TABLE_SCHEMA = ? 
          AND c.TABLE_NAME = ?
        ORDER BY c.ORDINAL_POSITION
      `, [schema, table, schema, table, schema, table]);

      return (rows as any[]).map((row) => ({
        name: row.COLUMN_NAME,
        dataType: this.mapDataType(row.DATA_TYPE),
        nullable: row.IS_NULLABLE === "YES",
        isPrimaryKey: row.IS_PRIMARY_KEY === "YES",
        isForeignKey: row.IS_FOREIGN_KEY === "YES",
        foreignKeyTable: row.REFERENCED_TABLE_NAME,
        foreignKeyColumn: row.REFERENCED_COLUMN_NAME,
        maxLength: row.CHARACTER_MAXIMUM_LENGTH ? Number(row.CHARACTER_MAXIMUM_LENGTH) : undefined,
        precision: row.NUMERIC_PRECISION ? Number(row.NUMERIC_PRECISION) : undefined,
        scale: row.NUMERIC_SCALE ? Number(row.NUMERIC_SCALE) : undefined,
        comment: row.COLUMN_COMMENT || undefined,
      }));
    } finally {
      await connection.end();
    }
  }

  protected async doSampleData(config: MySQLConfig, schema: string, table: string, limit: number): Promise<TableSample> {
    const columns = await this.doListColumns(config, schema, table);
    const connection = await this.createConnection(config);

    try {
      const [rows] = await connection.query(
        `SELECT * FROM \`${schema}\`.\`${table}\` LIMIT ?`,
        [limit]
      );

      return {
        columns,
        rows: rows as Record<string, unknown>[],
        rowCount: (rows as any[]).length,
      };
    } finally {
      await connection.end();
    }
  }

  protected async doExecuteQuery(config: MySQLConfig, query: string, params?: unknown[]): Promise<QueryResult> {
    const connection = await this.createConnection(config);
    const start = Date.now();

    try {
      const [rows, fields] = await connection.query(query, params);
      const executionTimeMs = Date.now() - start;

      const columns: ColumnInfo[] = (fields as any[]).map((field) => ({
        name: field.name,
        dataType: this.mapDataType(String(field.type)),
        nullable: true,
        isPrimaryKey: false,
        isForeignKey: false,
      }));

      return {
        columns,
        rows: rows as Record<string, unknown>[],
        rowCount: (rows as any[]).length,
        executionTimeMs,
      };
    } finally {
      await connection.end();
    }
  }

  getPushdownCapabilities(): PushdownCapabilities {
    return this.metadata.capabilities;
  }

  compileToSQL(oqlAst: Record<string, unknown>, dialect: string = "mysql"): string {
    throw new Error("compileToSQL not implemented - use OQL compiler package");
  }

  private mapTableType(mysqlType: string): "table" | "view" | "materialized_view" {
    switch (mysqlType) {
      case "VIEW":
        return "view";
      case "BASE TABLE":
        return "table";
      default:
        return "table";
    }
  }

  private mapDataType(mysqlType: string): string {
    const typeMap: Record<string, string> = {
      "varchar": "string",
      "char": "string",
      "text": "string",
      "tinytext": "string",
      "mediumtext": "string",
      "longtext": "string",
      "enum": "string",
      "set": "string",
      "int": "integer",
      "integer": "integer",
      "bigint": "bigint",
      "smallint": "smallint",
      "tinyint": "smallint",
      "mediumint": "integer",
      "float": "float",
      "double": "float",
      "decimal": "decimal",
      "numeric": "decimal",
      "real": "float",
      "boolean": "boolean",
      "bool": "boolean",
      "date": "date",
      "datetime": "timestamp",
      "timestamp": "timestamp",
      "time": "time",
      "year": "integer",
      "json": "json",
      "binary": "binary",
      "varbinary": "binary",
      "blob": "binary",
      "tinyblob": "binary",
      "mediumblob": "binary",
      "longblob": "binary",
      "bit": "boolean",
    };

    const baseType = mysqlType.replace(/\(\d+(\,\d+)?\)/g, "").trim().toLowerCase();
    return typeMap[baseType] || mysqlType;
  }
}
