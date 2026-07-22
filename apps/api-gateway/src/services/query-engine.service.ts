import { Injectable, BadRequestException } from "@nestjs/common";
import { QueryResult, ColumnInfo } from "../schema";
import { connectorRegistry } from "@orbitiq/connector-sdk";

interface ConnectionRecord {
  id: string;
  config: Record<string, unknown>;
  connectorType: string;
}

@Injectable()
export class QueryEngineService {
  private connections: Map<string, ConnectionRecord> = new Map();

  async execute(
    connectionId: string,
    query: string,
    params?: unknown[]
  ): Promise<QueryResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new BadRequestException(`Connection ${connectionId} not found`);
    }

    const connector = connectorRegistry.get(connection.connectorType);
    if (!connector) {
      throw new BadRequestException(
        `Connector "${connection.connectorType}" not found`
      );
    }

    const result = await connector.executeQuery(
      connection.config,
      query,
      params
    );

    return {
      columns: result.columns.map((c) => ({
        name: c.name,
        dataType: c.dataType,
        nullable: c.nullable,
        isPrimaryKey: c.isPrimaryKey,
        isForeignKey: c.isForeignKey,
      })),
      rows: result.rows,
      rowCount: result.rowCount,
      executionTimeMs: result.executionTimeMs,
    };
  }
}
