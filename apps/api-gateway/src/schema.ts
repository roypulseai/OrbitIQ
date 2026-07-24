import { ObjectType, Field, ID, InputType, registerEnumType, Float, GraphQLISODateTime, Int } from "@nestjs/graphql";
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

// ============================================
// Sprint 7: Caching, Sharing, Embedding Types
// ============================================

// Cache Types
@ObjectType()
export class CacheEntry {
  @Field(() => ID)
  id: string;

  @Field()
  key: string;

  @Field()
  query: string;

  @Field()
  connectionId: string;

  @Field()
  resultSize: number;

  @Field()
  createdAt: Date;

  @Field()
  expiresAt: Date;

  @Field()
  hitCount: number;
}

@ObjectType()
export class CacheStats {
  @Field()
  hits: number;

  @Field()
  misses: number;

  @Field()
  sets: number;

  @Field()
  evictions: number;

  @Field()
  totalEntries: number;

  @Field()
  hitRate: number;
}

@InputType()
export class InvalidateCacheInput {
  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  pattern?: string;

  @Field({ nullable: true })
  connectionId?: string;
}

// Scheduled Refresh Types
@ObjectType()
export class RefreshSchedule {
  @Field(() => ID)
  id: string;

  @Field()
  dashboardId: string;

  @Field()
  workspaceId: string;

  @Field()
  cronExpression: string;

  @Field()
  enabled: boolean;

  @Field({ nullable: true })
  lastRunAt?: Date;

  @Field({ nullable: true })
  nextRunAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateRefreshScheduleInput {
  @Field()
  dashboardId: string;

  @Field()
  workspaceId: string;

  @Field()
  cronExpression: string;

  @Field({ nullable: true })
  enabled?: boolean;
}

@InputType()
export class UpdateRefreshScheduleInput {
  @Field({ nullable: true })
  cronExpression?: string;

  @Field({ nullable: true })
  enabled?: boolean;
}

// Sharing Types
@ObjectType()
export class DashboardShare {
  @Field(() => ID)
  id: string;

  @Field()
  dashboardId: string;

  @Field()
  userId: string;

  @Field()
  workspaceId: string;

  @Field()
  permissionLevel: string;

  @Field()
  sharedBy: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PublicLink {
  @Field(() => ID)
  id: string;

  @Field()
  dashboardId: string;

  @Field()
  token: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  createdBy: string;
}

@InputType()
export class ShareDashboardInput {
  @Field()
  dashboardId: string;

  @Field()
  userId: string;

  @Field()
  workspaceId: string;

  @Field()
  permissionLevel: string;

  @Field()
  sharedBy: string;
}

@InputType()
export class CreatePublicLinkInput {
  @Field()
  dashboardId: string;

  @Field({ nullable: true })
  expiresInHours?: number;

  @Field({ nullable: true })
  password?: string;
}

@InputType()
export class UpdateShareInput {
  @Field()
  permissionLevel: string;
}

// Embedding Types
@ObjectType()
export class EmbedConfig {
  @Field(() => ID)
  id: string;

  @Field()
  dashboardId: string;

  @Field()
  workspaceId: string;

  @Field(() => [String])
  allowedDomains: string[];

  @Field()
  theme: string;

  @Field()
  showHeader: boolean;

  @Field()
  showFilters: boolean;

  @Field()
  showSidebar: boolean;

  @Field()
  fontSize: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class EmbedToken {
  @Field()
  token: string;

  @Field()
  expiresAt: Date;

  @Field()
  embedUrl: string;
}

@InputType()
export class CreateEmbedTokenInput {
  @Field()
  dashboardId: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  expiresInSeconds?: number;

  @Field(() => JSON, { nullable: true })
  filters?: Record<string, unknown>;

  @Field({ nullable: true })
  theme?: string;
}

@InputType()
export class UpdateEmbedConfigInput {
  @Field(() => [String], { nullable: true })
  allowedDomains?: string[];

  @Field({ nullable: true })
  theme?: string;

  @Field({ nullable: true })
  showHeader?: boolean;

  @Field({ nullable: true })
  showFilters?: boolean;

  @Field({ nullable: true })
  showSidebar?: boolean;

  @Field({ nullable: true })
  fontSize?: number;
}

// ─── Sprint 8: Row-Level Security (RLS) ─────────────────────────────────────

@ObjectType()
export class RLSPolicy {
  @Field(() => ID)
  id!: string;

  @Field()
  modelId!: string;

  @Field()
  tableId!: string;

  @Field()
  oqlExpression!: string;

  @Field(() => [String])
  appliesToRoles!: string[];

  @Field()
  isEnabled!: boolean;

  @Field(() => Int)
  priority!: number;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  createdBy?: string;
}

@ObjectType()
export class UserAttributes {
  @Field(() => ID)
  userId!: string;

  @Field(() => GraphQLJSON)
  attributes!: Record<string, string>;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreateRLSPolicyInput {
  @Field()
  modelId!: string;

  @Field()
  tableId!: string;

  @Field()
  oqlExpression!: string;

  @Field(() => [String])
  appliesToRoles!: string[];

  @Field(() => Int, { defaultValue: 100 })
  priority!: number;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateRLSPolicyInput {
  @Field({ nullable: true })
  oqlExpression?: string;

  @Field(() => [String], { nullable: true })
  appliesToRoles?: string[];

  @Field({ nullable: true })
  isEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class SetUserAttributesInput {
  @Field()
  userId!: string;

  @Field(() => GraphQLJSON)
  attributes!: Record<string, string>;
}

// ─── Sprint 9: Column-Level Security + Data Masking ──────────────────────────

@ObjectType()
export class ColumnSecurityRule {
  @Field(() => ID)
  id!: string;

  @Field()
  modelId!: string;

  @Field()
  tableId!: string;

  @Field()
  columnName!: string;

  @Field()
  maskType!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  maskConfig?: Record<string, any>;

  @Field(() => [String])
  appliesToRoles!: string[];

  @Field()
  isEnabled!: boolean;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class PIITag {
  @Field(() => ID)
  id!: string;

  @Field()
  columnName!: string;

  @Field()
  tableId!: string;

  @Field()
  modelId!: string;

  @Field(() => Float)
  confidence!: number;

  @Field()
  source!: string;

  @Field()
  piiType!: string;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateColumnSecurityRuleInput {
  @Field()
  modelId!: string;

  @Field()
  tableId!: string;

  @Field()
  columnName!: string;

  @Field()
  maskType!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  maskConfig?: Record<string, any>;

  @Field(() => [String])
  appliesToRoles!: string[];
}

@InputType()
export class UpdateColumnSecurityRuleInput {
  @Field({ nullable: true })
  maskType?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  maskConfig?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  appliesToRoles?: string[];

  @Field({ nullable: true })
  isEnabled?: boolean;
}

@InputType()
export class UpdatePIITagInput {
  @Field()
  piiType!: string;

  @Field(() => Float, { nullable: true })
  confidence?: number;
}

// ─── Sprint 10: Compliance Policy Engine ─────────────────────────────────────

@ObjectType()
export class CompliancePack {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() jurisdiction!: string;
  @Field() description!: string;
  @Field() version!: string;
  @Field() isEnabled!: boolean;
  @Field(() => Int) ruleCount!: number;
  @Field() createdAt!: Date;
}

@ObjectType()
export class DataResidencyRule {
  @Field(() => ID) id!: string;
  @Field() connectionId!: string;
  @Field(() => [String]) allowedRegions!: string[];
  @Field() defaultRegion!: string;
  @Field() enforcementLevel!: string;
  @Field() createdAt!: Date;
}

@ObjectType()
export class ConsentRecord {
  @Field(() => ID) id!: string;
  @Field() userId!: string;
  @Field() purpose!: string;
  @Field() granted!: boolean;
  @Field() grantedAt!: Date;
  @Field({ nullable: true }) expiresAt?: Date;
}

@ObjectType()
export class DSARRequest {
  @Field(() => ID) id!: string;
  @Field() userId!: string;
  @Field() type!: string;
  @Field() status!: string;
  @Field() requestedAt!: Date;
  @Field({ nullable: true }) completedAt?: Date;
}

@ObjectType()
export class AuditTrailStats {
  @Field(() => Int) totalEntries!: number;
  @Field(() => Int) complianceRelevant!: number;
  @Field(() => Int) criticalEvents!: number;
  @Field(() => Int) todayEvents!: number;
}

@InputType()
export class CreateCompliancePackInput {
  @Field() name!: string;
  @Field() jurisdiction!: string;
  @Field() description!: string;
}

@InputType()
export class UpdateDataResidencyInput {
  @Field() connectionId!: string;
  @Field(() => [String]) allowedRegions!: string[];
  @Field() defaultRegion!: string;
  @Field() enforcementLevel!: string;
}

@InputType()
export class CreateConsentRecordInput {
  @Field() userId!: string;
  @Field() purpose!: string;
  @Field() granted!: boolean;
  @Field({ nullable: true }) expiresAt?: Date;
}

@InputType()
export class CreateDSARRequestInput {
  @Field() userId!: string;
  @Field() type!: string;
}

// ─── Sprint 11: Statistical Profiling + Knowledge Graph ──────────────────────

@ObjectType()
export class ProfilingJob {
  @Field(() => ID) id!: string;
  @Field() connectionId!: string;
  @Field() status!: string;
  @Field() startedAt!: Date;
  @Field({ nullable: true }) finishedAt?: Date;
  @Field(() => Int) tablesProfiled!: number;
  @Field(() => Int) columnsProfiled!: number;
}

@ObjectType()
export class TopValue {
  @Field() value!: string;
  @Field(() => Int) count!: number;
  @Field(() => Float) percentage!: number;
}

@ObjectType()
export class ColumnProfile {
  @Field(() => ID) id!: string;
  @Field() jobId!: string;
  @Field() tableId!: string;
  @Field() columnName!: string;
  @Field() dataType!: string;
  @Field(() => Int) cardinality!: number;
  @Field(() => Int) nullCount!: number;
  @Field(() => Float) nullPercentage!: number;
  @Field({ nullable: true }) minValue?: string;
  @Field({ nullable: true }) maxValue?: string;
  @Field(() => Float, { nullable: true }) meanValue?: number;
  @Field(() => [TopValue]) topValues!: TopValue[];
  @Field() detectedFormat!: string;
  @Field(() => Float) formatConfidence!: number;
  @Field(() => [String]) sampleValues!: string[];
}

@ObjectType()
export class TableProfile {
  @Field(() => ID) id!: string;
  @Field() jobId!: string;
  @Field() tableId!: string;
  @Field() tableName!: string;
  @Field(() => Int) rowCount!: number;
  @Field(() => Int) columnCount!: number;
  @Field(() => [ColumnProfile]) columns!: ColumnProfile[];
}

@ObjectType()
export class KGEntity {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field() type!: string;
  @Field() vertical!: string;
  @Field(() => [String]) synonyms!: string[];
  @Field(() => [String]) exampleColumns!: string[];
  @Field() createdAt!: Date;
}

@ObjectType()
export class KGRelationship {
  @Field(() => ID) id!: string;
  @Field() fromEntityId!: string;
  @Field() toEntityId!: string;
  @Field() relationshipType!: string;
  @Field() cardinality!: string;
  @Field(() => [String]) typicalIn!: string[];
}

@ObjectType()
export class KGMatch {
  @Field(() => ID) id!: string;
  @Field() sourceColumnName!: string;
  @Field() sourceTableId!: string;
  @Field() matchedEntityId!: string;
  @Field(() => Float) confidence!: number;
  @Field() matchType!: string;
  @Field() createdAt!: Date;
}

@ObjectType()
export class KGStats {
  @Field(() => Int) totalEntities!: number;
  @Field(() => Int) totalRelationships!: number;
  @Field(() => Int) totalMatches!: number;
  @Field(() => Int) verticalsCount!: number;
}

@ObjectType()
export class VerticalInfo {
  @Field() name!: string;
  @Field(() => Int) entityCount!: number;
  @Field(() => Int) relationshipCount!: number;
}

@InputType()
export class StartProfilingInput {
  @Field() connectionId!: string;
  @Field(() => [String]) tableIds!: string[];
}

@InputType()
export class CreateKGEntityInput {
  @Field() name!: string;
  @Field() description!: string;
  @Field() type!: string;
  @Field() vertical!: string;
  @Field(() => [String]) synonyms!: string[];
  @Field(() => [String]) exampleColumns!: string[];
}

@InputType()
export class CreateKGRelationshipInput {
  @Field() fromEntityId!: string;
  @Field() toEntityId!: string;
  @Field() relationshipType!: string;
  @Field() cardinality!: string;
  @Field(() => [String]) typicalIn!: string[];
}

// ─── Sprint 12: Relationship Inference ───────────────────────────────────────

@ObjectType()
export class InferredRelationship {
  @Field(() => ID) id!: string;
  @Field() sourceTable!: string;
  @Field() sourceColumn!: string;
  @Field() targetTable!: string;
  @Field() targetColumn!: string;
  @Field(() => Float) confidence!: number;
  @Field(() => [String]) evidence!: string[];
  @Field() method!: string;
  @Field() cardinality!: string;
  @Field() status!: string;
  @Field() createdAt!: Date;
  @Field({ nullable: true }) reviewedAt?: Date;
}

@ObjectType()
export class InferenceJob {
  @Field(() => ID) id!: string;
  @Field() connectionId!: string;
  @Field() status!: string;
  @Field() startedAt!: Date;
  @Field({ nullable: true }) finishedAt?: Date;
  @Field(() => Int) tablesScanned!: number;
  @Field(() => Int) relationshipsFound!: number;
  @Field(() => Int) relationshipsApproved!: number;
}

@ObjectType()
export class InferenceStats {
  @Field(() => Int) totalProposed!: number;
  @Field(() => Int) approved!: number;
  @Field(() => Int) rejected!: number;
  @Field(() => Int) needsReview!: number;
  @Field(() => Int) pendingReview!: number;
}

@InputType()
export class StartInferenceInput {
  @Field() connectionId!: string;
  @Field(() => [String]) tableNames!: string[];
}
