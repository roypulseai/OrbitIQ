import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ObjectType, Field, InputType, registerEnumType } from "@nestjs/graphql";
import { ConnectionsService } from "./connections.service";

export enum ConnectorType {
  POSTGRESQL = "postgresql",
  MYSQL = "mysql",
  SQLSERVER = "sqlserver",
  SNOWFLAKE = "snowflake",
  BIGQUERY = "bigquery",
  REDSHIFT = "redshift",
}

registerEnumType(ConnectorType, { name: "ConnectorType" });

@ObjectType()
export class Connection {
  @Field(() => ID)
  id: string;

  @Field()
  workspaceId: string;

  @Field(() => ConnectorType)
  connectorType: ConnectorType;

  @Field(() => JSON)
  config: Record<string, unknown>;

  @Field({ nullable: true })
  regionPin?: string;

  @Field()
  createdBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateConnectionInput {
  @Field()
  workspaceId: string;

  @Field(() => ConnectorType)
  connectorType: ConnectorType;

  @Field(() => JSON)
  config: Record<string, unknown>;

  @Field({ nullable: true })
  regionPin?: string;

  @Field()
  createdBy: string;
}

@Resolver(() => Connection)
export class ConnectionsResolver {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Query(() => [Connection], { name: "connections" })
  async findAll(
    @Args("workspaceId") workspaceId: string
  ): Promise<Connection[]> {
    return this.connectionsService.findAll(workspaceId) as any;
  }

  @Query(() => Connection, { name: "connection" })
  async findOne(
    @Args("id", { type: () => ID }) id: string
  ): Promise<Connection> {
    return this.connectionsService.findOne(id) as any;
  }

  @Mutation(() => Connection)
  async createConnection(
    @Args("input") input: CreateConnectionInput
  ): Promise<Connection> {
    return this.connectionsService.create(input) as any;
  }

  @Mutation(() => Boolean)
  async deleteConnection(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.connectionsService.delete(id);
  }

  @Mutation(() => Boolean)
  async testConnection(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.connectionsService.test(id);
  }
}
