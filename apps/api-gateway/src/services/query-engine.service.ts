import { Injectable, BadRequestException } from "@nestjs/common";
import { QueryResult } from "../schema";
import { PrismaService } from "./prisma.service";
import { connectorRegistry } from "@orbitiq/connector-sdk";

@Injectable()
export class QueryEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    connectionId: string,
    query: string,
    params?: unknown[]
  ): Promise<QueryResult> {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!connection) {
      throw new BadRequestException(`Connection ${connectionId} not found`);
    }

    const connector = connectorRegistry.get(connection.connectorType);
    if (!connector) {
      throw new BadRequestException(
        `Connector "${connection.connectorType}" not registered`
      );
    }

    const config = typeof connection.config === "string"
      ? JSON.parse(connection.config)
      : connection.config;

    const result = await connector.executeQuery(config, query, params);

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

  async executeDirect(
    connectorType: string,
    config: Record<string, unknown>,
    query: string,
    params?: unknown[]
  ): Promise<QueryResult> {
    const connector = connectorRegistry.get(connectorType);
    if (!connector) {
      throw new BadRequestException(`Connector "${connectorType}" not registered`);
    }

    const result = await connector.executeQuery(config, query, params);

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
