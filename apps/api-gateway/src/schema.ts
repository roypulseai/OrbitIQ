import { ObjectType, Field, ID, InputType, registerEnumType, Float } from "@nestjs/graphql";

export enum ConnectorType {
  POSTGRESQL = "postgresql",
  MYSQL = "mysql",
  SQLSERVER = "sqlserver",
  SNOWFLAKE = "snowflake",
  BIGQUERY = "bigquery",
  REDSHIFT = "redshift",
  DATABRICKS = "databricks",
  CSV = "csv",
  EXCEL = "excel",
  JSON = "json",
}

registerEnumType(ConnectorType, { name: "ConnectorType" });

export enum ConnectionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
  TESTING = "testing",
}

registerEnumType(ConnectionStatus, { name: "ConnectionStatus" });

export enum DiscoveryStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

registerEnumType(DiscoveryStatus, { name: "DiscoveryStatus" });

@ObjectType()
export class Organization {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  region: string;

  @Field({ nullable: true })
  compliancePackId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Workspace {
  @Field(() => ID)
  id: string;

  @Field()
  orgId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  orgId: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  ssoSubject?: string;

  @Field(() => JSON)
  attributes: Record<string, unknown>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field()
  orgId: string;

  @Field()
  name: string;

  @Field(() => JSON)
  permissions: Record<string, unknown>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

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
  status: ConnectionStatus;

  @Field({ nullable: true })
  lastTestedAt?: Date;

  @Field({ nullable: true })
  lastTestResult?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SchemaInfo {
  @Field()
  catalog?: string;

  @Field()
  schema: string;

  @Field()
  type: string;
}

@ObjectType()
export class TableInfo {
  @Field()
  catalog?: string;

  @Field()
  schema: string;

  @Field()
  table: string;

  @Field()
  type: string;

  @Field(() => Float, { nullable: true })
  rowCount?: number;

  @Field({ nullable: true })
  lastModified?: Date;
}

@ObjectType()
export class ColumnInfo {
  @Field()
  name: string;

  @Field()
  dataType: string;

  @Field()
  nullable: boolean;

  @Field()
  isPrimaryKey: boolean;

  @Field()
  isForeignKey: boolean;

  @Field({ nullable: true })
  foreignKeyTable?: string;

  @Field({ nullable: true })
  foreignKeyColumn?: string;

  @Field(() => Float, { nullable: true })
  maxLength?: number;

  @Field(() => Float, { nullable: true })
  precision?: number;

  @Field(() => Float, { nullable: true })
  scale?: number;

  @Field({ nullable: true })
  comment?: string;
}

@ObjectType()
export class TableSample {
  @Field(() => [ColumnInfo])
  columns: ColumnInfo[];

  @Field(() => JSON)
  rows: Record<string, unknown>[];

  @Field(() => Float)
  rowCount: number;
}

@ObjectType()
export class QueryResult {
  @Field(() => [ColumnInfo])
  columns: ColumnInfo[];

  @Field(() => JSON)
  rows: Record<string, unknown>[];

  @Field(() => Float)
  rowCount: number;

  @Field(() => Float)
  executionTimeMs: number;
}

@ObjectType()
export class ConnectionTestResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Float, { nullable: true })
  latencyMs?: number;

  @Field({ nullable: true })
  serverVersion?: string;
}

@ObjectType()
export class AuditLog {
  @Field(() => ID)
  id: string;

  @Field()
  orgId: string;

  @Field()
  actorId: string;

  @Field()
  action: string;

  @Field()
  target: string;

  @Field(() => JSON)
  metadata: Record<string, unknown>;

  @Field()
  timestamp: Date;
}

// Input Types

@InputType()
export class CreateOrganizationInput {
  @Field()
  name: string;

  @Field()
  region: string;

  @Field({ nullable: true })
  compliancePackId?: string;
}

@InputType()
export class CreateWorkspaceInput {
  @Field()
  orgId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class CreateUserInput {
  @Field()
  orgId: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  ssoSubject?: string;

  @Field(() => JSON, { nullable: true })
  attributes?: Record<string, unknown>;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => JSON, { nullable: true })
  attributes?: Record<string, unknown>;
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

@InputType()
export class UpdateConnectionInput {
  @Field(() => JSON, { nullable: true })
  config?: Record<string, unknown>;

  @Field({ nullable: true })
  regionPin?: string;
}

@InputType()
export class QueryExecutionInput {
  @Field()
  connectionId: string;

  @Field()
  query: string;

  @Field(() => [JSON], { nullable: true })
  params?: unknown[];
}
