import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateConnectionInput } from "./connections.resolver";

interface ConnectionRecord {
  id: string;
  workspaceId: string;
  connectorType: string;
  config: Record<string, unknown>;
  regionPin?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ConnectionsService {
  private connections: Map<string, ConnectionRecord> = new Map();

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.connections.set(connection.id, connection);
    return connection;
  }

  async delete(id: string): Promise<boolean> {
    const connection = await this.findOne(id);
    this.connections.delete(id);
    return true;
  }

  async test(id: string): Promise<boolean> {
    const connection = await this.findOne(id);
    // TODO: Implement actual connection testing per connector type
    console.log(`Testing connection ${id} (${connection.connectorType})`);
    return true;
  }
}
