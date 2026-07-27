import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ObjectType, Field, InputType } from "@nestjs/graphql";
import { ConnectionsService } from "../services/connections.service";
import { AuditService } from "../services/audit.service";

@ObjectType()
export class GQLConnection {
  @Field(() => ID)
  id: string;

  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field()
  connectorType: string;

  @Field()
  config: string;

  @Field({ nullable: true })
  regionPin?: string;

  @Field()
  status: string;

  @Field()
  createdBy: string;

  @Field({ nullable: true })
  lastTestedAt?: Date;

  @Field({ nullable: true })
  lastTestResult?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateConnectionInput {
  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field()
  connectorType: string;

  @Field()
  config: string;

  @Field({ nullable: true })
  regionPin?: string;

  @Field()
  createdBy: string;
}

@InputType()
export class UpdateConnectionInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  connectorType?: string;

  @Field({ nullable: true })
  config?: string;

  @Field({ nullable: true })
  regionPin?: string;
}

@ObjectType()
export class ConnectionTestResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  latencyMs?: number;
}

@Resolver()
export class ConnectionsResolver {
  constructor(
    private readonly connectionsService: ConnectionsService,
    private readonly auditService: AuditService
  ) {}

  @Query(() => [GQLConnection])
  async connections(@Args("workspaceId") workspaceId: string): Promise<GQLConnection[]> {
    const connections = await this.connectionsService.findAll(workspaceId);
    return connections.map(c => ({
      ...c,
      config: typeof c.config === "string" ? c.config : JSON.stringify(c.config),
    })) as any;
  }

  @Query(() => GQLConnection)
  async connection(@Args("id", { type: () => ID }) id: string): Promise<GQLConnection> {
    const conn = await this.connectionsService.findOne(id);
    return {
      ...conn,
      config: typeof conn.config === "string" ? conn.config : JSON.stringify(conn.config),
    } as any;
  }

  @Mutation(() => GQLConnection)
  async createConnection(@Args("input") input: CreateConnectionInput): Promise<GQLConnection> {
    const conn = await this.connectionsService.create({
      workspaceId: input.workspaceId,
      connectorType: input.connectorType,
      config: JSON.parse(input.config),
      regionPin: input.regionPin,
      createdBy: input.createdBy,
    });
    await this.auditService.log({
      action: "connection.create",
      target: conn.id,
      metadata: { connectorType: input.connectorType, name: input.name },
    });
    return { ...conn, config: JSON.stringify(conn.config) } as any;
  }

  @Mutation(() => GQLConnection)
  async updateConnection(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateConnectionInput
  ): Promise<GQLConnection> {
    const updateData: Record<string, unknown> = {};
    if (input.name) updateData.name = input.name;
    if (input.connectorType) updateData.connectorType = input.connectorType;
    if (input.config) updateData.config = JSON.parse(input.config);
    if (input.regionPin) updateData.regionPin = input.regionPin;
    const conn = await this.connectionsService.update(id, updateData);
    await this.auditService.log({
      action: "connection.update",
      target: id,
      metadata: { changes: input },
    });
    return { ...conn, config: typeof conn.config === "string" ? conn.config : JSON.stringify(conn.config) } as any;
  }

  @Mutation(() => Boolean)
  async deleteConnection(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
    const result = await this.connectionsService.delete(id);
    await this.auditService.log({
      action: "connection.delete",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  @Mutation(() => ConnectionTestResult)
  async testConnection(@Args("id", { type: () => ID }) id: string): Promise<ConnectionTestResult> {
    const result = await this.connectionsService.test(id);
    await this.auditService.log({
      action: "connection.test",
      target: id,
      metadata: { success: result.success, message: result.message },
    });
    return {
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    };
  }

  @Query(() => [String])
  async listSchemas(@Args("connectionId") connectionId: string): Promise<string[]> {
    const schemas = await this.connectionsService.listSchemas(connectionId);
    return schemas.map((s: any) => s.schemaName || s.name || String(s));
  }

  @Query(() => [String])
  async listConnectionTables(
    @Args("connectionId") connectionId: string,
    @Args("schema", { nullable: true }) schema?: string
  ): Promise<string[]> {
    const tables = await this.connectionsService.listTables(connectionId, schema);
    return tables.map((t: any) => t.tableName || t.name || String(t));
  }
}
