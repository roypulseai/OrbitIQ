import { ObjectType, Field, ID, InputType, registerEnumType, Float, GraphQLISODateTime } from "@nestjs/graphql";
import { GraphQLJSON, GraphQLJSONObject } from "graphql-scalars";

const JSON = GraphQLJSON;

// Enums for Sprint 2
export enum ModelStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

registerEnumType(ModelStatus, { name: "ModelStatus" });

export enum ChartType {
  BAR = "bar",
  LINE = "line",
  AREA = "area",
  SCATTER = "scatter",
  PIE = "pie",
  DONUT = "donut",
  KPI = "kpi",
  TABLE = "table",
}

registerEnumType(ChartType, { name: "ChartType" });

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

// Sprint 2: Semantic Model Types

@ObjectType()
export class SemanticModel {
  @Field(() => ID)
  id: string;

  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  gitRef?: string;

  @Field(() => ModelStatus)
  status: ModelStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ModelTable {
  @Field(() => ID)
  id: string;

  @Field()
  modelId: string;

  @Field()
  connectionId: string;

  @Field()
  physicalName: string;

  @Field()
  logicalName: string;

  @Field()
  schema: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ModelColumn {
  @Field(() => ID)
  id: string;

  @Field()
  tableId: string;

  @Field()
  physicalName: string;

  @Field()
  logicalName: string;

  @Field()
  dataType: string;

  @Field()
  isDimension: boolean;

  @Field()
  isMeasure: boolean;

  @Field()
  isPii: boolean;

  @Field(() => JSON, { nullable: true })
  maskRule?: Record<string, unknown>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ModelMeasure {
  @Field(() => ID)
  id: string;

  @Field()
  modelId: string;

  @Field()
  name: string;

  @Field()
  expression: string;

  @Field({ nullable: true })
  format?: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Sprint 2: Dashboard Types

@ObjectType()
export class TileConfig {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => JSON)
  position: { x: number; y: number; w: number; h: number };

  @Field(() => JSON)
  config: Record<string, unknown>;
}

@ObjectType()
export class DashboardLayout {
  @Field()
  columns: number;

  @Field()
  rowHeight: number;

  @Field(() => [TileConfig])
  tiles: TileConfig[];
}

@ObjectType()
export class Dashboard {
  @Field(() => ID)
  id: string;

  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => DashboardLayout)
  layout: DashboardLayout;

  @Field({ nullable: true })
  gitRef?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Tile {
  @Field(() => ID)
  id: string;

  @Field()
  dashboardId: string;

  @Field(() => JSON)
  chartSpec: Record<string, unknown>;

  @Field(() => JSON)
  oqlQuery: Record<string, unknown>;

  @Field(() => JSON)
  position: { x: number; y: number; w: number; h: number };

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Sprint 2: RBAC Types

@ObjectType()
export class RoleDefinition {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [String])
  permissions: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PermissionCheck {
  @Field()
  granted: boolean;

  @Field()
  permission: string;

  @Field({ nullable: true })
  reason?: string;
}

// Sprint 2: Input Types

@InputType()
export class CreateSemanticModelInput {
  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateSemanticModelInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class AddModelTableInput {
  @Field()
  modelId: string;

  @Field()
  connectionId: string;

  @Field()
  physicalName: string;

  @Field()
  logicalName: string;

  @Field()
  schema: string;
}

@InputType()
export class AddModelColumnInput {
  @Field()
  tableId: string;

  @Field()
  physicalName: string;

  @Field()
  logicalName: string;

  @Field()
  dataType: string;

  @Field({ nullable: true })
  isDimension?: boolean;

  @Field({ nullable: true })
  isMeasure?: boolean;

  @Field({ nullable: true })
  isPii?: boolean;
}

@InputType()
export class UpdateModelColumnInput {
  @Field({ nullable: true })
  logicalName?: string;

  @Field({ nullable: true })
  isDimension?: boolean;

  @Field({ nullable: true })
  isMeasure?: boolean;

  @Field({ nullable: true })
  isPii?: boolean;

  @Field(() => JSON, { nullable: true })
  maskRule?: Record<string, unknown>;
}

@InputType()
export class AddModelMeasureInput {
  @Field()
  modelId: string;

  @Field()
  name: string;

  @Field()
  expression: string;

  @Field({ nullable: true })
  format?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateModelMeasureInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  expression?: string;

  @Field({ nullable: true })
  format?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class CreateDashboardInput {
  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class TileConfigInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String)
  type: string;

  @Field(() => JSON)
  position: { x: number; y: number; w: number; h: number };

  @Field(() => JSON)
  config: Record<string, unknown>;
}

@InputType()
export class DashboardLayoutInput {
  @Field()
  columns: number;

  @Field()
  rowHeight: number;

  @Field(() => [TileConfigInput])
  tiles: TileConfigInput[];
}

@InputType()
export class UpdateDashboardInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => DashboardLayoutInput, { nullable: true })
  layout?: DashboardLayoutInput;
}

@InputType()
export class AddTileInput {
  @Field()
  dashboardId: string;

  @Field(() => JSON)
  chartSpec: Record<string, unknown>;

  @Field(() => JSON)
  oqlQuery: Record<string, unknown>;

  @Field(() => JSON)
  position: { x: number; y: number; w: number; h: number };
}

@InputType()
export class UpdateTileInput {
  @Field(() => JSON, { nullable: true })
  chartSpec?: Record<string, unknown>;

  @Field(() => JSON, { nullable: true })
  oqlQuery?: Record<string, unknown>;

  @Field(() => JSON, { nullable: true })
  position?: { x: number; y: number; w: number; h: number };
}

@InputType()
export class BuildQueryInput {
  @Field()
  modelId: string;

  @Field(() => [String])
  selectedColumns: string[];

  @Field(() => [String])
  measures: string[];

  @Field(() => [JSON])
  filters: Record<string, unknown>[];

  @Field(() => [String])
  groupBy: string[];

  @Field({ nullable: true })
  orderBy?: string;

  @Field({ nullable: true })
  limit?: number;
}

@InputType()
export class CheckPermissionInput {
  @Field(() => [String])
  roles: string[];

  @Field()
  permission: string;
}

// Sprint 5: Relationship Types

export enum Cardinality {
  ONE_TO_ONE = "1:1",
  ONE_TO_MANY = "1:N",
  MANY_TO_ONE = "N:1",
  MANY_TO_MANY = "N:N",
}

registerEnumType(Cardinality, { name: "Cardinality" });

@ObjectType()
export class Relationship {
  @Field(() => ID)
  id: string;

  @Field()
  modelId: string;

  @Field()
  name: string;

  @Field()
  fromTableId: string;

  @Field()
  fromColumnId: string;

  @Field()
  toTableId: string;

  @Field()
  toColumnId: string;

  @Field(() => Cardinality)
  cardinality: Cardinality;

  @Field({ nullable: true })
  joinType?: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RelationshipSuggestion {
  @Field()
  fromTable: string;

  @Field()
  fromColumn: string;

  @Field()
  toTable: string;

  @Field()
  toColumn: string;

  @Field(() => Cardinality)
  suggestedCardinality: Cardinality;

  @Field()
  confidence: number;

  @Field()
  reason: string;
}

// Sprint 5: Data Prep Types

export enum TransformStepType {
  FILTER = "filter",
  JOIN = "join",
  PIVOT = "pivot",
  UNPIVOT = "unpivot",
  GROUP = "group",
  RENAME = "rename",
  CAST = "cast",
  ADD_COLUMN = "add_column",
  REMOVE_COLUMN = "remove_column",
  SORT = "sort",
  DEDUPLICATE = "deduplicate",
  SAMPLE = "sample",
}

registerEnumType(TransformStepType, { name: "TransformStepType" });

@ObjectType()
export class TransformStep {
  @Field(() => ID)
  id: string;

  @Field()
  pipelineId: string;

  @Field(() => TransformStepType)
  type: TransformStepType;

  @Field()
  order: number;

  @Field(() => JSON)
  config: Record<string, unknown>;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  sqlOutput?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class DataPipeline {
  @Field(() => ID)
  id: string;

  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  sourceConnectionId: string;

  @Field()
  sourceSchema: string;

  @Field()
  sourceTable: string;

  @Field(() => [TransformStep])
  steps: TransformStep[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Sprint 5: Input Types

@InputType()
export class CreateRelationshipInput {
  @Field()
  modelId: string;

  @Field()
  name: string;

  @Field()
  fromTableId: string;

  @Field()
  fromColumnId: string;

  @Field()
  toTableId: string;

  @Field()
  toColumnId: string;

  @Field(() => Cardinality)
  cardinality: Cardinality;

  @Field({ nullable: true })
  joinType?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateRelationshipInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Cardinality, { nullable: true })
  cardinality?: Cardinality;

  @Field({ nullable: true })
  joinType?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class CreateDataPipelineInput {
  @Field()
  workspaceId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  sourceConnectionId: string;

  @Field()
  sourceSchema: string;

  @Field()
  sourceTable: string;
}

@InputType()
export class UpdateDataPipelineInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class AddTransformStepInput {
  @Field()
  pipelineId: string;

  @Field(() => TransformStepType)
  type: TransformStepType;

  @Field(() => JSON)
  config: Record<string, unknown>;

  @Field({ nullable: true })
  order?: number;
}

@InputType()
export class UpdateTransformStepInput {
  @Field(() => JSON, { nullable: true })
  config?: Record<string, unknown>;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  order?: number;
}
