import { Resolver, Query, Mutation, Args, ID, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import {
  Organization,
  Workspace,
  User,
  Role,
  Connection,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  TableSample,
  QueryResult,
  ConnectionTestResult,
  AuditLog,
  CreateOrganizationInput,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  CreateUserInput,
  UpdateUserInput,
  CreateConnectionInput,
  UpdateConnectionInput,
  QueryExecutionInput,
} from "../schema";
import { OrganizationsService } from "../services/organizations.service";
import { WorkspacesService } from "../services/workspaces.service";
import { UsersService } from "../services/users.service";
import { ConnectionsService } from "../services/connections.service";
import { QueryEngineService } from "../services/query-engine.service";
import { AuditService } from "../services/audit.service";

@Resolver()
export class SchemaResolver {
  constructor(
    private readonly orgsService: OrganizationsService,
    private readonly workspacesService: WorkspacesService,
    private readonly usersService: UsersService,
    private readonly connectionsService: ConnectionsService,
    private readonly queryEngineService: QueryEngineService,
    private readonly auditService: AuditService
  ) {}

  // Organization Queries
  @Query(() => [Organization], { name: "organizations" })
  async getOrganizations(): Promise<Organization[]> {
    return this.orgsService.findAll();
  }

  @Query(() => Organization, { name: "organization" })
  async getOrganization(
    @Args("id", { type: () => ID }) id: string
  ): Promise<Organization> {
    return this.orgsService.findOne(id);
  }

  // Organization Mutations
  @Mutation(() => Organization)
  async createOrganization(
    @Args("input") input: CreateOrganizationInput
  ): Promise<Organization> {
    return this.orgsService.create(input);
  }

  // Workspace Queries
  @Query(() => [Workspace], { name: "workspaces" })
  async getWorkspaces(
    @Args("orgId") orgId: string
  ): Promise<Workspace[]> {
    return this.workspacesService.findAll(orgId);
  }

  @Query(() => Workspace, { name: "workspace" })
  async getWorkspace(
    @Args("id", { type: () => ID }) id: string
  ): Promise<Workspace> {
    return this.workspacesService.findOne(id);
  }

  // Workspace Mutations
  @Mutation(() => Workspace)
  async createWorkspace(
    @Args("input") input: CreateWorkspaceInput
  ): Promise<Workspace> {
    return this.workspacesService.create(input);
  }

  @Mutation(() => Workspace)
  async updateWorkspace(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateWorkspaceInput
  ): Promise<Workspace> {
    return this.workspacesService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteWorkspace(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.workspacesService.delete(id);
  }

  // User Queries
  @Query(() => [User], { name: "users" })
  async getUsers(
    @Args("orgId") orgId: string
  ): Promise<User[]> {
    return this.usersService.findAll(orgId);
  }

  @Query(() => User, { name: "user" })
  async getUser(
    @Args("id", { type: () => ID }) id: string
  ): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Query(() => User, { name: "me" })
  async getCurrentUser(): Promise<User> {
    return this.usersService.getCurrentUser();
  }

  // User Mutations
  @Mutation(() => User)
  async createUser(
    @Args("input") input: CreateUserInput
  ): Promise<User> {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  async updateUser(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateUserInput
  ): Promise<User> {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.usersService.delete(id);
  }

  // Connection Queries
  @Query(() => [Connection], { name: "connections" })
  async getConnections(
    @Args("workspaceId") workspaceId: string
  ): Promise<Connection[]> {
    return this.connectionsService.findAll(workspaceId);
  }

  @Query(() => Connection, { name: "connection" })
  async getConnection(
    @Args("id", { type: () => ID }) id: string
  ): Promise<Connection> {
    return this.connectionsService.findOne(id);
  }

  // Connection Mutations
  @Mutation(() => Connection)
  async createConnection(
    @Args("input") input: CreateConnectionInput
  ): Promise<Connection> {
    return this.connectionsService.create(input);
  }

  @Mutation(() => Connection)
  async updateConnection(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateConnectionInput
  ): Promise<Connection> {
    return this.connectionsService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteConnection(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.connectionsService.delete(id);
  }

  @Mutation(() => ConnectionTestResult)
  async testConnection(
    @Args("id", { type: () => ID }) id: string
  ): Promise<ConnectionTestResult> {
    const result = await this.connectionsService.test(id);
    await this.auditService.log({
      action: "connection.test",
      target: id,
      metadata: { success: result.success },
    });
    return result;
  }

  // Schema Discovery Queries
  @Query(() => [SchemaInfo])
  async listSchemas(
    @Args("connectionId") connectionId: string
  ): Promise<SchemaInfo[]> {
    return this.connectionsService.listSchemas(connectionId);
  }

  @Query(() => [TableInfo])
  async listTables(
    @Args("connectionId") connectionId: string,
    @Args("schema", { nullable: true }) schema?: string
  ): Promise<TableInfo[]> {
    return this.connectionsService.listTables(connectionId, schema);
  }

  @Query(() => [ColumnInfo])
  async listColumns(
    @Args("connectionId") connectionId: string,
    @Args("schema") schema: string,
    @Args("table") table: string
  ): Promise<ColumnInfo[]> {
    return this.connectionsService.listColumns(connectionId, schema, table);
  }

  @Query(() => TableSample)
  async sampleData(
    @Args("connectionId") connectionId: string,
    @Args("schema") schema: string,
    @Args("table") table: string,
    @Args("limit", { nullable: true, defaultValue: 100 }) limit: number
  ): Promise<TableSample> {
    return this.connectionsService.sampleData(connectionId, schema, table, limit);
  }

  // Query Execution
  @Mutation(() => QueryResult)
  async executeQuery(
    @Args("input") input: QueryExecutionInput
  ): Promise<QueryResult> {
    const result = await this.queryEngineService.execute(
      input.connectionId,
      input.query,
      input.params
    );
    await this.auditService.log({
      action: "query.execute",
      target: input.connectionId,
      metadata: { rowCount: result.rowCount, executionTimeMs: result.executionTimeMs },
    });
    return result;
  }

  // Audit Logs
  @Query(() => [AuditLog], { name: "auditLogs" })
  async getAuditLogs(
    @Args("orgId") orgId: string,
    @Args("limit", { nullable: true, defaultValue: 100 }) limit: number
  ): Promise<AuditLog[]> {
    return this.auditService.findAll(orgId, limit);
  }
}
