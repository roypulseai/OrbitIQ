import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import {
  CreateConnectionInput,
  UpdateConnectionInput,
  ConnectionTestResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  TableSample,
  ConnectionStatus,
} from "../schema";
import { connectorRegistry, Connector, PostgreSQLConnector } from "@orbitiq/connector-sdk";

interface ConnectionRecord {
  id: string;
  workspaceId: string;
  connectorType: string;
  config: Record<string, unknown>;
  regionPin?: string;
  createdBy: string;
  status: ConnectionStatus;
  lastTestedAt?: Date;
  lastTestResult?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ConnectionsService {
  private connections: Map<string, ConnectionRecord> = new Map();

  constructor() {
    connectorRegistry.register(new PostgreSQLConnector());
  }

  async findAll(workspaceId: string): Promise<ConnectionRecord[]> {
    return Array.from(this.connections.values()).filter(
      (c) => c.workspaceId === workspaceId
    );
  }

  async findOne(id: string): Promise<ConnectionRecord> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new NotFoundException(`Connection ${id} not found`);
    }
    return connection;
  }

  async create(input: CreateConnectionInput): Promise<ConnectionRecord> {
    const connection: ConnectionRecord = {
      id: crypto.randomUUID(),
      workspaceId: input.workspaceId,
      connectorType: input.connectorType,
      config: input.config,
      regionPin: input.regionPin,
      createdBy: input.createdBy,
      status: ConnectionStatus.INACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.connections.set(connection.id, connection);
    return connection;
  }

  async update(id: string, input: UpdateConnectionInput): Promise<ConnectionRecord> {
    const connection = await this.findOne(id);
    const updated = {
      ...connection,
      ...input,
      updatedAt: new Date(),
    };
    this.connections.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    this.connections.delete(id);
    return true;
  }

  async test(id: string): Promise<ConnectionTestResult> {
    const connection = await this.findOne(id);
    const connector = connectorRegistry.get(connection.connectorType);

    if (!connector) {
      throw new BadRequestException(
        `Connector "${connection.connectorType}" not found`
      );
    }

    const result = await connector.testConnection(connection.config);

    this.connections.set(id, {
      ...connection,
      status: result.success ? ConnectionStatus.ACTIVE : ConnectionStatus.ERROR,
      lastTestedAt: new Date(),
      lastTestResult: result.message,
      updatedAt: new Date(),
    });

    return result;
  }

  async listSchemas(connectionId: string): Promise<SchemaInfo[]> {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);

    if (!connector) {
      throw new BadRequestException(
        `Connector "${connection.connectorType}" not found`
      );
    }

    const schemas = await connector.listSchemas(connection.config);
    return schemas.map((s) => ({
      catalog: s.catalog,
      schema: s.schema,
      type: s.type,
    }));
  }

  async listTables(
    connectionId: string,
    schema?: string
  ): Promise<TableInfo[]> {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);

    if (!connector) {
      throw new BadRequestException(
        `Connector "${connection.connectorType}" not found`
      );
    }

    const tables = await connector.listTables(connection.config, schema);
    return tables.map((t) => ({
      catalog: t.catalog,
      schema: t.schema,
      table: t.table,
      type: t.type,
      rowCount: t.rowCount,
      lastModified: t.lastModified,
    }));
  }

  async listColumns(
    connectionId: string,
    schema: string,
    table: string
  ): Promise<ColumnInfo[]> {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);

    if (!connector) {
      throw new BadRequestException(
        `Connector "${connection.connectorType}" not found`
      );
    }

    const columns = await connector.listColumns(connection.config, schema, table);
    return columns.map((c) => ({
      name: c.name,
      dataType: c.dataType,
      nullable: c.nullable,
      isPrimaryKey: c.isPrimaryKey,
      isForeignKey: c.isForeignKey,
      foreignKeyTable: c.foreignKeyTable,
      foreignKeyColumn: c.foreignKeyColumn,
      maxLength: c.maxLength,
      precision: c.precision,
      scale: c.scale,
      comment: c.comment,
    }));
  }

  async sampleData(
    connectionId: string,
    schema: string,
    table: string,
    limit: number = 100
  ): Promise<TableSample> {
    const connection = await this.findOne(connectionId);
    const connector = connectorRegistry.get(connection.connectorType);

    if (!connector) {
      throw new BadRequestException(
        `Connector "${connection.connectorType}" not found`
      );
    }

    const sample = await connector.sampleData(connection.config, schema, table, limit);
    return {
      columns: sample.columns.map((c) => ({
        name: c.name,
        dataType: c.dataType,
        nullable: c.nullable,
        isPrimaryKey: c.isPrimaryKey,
        isForeignKey: c.isForeignKey,
      })),
      rows: sample.rows,
      rowCount: sample.rowCount,
    };
  }

  private getConnector(connectorType: string): Connector {
    const connector = connectorRegistry.get(connectorType);
    if (!connector) {
      throw new BadRequestException(
        `Connector "${connectorType}" not found`
      );
    }
    return connector;
  }
}
