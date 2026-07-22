import { BaseConnector } from "../../base";
import { ConnectorConfig, ConnectionTestResult, SchemaInfo, TableInfo, ColumnInfo, TableSample, QueryResult, PushdownCapabilities } from "../../types";

export interface SnowflakeConfig extends ConnectorConfig {
  account: string;
  username: string;
  password: string;
  database: string;
  schema?: string;
  warehouse?: string;
  role?: string;
}

export class SnowflakeConnector extends BaseConnector {
  readonly metadata = {
    name: "snowflake",
    displayName: "Snowflake",
    description: "Connect to Snowflake data warehouse",
    version: "1.0.0",
    icon: "snowflake",
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
        "DATE_TRUNC", "DATEADD", "DATEDIFF", "EXTRACT", "CURRENT_TIMESTAMP",
        "COALESCE", "NULLIF", "CASE", "CAST", "IFF", "NVL",
      ],
    },
    configSchema: {
      account: {
        type: "string" as const,
        label: "Account",
        description: "Snowflake account identifier",
        required: true,
        placeholder: "xy12345.us-east-1",
      },
      username: {
        type: "string" as const,
        label: "Username",
        description: "Snowflake username",
        required: true,
      },
      password: {
        type: "password" as const,
        label: "Password",
        description: "Snowflake password",
        required: true,
      },
      database: {
        type: "string" as const,
        label: "Database",
        description: "Default database",
        required: true,
      },
      schema: {
        type: "string" as const,
        label: "Default Schema",
        description: "Default schema to use",
        required: false,
        default: "PUBLIC",
      },
      warehouse: {
        type: "string" as const,
        label: "Warehouse",
        description: "Virtual warehouse to use",
        required: false,
      },
      role: {
        type: "string" as const,
        label: "Role",
        description: "Snowflake role to use",
        required: false,
      },
    },
  };

  private async executeSnowflakeQuery(
    config: SnowflakeConfig,
    query: string,
    params?: unknown[]
  ): Promise<{ rows: Record<string, unknown>[]; fields: string[] }> {
    // Dynamic import to avoid bundling the snowflake-sdk in browser contexts
    const snowflake = await import("snowflake-sdk");
    
    const connection = snowflake.createConnection({
      account: config.account,
      username: config.username,
      password: config.password,
      database: config.database,
      schema: config.schema || "PUBLIC",
      warehouse: config.warehouse,
      role: config.role,
    });

    return new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(err);
          return;
        }

        connection.execute({
          sqlText: query,
          binds: params as any[],
          complete: (err, stmt) => {
            if (err) {
              connection.destroy();
              reject(err);
              return;
            }

            const rows: Record<string, unknown>[] = [];
            const fields = stmt.getColumnNames();

            stmt.streamRows().on("data", (row) => {
              rows.push(row);
            });

            stmt.streamRows().on("end", () => {
              connection.destroy();
              resolve({ rows, fields });
            });

            stmt.streamRows().on("error", (err) => {
              connection.destroy();
              reject(err);
            });
          },
        });
      });
    });
  }

  protected async doTestConnection(config: SnowflakeConfig): Promise<ConnectionTestResult> {
    const start = Date.now();

    try {
      const result = await this.executeSnowflakeQuery(
        config,
        "SELECT CURRENT_VERSION() as version, CURRENT_TIMESTAMP() as server_time"
      );
      const latencyMs = Date.now() - start;
      const version = result.rows[0]?.version || "unknown";

      return {
        success: true,
        message: `Connected to Snowflake: ${version}`,
        latencyMs,
        serverVersion: String(version),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
        latencyMs: Date.now() - start,
      };
    }
  }

  protected async doListSchemas(config: SnowflakeConfig): Promise<SchemaInfo[]> {
    const result = await this.executeSnowflakeQuery(
      config,
      `SELECT catalog_name, schema_name 
       FROM ${config.database}.INFORMATION_SCHEMA.SCHEMATA 
       WHERE schema_name NOT IN ('INFORMATION_SCHEMA', 'PG_CATALOG')
       ORDER BY schema_name`
    );

    return result.rows.map((row) => ({
      catalog: String(row.CATALOG_NAME),
      schema: String(row.SCHEMA_NAME),
      type: "schema" as const,
    }));
  }

  protected async doListTables(config: SnowflakeConfig, schema?: string): Promise<TableInfo[]> {
    const targetSchema = schema || config.schema || "PUBLIC";

    const result = await this.executeSnowflakeQuery(
      config,
      `SELECT 
        table_catalog,
        table_schema,
        table_name,
        table_type,
        row_count,
        created
       FROM ${config.database}.INFORMATION_SCHEMA.TABLES 
       WHERE table_schema = ?
       ORDER BY table_name`,
      [targetSchema]
    );

    return result.rows.map((row) => ({
      catalog: String(row.TABLE_CATALOG),
      schema: String(row.TABLE_SCHEMA),
      table: String(row.TABLE_NAME),
      type: this.mapTableType(String(row.TABLE_TYPE)),
      rowCount: row.ROW_COUNT ? Number(row.ROW_COUNT) : undefined,
      lastModified: row.CREATED ? new Date(String(row.CREATED)) : undefined,
    }));
  }

  protected async doListColumns(config: SnowflakeConfig, schema: string, table: string): Promise<ColumnInfo[]> {
    const result = await this.executeSnowflakeQuery(
      config,
      `SELECT 
        column_name,
        data_type,
        is_nullable,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        comment,
        CASE WHEN constraint_type = 'PRIMARY KEY' THEN true ELSE false END as is_primary_key
       FROM ${config.database}.INFORMATION_SCHEMA.COLUMNS c
       LEFT JOIN (
         SELECT kcu.column_name, tc.constraint_type
         FROM ${config.database}.INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
         JOIN ${config.database}.INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
           ON tc.constraint_name = kcu.constraint_name
         WHERE tc.table_schema = ? 
           AND tc.table_name = ?
           AND tc.constraint_type = 'PRIMARY KEY'
       ) pk ON pk.column_name = c.column_name
       WHERE c.table_schema = ? 
         AND c.table_name = ?
       ORDER BY c.ordinal_position`,
      [schema, table, schema, table]
    );

    return result.rows.map((row) => ({
      name: String(row.COLUMN_NAME),
      dataType: this.mapDataType(String(row.DATA_TYPE)),
      nullable: row.IS_NULLABLE === "YES",
      isPrimaryKey: Boolean(row.IS_PRIMARY_KEY),
      isForeignKey: false,
      maxLength: row.CHARACTER_MAXIMUM_LENGTH ? Number(row.CHARACTER_MAXIMUM_LENGTH) : undefined,
      precision: row.NUMERIC_PRECISION ? Number(row.NUMERIC_PRECISION) : undefined,
      scale: row.NUMERIC_SCALE ? Number(row.NUMERIC_SCALE) : undefined,
      comment: row.COMMENT ? String(row.COMMENT) : undefined,
    }));
  }

  protected async doSampleData(config: SnowflakeConfig, schema: string, table: string, limit: number): Promise<TableSample> {
    const columns = await this.doListColumns(config, schema, table);
    const result = await this.executeSnowflakeQuery(
      config,
      `SELECT * FROM "${schema}"."${table}" LIMIT ?`,
      [limit]
    );

    return {
      columns,
      rows: result.rows,
      rowCount: result.rows.length,
    };
  }

  protected async doExecuteQuery(config: SnowflakeConfig, query: string, params?: unknown[]): Promise<QueryResult> {
    const start = Date.now();
    const result = await this.executeSnowflakeQuery(config, query, params);
    const executionTimeMs = Date.now() - start;

    const columns: ColumnInfo[] = result.fields.map((field) => ({
      name: field,
      dataType: "unknown",
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
    }));

    return {
      columns,
      rows: result.rows,
      rowCount: result.rows.length,
      executionTimeMs,
    };
  }

  getPushdownCapabilities(): PushdownCapabilities {
    return this.metadata.capabilities;
  }

  compileToSQL(oqlAst: Record<string, unknown>, dialect: string = "snowflake"): string {
    throw new Error("compileToSQL not implemented - use OQL compiler package");
  }

  private mapTableType(sfType: string): "table" | "view" | "materialized_view" {
    switch (sfType) {
      case "VIEW":
        return "view";
      case "BASE TABLE":
        return "table";
      case "MATERIALIZED VIEW":
        return "materialized_view";
      default:
        return "table";
    }
  }

  private mapDataType(sfType: string): string {
    const typeMap: Record<string, string> = {
      "TEXT": "string",
      "VARCHAR": "string",
      "STRING": "string",
      "CHAR": "string",
      "CHARACTER": "string",
      "NUMBER": "decimal",
      "INT": "integer",
      "INTEGER": "integer",
      "BIGINT": "bigint",
      "SMALLINT": "smallint",
      "TINYINT": "smallint",
      "FLOAT": "float",
      "FLOAT4": "float",
      "FLOAT8": "float",
      "DOUBLE": "float",
      "DOUBLE PRECISION": "float",
      "REAL": "float",
      "BOOLEAN": "boolean",
      "BOOL": "boolean",
      "DATE": "date",
      "DATETIME": "timestamp",
      "TIMESTAMP": "timestamp",
      "TIMESTAMP_NTZ": "timestamp",
      "TIMESTAMP_LTZ": "timestamptz",
      "TIMESTAMP_TZ": "timestamptz",
      "TIME": "time",
      "VARIANT": "json",
      "OBJECT": "json",
      "ARRAY": "array",
      "BINARY": "binary",
      "GEOGRAPHY": "string",
      "GEOMETRY": "string",
    };

    const baseType = sfType.replace(/\(\d+(\,\d+)?\)/g, "").trim().toUpperCase();
    return typeMap[baseType] || sfType.toLowerCase();
  }
}
