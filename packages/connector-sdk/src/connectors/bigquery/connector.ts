import { BaseConnector } from "../../base";
import { ConnectorConfig, ConnectionTestResult, SchemaInfo, TableInfo, ColumnInfo, TableSample, QueryResult, PushdownCapabilities } from "../../types";

export interface BigQueryConfig extends ConnectorConfig {
  projectId: string;
  keyFilename?: string;
  credentials?: Record<string, unknown>;
  dataset?: string;
  location?: string;
}

export class BigQueryConnector extends BaseConnector {
  readonly metadata = {
    name: "bigquery",
    displayName: "Google BigQuery",
    description: "Connect to Google BigQuery data warehouse",
    version: "1.0.0",
    icon: "bigquery",
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
        "STDDEV", "VARIANCE", "CORR",
        "CONCAT", "UPPER", "LOWER", "TRIM", "LENGTH", "SUBSTR",
        "DATE_TRUNC", "DATE_ADD", "DATE_DIFF", "EXTRACT", "CURRENT_TIMESTAMP",
        "COALESCE", "NULLIF", "CASE", "CAST", "IF", "IFNULL",
        "FORMAT_TIMESTAMP", "PARSE_TIMESTAMP", "TIMESTAMP_ADD", "TIMESTAMP_DIFF",
      ],
    },
    configSchema: {
      projectId: {
        type: "string" as const,
        label: "Project ID",
        description: "Google Cloud project ID",
        required: true,
      },
      keyFilename: {
        type: "string" as const,
        label: "Key File Path",
        description: "Path to service account JSON key file",
        required: false,
      },
      dataset: {
        type: "string" as const,
        label: "Default Dataset",
        description: "Default dataset to query",
        required: false,
      },
      location: {
        type: "string" as const,
        label: "Location",
        description: "BigQuery location/region",
        required: false,
        default: "US",
      },
    },
  };

  private async getBigQueryClient(config: BigQueryConfig) {
    const { BigQuery } = await import("@google-cloud/bigquery");

    const options: Record<string, unknown> = {
      projectId: config.projectId,
    };

    if (config.keyFilename) {
      options.keyFilename = config.keyFilename;
    }

    if (config.credentials) {
      options.credentials = config.credentials;
    }

    return new BigQuery(options);
  }

  protected async doTestConnection(config: BigQueryConfig): Promise<ConnectionTestResult> {
    const start = Date.now();

    try {
      const bigquery = await this.getBigQueryClient(config);
      
      const query = "SELECT 1 as test, CURRENT_TIMESTAMP() as server_time";
      const [rows] = await bigquery.query(query);
      
      const latencyMs = Date.now() - start;

      return {
        success: true,
        message: `Connected to BigQuery project: ${config.projectId}`,
        latencyMs,
        serverVersion: "BigQuery",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
        latencyMs: Date.now() - start,
      };
    }
  }

  protected async doListSchemas(config: BigQueryConfig): Promise<SchemaInfo[]> {
    const bigquery = await this.getBigQueryClient(config);
    const [datasets] = await bigquery.getDatasets();

    return datasets.map((dataset) => ({
      catalog: config.projectId,
      schema: dataset.id || dataset.metadata.id || "",
      type: "schema" as const,
    }));
  }

  protected async doListTables(config: BigQueryConfig, schema?: string): Promise<TableInfo[]> {
    const bigquery = await this.getBigQueryClient(config);
    const targetDataset = schema || config.dataset || "";
    
    if (!targetDataset) {
      throw new Error("Dataset must be specified for BigQuery");
    }

    const dataset = bigquery.dataset(targetDataset);
    const [tables] = await dataset.getTables();

    return tables.map((table) => ({
      catalog: config.projectId,
      schema: targetDataset,
      table: table.id || "",
      type: this.mapTableType(table.metadata.type || "TABLE"),
      lastModified: table.metadata.modified
        ? new Date(String(table.metadata.modified))
        : undefined,
    }));
  }

  protected async doListColumns(config: BigQueryConfig, schema: string, table: string): Promise<ColumnInfo[]> {
    const bigquery = await this.getBigQueryClient(config);
    const dataset = bigquery.dataset(schema);
    const tableRef = dataset.table(table);
    const [metadata] = await tableRef.getMetadata();

    const schemaFields = metadata.schema?.fields || [];

    return schemaFields.map((field: any) => ({
      name: field.name,
      dataType: this.mapDataType(field.type),
      nullable: field.mode !== "REQUIRED",
      isPrimaryKey: false,
      isForeignKey: false,
      comment: field.description,
    }));
  }

  protected async doSampleData(config: BigQueryConfig, schema: string, table: string, limit: number): Promise<TableSample> {
    const columns = await this.doListColumns(config, schema, table);
    
    const bigquery = await this.getBigQueryClient(config);
    const query = `SELECT * FROM \`${config.projectId}.${schema}.${table}\` LIMIT ${limit}`;
    const [rows] = await bigquery.query(query);

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
    };
  }

  protected async doExecuteQuery(config: BigQueryConfig, query: string, params?: unknown[]): Promise<QueryResult> {
    const bigquery = await this.getBigQueryClient(config);
    const start = Date.now();

    const options: Record<string, unknown> = {};
    if (params && params.length > 0) {
      options.params = params;
    }

    const [rows, metadata] = await bigquery.query({
      query,
      ...options,
    });

    const executionTimeMs = Date.now() - start;

    const columns: ColumnInfo[] = (metadata?.schema?.fields || []).map((field: any) => ({
      name: field.name,
      dataType: this.mapDataType(field.type),
      nullable: field.mode !== "REQUIRED",
      isPrimaryKey: false,
      isForeignKey: false,
    }));

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTimeMs,
    };
  }

  getPushdownCapabilities(): PushdownCapabilities {
    return this.metadata.capabilities;
  }

  compileToSQL(oqlAst: Record<string, unknown>, dialect: string = "bigquery"): string {
    throw new Error("compileToSQL not implemented - use OQL compiler package");
  }

  private mapTableType(bqType: string): "table" | "view" | "materialized_view" {
    switch (bqType) {
      case "VIEW":
        return "view";
      case "TABLE":
        return "table";
      case "MATERIALIZED_VIEW":
        return "materialized_view";
      default:
        return "table";
    }
  }

  private mapDataType(bqType: string): string {
    const typeMap: Record<string, string> = {
      "STRING": "string",
      "BYTES": "binary",
      "INTEGER": "integer",
      "INT64": "integer",
      "FLOAT": "float",
      "FLOAT64": "float",
      "NUMERIC": "decimal",
      "BIGNUMERIC": "decimal",
      "BOOLEAN": "boolean",
      "BOOL": "boolean",
      "DATE": "date",
      "DATETIME": "timestamp",
      "TIME": "time",
      "TIMESTAMP": "timestamptz",
      "GEOGRAPHY": "string",
      "JSON": "json",
      "RECORD": "json",
      "STRUCT": "json",
    };

    const baseType = bqType.replace(/\(\d+(\,\d+)?\)/g, "").trim().toUpperCase();
    return typeMap[baseType] || bqType.toLowerCase();
  }
}
