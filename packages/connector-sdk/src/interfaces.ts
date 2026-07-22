import {
  ConnectorConfig,
  ConnectionTestResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  TableSample,
  QueryResult,
  PushdownCapabilities,
  ConnectorMetadata,
} from "./types";

export interface Connector {
  readonly metadata: ConnectorMetadata;

  testConnection(config: ConnectorConfig): Promise<ConnectionTestResult>;

  listSchemas(config: ConnectorConfig): Promise<SchemaInfo[]>;

  listTables(
    config: ConnectorConfig,
    schema?: string
  ): Promise<TableInfo[]>;

  listColumns(
    config: ConnectorConfig,
    schema: string,
    table: string
  ): Promise<ColumnInfo[]>;

  sampleData(
    config: ConnectorConfig,
    schema: string,
    table: string,
    limit?: number
  ): Promise<TableSample>;

  executeQuery(
    config: ConnectorConfig,
    query: string,
    params?: unknown[]
  ): Promise<QueryResult>;

  getPushdownCapabilities(): PushdownCapabilities;

  compileToSQL(
    oqlAst: Record<string, unknown>,
    dialect?: string
  ): string;
}
