import { BaseConnector } from "../../base";
import { ConnectorConfig, ConnectionTestResult, SchemaInfo, TableInfo, ColumnInfo, TableSample, QueryResult, PushdownCapabilities } from "../../types";

export interface DuckDBConfig extends ConnectorConfig {
  database?: string;
  extensions?: string[];
}

export class DuckDBConnector extends BaseConnector {
  readonly metadata = {
    name: "duckdb",
    displayName: "DuckDB",
    description: "In-process OLAP database for fast analytics and file ingestion",
    version: "1.0.0",
    icon: "duckdb",
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
      maxQueryLength: 10000000,
      supportedFunctions: [
        "SUM", "AVG", "COUNT", "COUNTDISTINCT", "MIN", "MAX", "MEDIAN",
        "STDEV", "VARIANCE", "CORR", "COVAR",
        "CONCAT", "UPPER", "LOWER", "TRIM", "LENGTH", "SUBSTRING", "REPLACE",
        "DATE_TRUNC", "DATE_ADD", "DATE_DIFF", "EXTRACT", "NOW", "strftime",
        "COALESCE", "NULLIF", "CASE", "CAST",
        "ROW_NUMBER", "RANK", "DENSE_RANK", "NTILE",
        "LAG", "LEAD", "FIRST_VALUE", "LAST_VALUE",
        "LIST", "LIST_TRANSFORM", "LIST_FILTER",
        "STRUCT_PACK", "STRUCT_EXTRACT",
      ],
    },
    configSchema: {
      database: {
        type: "string" as const,
        label: "Database Path",
        description: "Path to DuckDB database file (leave empty for in-memory)",
        required: false,
        placeholder: ":memory:",
      },
    },
  };

  private async createDatabase(config: DuckDBConfig): Promise<any> {
    const duckdb = require("duckdb");
    const dbPath = (config.database as string) || ":memory:";
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(dbPath, (err: Error | null) => {
        if (err) reject(err);
        else resolve(db);
      });
    });
  }

  private async runQuery(db: any, query: string, params?: unknown[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (params && params.length > 0) {
        db.all(query, params, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.all(query, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    });
  }

  private async runStatement(db: any, query: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(query, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  protected async doTestConnection(config: DuckDBConfig): Promise<ConnectionTestResult> {
    const start = Date.now();
    try {
      const db = await this.createDatabase(config);
      const rows = await this.runQuery(db, "SELECT version() as version");
      const latencyMs = Date.now() - start;
      const version = rows[0]?.version || "unknown";
      return {
        success: true,
        message: `Connected to DuckDB: ${version}`,
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

  protected async doListSchemas(config: DuckDBConfig): Promise<SchemaInfo[]> {
    const db = await this.createDatabase(config);
    try {
      const rows = await this.runQuery(db, `
        SELECT database_name as catalog, schema_name, 
               CASE WHEN schema_name = 'main' THEN 'database' ELSE 'schema' END as type
        FROM information_schema.schemata
        ORDER BY schema_name
      `);
      return rows.map((row: any) => ({
        catalog: row.catalog,
        schema: row.schema_name,
        type: row.type as "database" | "schema",
      }));
    } finally {
      db.close(() => {});
    }
  }

  protected async doListTables(config: DuckDBConfig, schema?: string): Promise<TableInfo[]> {
    const db = await this.createDatabase(config);
    const targetSchema = schema || "main";
    try {
      const rows = await this.runQuery(db, `
        SELECT 
          table_catalog,
          table_schema,
          table_name,
          table_type
        FROM information_schema.tables
        WHERE table_schema = $1
        ORDER BY table_name
      `, [targetSchema]);
      return rows.map((row: any) => ({
        catalog: row.table_catalog,
        schema: row.table_schema,
        table: row.table_name,
        type: this.mapTableType(row.table_type),
      }));
    } finally {
      db.close(() => {});
    }
  }

  protected async doListColumns(config: DuckDBConfig, schema: string, table: string): Promise<ColumnInfo[]> {
    const db = await this.createDatabase(config);
    try {
      const rows = await this.runQuery(db, `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          numeric_precision,
          numeric_scale,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `, [schema, table]);
      return rows.map((row: any) => ({
        name: row.column_name,
        dataType: this.mapDataType(row.data_type),
        nullable: row.is_nullable === "YES",
        isPrimaryKey: false,
        isForeignKey: false,
        maxLength: row.character_maximum_length,
        precision: row.numeric_precision,
        scale: row.numeric_scale,
      }));
    } finally {
      db.close(() => {});
    }
  }

  protected async doSampleData(config: DuckDBConfig, schema: string, table: string, limit: number): Promise<TableSample> {
    const columns = await this.doListColumns(config, schema, table);
    const db = await this.createDatabase(config);
    try {
      const rows = await this.runQuery(db, `SELECT * FROM "${schema}"."${table}" LIMIT $1`, [limit]);
      return {
        columns,
        rows,
        rowCount: rows.length,
      };
    } finally {
      db.close(() => {});
    }
  }

  protected async doExecuteQuery(config: DuckDBConfig, query: string, params?: unknown[]): Promise<QueryResult> {
    const db = await this.createDatabase(config);
    const start = Date.now();
    try {
      const rows = await this.runQuery(db, query, params);
      const executionTimeMs = Date.now() - start;
      const columns: ColumnInfo[] = [];
      if (rows.length > 0) {
        for (const key of Object.keys(rows[0])) {
          columns.push({
            name: key,
            dataType: typeof rows[0][key],
            nullable: true,
            isPrimaryKey: false,
            isForeignKey: false,
          });
        }
      }
      return {
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs,
      };
    } finally {
      db.close(() => {});
    }
  }

  getPushdownCapabilities(): PushdownCapabilities {
    return this.metadata.capabilities;
  }

  compileToSQL(oqlAst: Record<string, unknown>, dialect: string = "duckdb"): string {
    throw new Error("compileToSQL not implemented - use OQL compiler package");
  }

  private mapTableType(duckType: string): "table" | "view" | "materialized_view" {
    switch (duckType) {
      case "VIEW": return "view";
      case "LOCAL TEMPORARY": return "view";
      default: return "table";
    }
  }

  private mapDataType(duckType: string): string {
    const typeMap: Record<string, string> = {
      "varchar": "string",
      "integer": "integer",
      "bigint": "bigint",
      "smallint": "smallint",
      "tinyint": "smallint",
      "double": "float",
      "float": "float",
      "real": "float",
      "decimal": "decimal",
      "numeric": "decimal",
      "boolean": "boolean",
      "date": "date",
      "timestamp": "timestamp",
      "timestamp with time zone": "timestamptz",
      "time": "time",
      "blob": "binary",
      "uuid": "uuid",
      "json": "json",
      "struct": "json",
      "list": "array",
    };
    const baseType = duckType.replace(/\(\d+(\,\d+)?\)/g, "").trim().toLowerCase();
    return typeMap[baseType] || duckType;
  }
}
