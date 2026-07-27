import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { connectorRegistry, PostgreSQLConnector, MySQLConnector, DuckDBConnector, SnowflakeConnector, BigQueryConnector } from "@orbitiq/connector-sdk";

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {
    if (!connectorRegistry.has("postgresql")) {
      connectorRegistry.register(new PostgreSQLConnector());
    }
    if (!connectorRegistry.has("mysql")) {
      connectorRegistry.register(new MySQLConnector());
    }
    if (!connectorRegistry.has("duckdb")) {
      connectorRegistry.register(new DuckDBConnector());
    }
    if (!connectorRegistry.has("snowflake")) {
      connectorRegistry.register(new SnowflakeConnector());
    }
    if (!connectorRegistry.has("bigquery")) {
      connectorRegistry.register(new BigQueryConnector());
    }
  }

  async findAll(workspaceId: string) {
    return this.prisma.connection.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException(`Connection ${id} not found`);
    return connection;
  }

  async create(input: {
    workspaceId: string;
    connectorType: string;
    config: Record<string, unknown>;
    regionPin?: string;
    createdBy: string;
  }) {
    return this.prisma.connection.create({
      data: {
        workspaceId: input.workspaceId,
        connectorType: input.connectorType,
        config: JSON.stringify(input.config),
        regionPin: input.regionPin,
        createdBy: input.createdBy,
        status: "inactive",
      },
    });
  }

  async update(id: string, input: {
    name?: string;
    connectorType?: string;
    config?: Record<string, unknown>;
    regionPin?: string;
  }) {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (input.config) data.config = JSON.stringify(input.config);
    if (input.connectorType) data.connectorType = input.connectorType;
    if (input.regionPin) data.regionPin = input.regionPin;
    return this.prisma.connection.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.prisma.connection.delete({ where: { id } });
    return true;
  }

  async test(id: string) {
    const connection = await this.findOne(id);
    const connector = connectorRegistry.get(connection.connectorType);
    if (!connector) {
      throw new BadRequestException(`Connector "${connection.connectorType}" not found`);
    }

    const config = typeof connection.config === "string"
      ? JSON.parse(connection.config)
      : connection.config;

    const result = await connector.testConnection(config as Record<string, unknown>);

    await this.prisma.connection.update({
      where: { id },
      data: {
        status: result.success ? "active" : "error",
        lastTestedAt: new Date(),
        lastTestResult: result.message,
      },
    });

    return result;
  }

  async listSchemas(connectionId: string) {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);
    if (!connector) throw new BadRequestException(`Connector "${connection.connectorType}" not found`);

    const config = typeof connection.config === "string"
      ? JSON.parse(connection.config)
      : connection.config;

    return connector.listSchemas(config as Record<string, unknown>);
  }

  async listTables(connectionId: string, schema?: string) {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);
    if (!connector) throw new BadRequestException(`Connector "${connection.connectorType}" not found`);

    const config = typeof connection.config === "string"
      ? JSON.parse(connection.config)
      : connection.config;

    return connector.listTables(config as Record<string, unknown>, schema);
  }

  async listColumns(connectionId: string, schema: string, table: string) {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);
    if (!connector) throw new BadRequestException(`Connector "${connection.connectorType}" not found`);

    const config = typeof connection.config === "string"
      ? JSON.parse(connection.config)
      : connection.config;

    return connector.listColumns(config as Record<string, unknown>, schema, table);
  }

  async sampleData(connectionId: string, schema: string, table: string, limit: number = 100) {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);
    if (!connector) throw new BadRequestException(`Connector "${connection.connectorType}" not found`);

    const config = typeof connection.config === "string"
      ? JSON.parse(connection.config)
      : connection.config;

    return connector.sampleData(config as Record<string, unknown>, schema, table, limit);
  }
}
