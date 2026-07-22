import { Connector } from "./interfaces";
import { ConnectorConfig, PushdownCapabilities } from "./types";

export abstract class BaseConnector implements Connector {
  abstract readonly metadata: {
    name: string;
    displayName: string;
    description: string;
    version: string;
    icon: string;
    capabilities: PushdownCapabilities;
    configSchema: Record<string, unknown>;
  };

  protected abstract doTestConnection(
    config: ConnectorConfig
  ): Promise<{ success: boolean; message: string; latencyMs?: number; serverVersion?: string }>;

  protected abstract doListSchemas(
    config: ConnectorConfig
  ): Promise<{ catalog?: string; schema: string; type: "database" | "schema" }[]>;

  protected abstract doListTables(
    config: ConnectorConfig,
    schema?: string
  ): Promise<{
    catalog?: string;
    schema: string;
    table: string;
    type: "table" | "view" | "materialized_view";
    rowCount?: number;
    lastModified?: Date;
  }[]>;

  protected abstract doListColumns(
    config: ConnectorConfig,
    schema: string,
    table: string
  ): Promise<{
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
  }[]>;

  protected abstract doSampleData(
    config: ConnectorConfig,
    schema: string,
    table: string,
    limit: number
  ): Promise<{
    columns: { name: string; dataType: string; nullable: boolean; isPrimaryKey: boolean; isForeignKey: boolean }[];
    rows: Record<string, unknown>[];
    rowCount: number;
  }>;

  protected abstract doExecuteQuery(
    config: ConnectorConfig,
    query: string,
    params?: unknown[]
  ): Promise<{
    columns: { name: string; dataType: string; nullable: boolean; isPrimaryKey: boolean; isForeignKey: boolean }[];
    rows: Record<string, unknown>[];
    rowCount: number;
    executionTimeMs: number;
  }>;

  async testConnection(config: ConnectorConfig) {
    const start = Date.now();
    try {
      const result = await this.doTestConnection(config);
      return {
        ...result,
        latencyMs: result.latencyMs || Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latencyMs: Date.now() - start,
      };
    }
  }

  async listSchemas(config: ConnectorConfig) {
    return this.doListSchemas(config);
  }

  async listTables(config: ConnectorConfig, schema?: string) {
    return this.doListTables(config, schema);
  }

  async listColumns(config: ConnectorConfig, schema: string, table: string) {
    return this.doListColumns(config, schema, table);
  }

  async sampleData(config: ConnectorConfig, schema: string, table: string, limit = 100) {
    return this.doSampleData(config, schema, table, limit);
  }

  async executeQuery(config: ConnectorConfig, query: string, params?: unknown[]) {
    return this.doExecuteQuery(config, query, params);
  }

  getPushdownCapabilities(): PushdownCapabilities {
    return this.metadata.capabilities;
  }

  compileToSQL(oqlAst: Record<string, unknown>, dialect?: string): string {
    throw new Error("compileToSQL not implemented - use OQL compiler package");
  }
}
