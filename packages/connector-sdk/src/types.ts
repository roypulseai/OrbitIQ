export interface ConnectorConfig {
  [key: string]: unknown;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  serverVersion?: string;
}

export interface SchemaInfo {
  catalog?: string;
  schema: string;
  type: "database" | "schema";
}

export interface TableInfo {
  catalog?: string;
  schema: string;
  table: string;
  type: "table" | "view" | "materialized_view";
  rowCount?: number;
  lastModified?: Date;
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyTable?: string;
  foreignKeyColumn?: string;
  maxLength?: number;
  precision?: number;
  scale?: number;
  comment?: string;
}

export interface TableSample {
  columns: ColumnInfo[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface QueryResult {
  columns: ColumnInfo[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
}

export interface PushdownCapabilities {
  supportsFilter: boolean;
  supportsProjection: boolean;
  supportsAggregation: boolean;
  supportsGroupBy: boolean;
  supportsOrderBy: boolean;
  supportsLimit: boolean;
  supportsJoin: boolean;
  supportsSubquery: boolean;
  supportsWindowFunctions: boolean;
  maxQueryLength?: number;
  supportedFunctions: string[];
}

export interface ConnectorMetadata {
  name: string;
  displayName: string;
  description: string;
  version: string;
  icon: string;
  capabilities: PushdownCapabilities;
  configSchema: Record<string, ConfigField>;
}

export interface ConfigField {
  type: "string" | "number" | "boolean" | "select" | "password";
  label: string;
  description: string;
  required: boolean;
  default?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
}
