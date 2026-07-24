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

// ─── Sprint 13: Semantic Model Auto-generation ──────────────────────────────

@ObjectType()
export class GeneratedDimension {
  @Field() name!: string;
  @Field() sourceTable!: string;
  @Field() sourceColumn!: string;
  @Field() dataType!: string;
  @Field() description!: string;
  @Field() suggestedAs!: string;
  @Field(() => Float) confidence!: number;
}

@ObjectType()
export class GeneratedMeasure {
  @Field() name!: string;
  @Field() sourceTable!: string;
  @Field() sourceColumn!: string;
  @Field() dataType!: string;
  @Field() aggregation!: string;
  @Field() description!: string;
  @Field() format!: string;
  @Field(() => Float) confidence!: number;
}

@ObjectType()
export class GeneratedModel {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() sourceConnectionId!: string;
  @Field() status!: string;
  @Field(() => [GeneratedDimension]) dimensions!: GeneratedDimension[];
  @Field(() => [GeneratedMeasure]) measures!: GeneratedMeasure[];
  @Field(() => [String]) relationships!: string[];
  @Field() generatedAt!: Date;
  @Field({ nullable: true }) reviewedAt?: Date;
}

@ObjectType()
export class ModelDiff {
  @Field() field!: string;
  @Field() currentValue!: string;
  @Field() proposedValue!: string;
  @Field() action!: string;
}

@ObjectType()
export class GenerationStats {
  @Field(() => Int) total!: number;
  @Field(() => Int) draft!: number;
  @Field(() => Int) reviewing!: number;
  @Field(() => Int) approved!: number;
  @Field(() => Int) published!: number;
}

@InputType()
export class UpdateGeneratedDimensionInput {
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) suggestedAs?: string;
  @Field({ nullable: true }) name?: string;
}

@InputType()
export class UpdateGeneratedMeasureInput {
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) aggregation?: string;
  @Field({ nullable: true }) format?: string;
  @Field({ nullable: true }) name?: string;
}

// ─── Sprint 14: Cross-language + Data Catalog ────────────────────────────────

@ObjectType()
export class SupportedLanguage {
  @Field() code!: string;
  @Field() name!: string;
  @Field() nativeName!: string;
  @Field(() => Int) translationCount!: number;
}

@ObjectType()
export class TranslationEntry {
  @Field(() => ID) id!: string;
  @Field() sourceLang!: string;
  @Field() sourceTerm!: string;
  @Field() targetLang!: string;
  @Field() targetTerm!: string;
  @Field() domain!: string;
  @Field(() => Float) confidence!: number;
}

@ObjectType()
export class CrossLanguageMatch {
  @Field(() => ID) id!: string;
  @Field() sourceColumn!: string;
  @Field() sourceLang!: string;
  @Field() translatedColumn!: string;
  @Field() targetLang!: string;
  @Field() matchedEntityId!: string;
  @Field(() => Float) confidence!: number;
}

@ObjectType()
export class CatalogEntry {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field() type!: string;
  @Field() connectionId!: string;
  @Field(() => [String]) tags!: string[];
  @Field({ nullable: true }) owner?: string;
  @Field() lastUpdated!: Date;
  @Field(() => [String]) lineage!: string[];
  @Field(() => Float) qualityScore!: number;
}

// ─── Sprint 17: Agent Tool Loop ──────────────────────────────────────────────

@ObjectType()
export class AgentToolCall {
  @Field(() => ID) id!: string;
  @Field() toolName!: string;
  @Field(() => GraphQLJSON) arguments!: Record<string, any>;
  @Field() status!: string;
}

@ObjectType()
export class AgentToolResult {
  @Field() toolCallId!: string;
  @Field(() => GraphQLJSON) output!: any;
  @Field() success!: boolean;
  @Field({ nullable: true }) error?: string;
}

@ObjectType()
export class AgentMessage {
  @Field(() => ID) id!: string;
  @Field() role!: string;
  @Field() content!: string;
  @Field({ nullable: true }) toolCall?: AgentToolCall;
  @Field({ nullable: true }) toolResult?: AgentToolResult;
  @Field() timestamp!: Date;
}

@ObjectType()
export class AgentSession {
  @Field(() => ID) id!: string;
  @Field() userId!: string;
  @Field() status!: string;
  @Field(() => [AgentMessage]) messages!: AgentMessage[];
  @Field(() => [String]) toolsUsed!: string[];
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}

@ObjectType()
export class AgentTool {
  @Field() name!: string;
  @Field() description!: string;
}

@ObjectType()
export class CatalogStats {
  @Field(() => Int) totalEntries!: number;
  @Field(() => Int) tables!: number;
  @Field(() => Int) columns!: number;
  @Field(() => Int) metrics!: number;
  @Field(() => Int) dashboards!: number;
}

@InputType()
export class TranslateColumnInput {
  @Field() name!: string;
  @Field() fromLang!: string;
  @Field() toLang!: string;
}

@InputType()
export class BatchTranslateInput {
  @Field(() => [TranslateColumnInput]) columns!: TranslateColumnInput[];
}

@InputType()
export class CatalogSearchInput {
  @Field({ nullable: true }) query?: string;
  @Field({ nullable: true }) connectionId?: string;
  @Field({ nullable: true }) type?: string;
  @Field(() => [String], { nullable: true }) tags?: string[];
}

// ─── Sprint 15: Model Gateway (BYO-LLM) ─────────────────────────────────────

@ObjectType()
export class AIModel {
  @Field() id!: string;
  @Field() providerId!: string;
  @Field() name!: string;
  @Field() displayName!: string;
  @Field(() => Int) maxTokens!: number;
  @Field(() => Float) costPer1kInput!: number;
  @Field(() => Float) costPer1kOutput!: number;
  @Field() supportsStreaming!: boolean;
  @Field() supportsVision!: boolean;
  @Field(() => Int) contextWindow!: number;
}

@ObjectType()
export class AIProvider {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() displayName!: string;
  @Field() apiKey?: string;
  @Field() baseUrl?: string;
  @Field() defaultModel?: string;
  @Field() isActive!: boolean;
  @Field(() => [AIModel]) models!: AIModel[];
  @Field() createdAt!: Date;
  @Field({ nullable: true }) updatedAt?: Date;
}

@ObjectType()
export class AIRequest {
  @Field(() => ID) id!: string;
  @Field() providerId!: string;
  @Field() model!: string;
  @Field() prompt!: string;
  @Field({ nullable: true }) systemPrompt?: string;
  @Field({ nullable: true }) response?: string;
  @Field(() => Int, { nullable: true }) tokensUsed?: number;
  @Field(() => Int, { nullable: true }) latencyMs?: number;
  @Field(() => Float, { nullable: true }) cost?: number;
  @Field() status!: string;
  @Field() createdAt!: Date;
}

@ObjectType()
export class ModelConfig {
  @Field({ nullable: true }) defaultProviderId?: string;
  @Field({ nullable: true }) defaultModelId?: string;
  @Field(() => Float) temperature!: number;
  @Field(() => Int) maxTokens!: number;
  @Field({ nullable: true }) systemPrompt?: string;
}

@ObjectType()
export class CostSummary {
  @Field(() => Float) totalCost!: number;
  @Field(() => Int) totalRequests!: number;
  @Field(() => Int) totalTokens!: number;
}

@InputType()
export class CreateAIProviderInput {
  @Field() name!: string;
  @Field() displayName!: string;
  @Field({ nullable: true }) apiKey?: string;
  @Field({ nullable: true }) baseUrl?: string;
  @Field({ nullable: true }) defaultModel?: string;
}

@InputType()
export class UpdateAIProviderInput {
  @Field({ nullable: true }) displayName?: string;
  @Field({ nullable: true }) apiKey?: string;
  @Field({ nullable: true }) baseUrl?: string;
  @Field({ nullable: true }) defaultModel?: string;
  @Field({ nullable: true }) isActive?: boolean;
}

@InputType()
export class SendAIPromptInput {
  @Field() providerId!: string;
  @Field() model!: string;
  @Field() prompt!: string;
  @Field({ nullable: true }) systemPrompt?: string;
  @Field(() => Int, { nullable: true }) maxTokens?: number;
  @Field(() => Float, { nullable: true }) temperature?: number;
}

@InputType()
export class UpdateModelConfigInput {
  @Field({ nullable: true }) defaultProviderId?: string;
  @Field({ nullable: true }) defaultModelId?: string;
  @Field(() => Float, { nullable: true }) temperature?: number;
  @Field(() => Int, { nullable: true }) maxTokens?: number;
  @Field({ nullable: true }) systemPrompt?: string;
}

// ─── Sprint 16: Intent Parser + Semantic Resolver ────────────────────────────

@ObjectType()
export class ParsedEntity {
  @Field() name!: string;
  @Field() entityType!: string;
  @Field() sourceModel!: string;
  @Field() matchedField!: string;
}

@ObjectType()
export class ParsedFilter {
  @Field() field!: string;
  @Field() operator!: string;
  @Field() value!: string;
  @Field() logicalOperator!: string;
}

@ObjectType()
export class ParsedAggregation {
  @Field() field!: string;
  @Field() function!: string;
  @Field() alias!: string;
}

@ObjectType()
export class ParsedIntent {
  @Field(() => ID) id!: string;
  @Field() rawQuery!: string;
  @Field() parsedAt!: Date;
  @Field() intent!: string;
  @Field(() => [ParsedEntity]) entities!: ParsedEntity[];
  @Field(() => [ParsedFilter]) filters!: ParsedFilter[];
  @Field(() => [ParsedAggregation]) aggregations!: ParsedAggregation[];
  @Field({ nullable: true }) visualizationHint?: string;
  @Field(() => Float) confidence!: number;
  @Field({ nullable: true }) suggestedOQL?: string;
}

@ObjectType()
export class IntentStats {
  @Field(() => Int) totalIntents!: number;
  @Field(() => Float) avgConfidence!: number;
  @Field(() => Int) queriesThisWeek!: number;
  @Field(() => String) topIntent!: string;
}

@ObjectType()
export class AvailableEntity {
  @Field() name!: string;
  @Field() type!: string;
  @Field() dataType!: string;
  @Field() sourceTable!: string;
}

// ─── Sprint 18: Conversational Follow-ups ────────────────────────────────────

@ObjectType()
export class ConversationMessage {
  @Field(() => ID) id!: string;
  @Field() role!: string;
  @Field() content!: string;
  @Field(() => Int, { nullable: true }) tokens?: number;
  @Field() timestamp!: Date;
}

@ObjectType()
export class ConversationContext {
  @Field(() => [String]) previousIntents!: string[];
  @Field(() => [String]) activeFilters!: string[];
  @Field(() => [String]) activeModels!: string[];
  @Field() summary!: string;
  @Field(() => Int) tokenCount!: number;
  @Field(() => Int) maxTokens!: number;
}

@ObjectType()
export class Conversation {
  @Field(() => ID) id!: string;
  @Field() userId!: string;
  @Field() title!: string;
  @Field(() => [ConversationMessage]) messages!: ConversationMessage[];
  @Field(() => ConversationContext) context!: ConversationContext;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}

@ObjectType()
export class SuggestedFollowUp {
  @Field(() => ID) id!: string;
  @Field() question!: string;
  @Field() category!: string;
  @Field(() => Float) relevance!: number;
  @Field() basedOnMessageId!: string;
}

// ─── Sprint 19: Time-Series Forecasting ──────────────────────────────────────

@ObjectType()
export class ForecastMetrics {
  @Field(() => Float) mae!: number;
  @Field(() => Float) rmse!: number;
  @Field(() => Float) mape!: number;
  @Field(() => Float) r2!: number;
  @Field(() => Int) backtestFolds!: number;
}

@ObjectType()
export class ForecastResult {
  @Field(() => [String]) dates!: string[];
  @Field(() => [Float]) actual!: number[];
  @Field(() => [Float]) predicted!: number[];
  @Field(() => [Float]) lowerBound!: number[];
  @Field(() => [Float]) upperBound!: number[];
}

@ObjectType()
export class ForecastJob {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() status!: string;
  @Field() model!: string;
  @Field() dataSource!: string;
  @Field() targetColumn!: string;
  @Field() dateColumn!: string;
  @Field(() => Int) horizon!: number;
  @Field(() => Float) confidenceLevel!: number;
  @Field(() => Int) createdAt!: number;
  @Field({ nullable: true }) completedAt?: number;
  @Field(() => ForecastMetrics, { nullable: true }) metrics?: ForecastMetrics;
  @Field(() => ForecastResult, { nullable: true }) result?: ForecastResult;
}

@ObjectType()
export class ModelComparison {
  @Field() model!: string;
  @Field(() => Float) rmse!: number;
  @Field(() => Float) mape!: number;
  @Field(() => Float) r2!: number;
  @Field(() => Float) trainingTimeMs!: number;
  @Field() recommended!: boolean;
}

@InputType()
export class ForecastConfigInput {
  @Field() dataSource!: string;
  @Field() targetColumn!: string;
  @Field() dateColumn!: string;
  @Field(() => Int) horizon!: number;
  @Field() model!: string;
  @Field(() => Float, { nullable: true }) confidenceLevel?: number;
  @Field({ nullable: true }) seasonality?: string;
}

// ─── Sprint 20: Hypothesis Testing + Experimentation ─────────────────────────

@ObjectType()
export class TestResultGQL {
  @Field(() => Float) statistic!: number;
  @Field(() => Float) pValue!: number;
  @Field() significant!: boolean;
  @Field(() => [Float]) confidenceInterval!: number[];
  @Field(() => Float) effectSize!: number;
  @Field(() => Float) power!: number;
  @Field(() => Int) sampleSize1!: number;
  @Field(() => Int) sampleSize2!: number;
  @Field() interpretation!: string;
}

@ObjectType()
export class HypothesisTest {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() status!: string;
  @Field() testType!: string;
  @Field() variable1!: string;
  @Field({ nullable: true }) variable2?: string;
  @Field(() => Float) significanceLevel!: number;
  @Field(() => TestResultGQL, { nullable: true }) result?: TestResultGQL;
  @Field() createdAt!: number;
  @Field({ nullable: true }) completedAt?: number;
}

@ObjectType()
export class Variant {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field(() => Float) trafficPercentage!: number;
  @Field(() => Float) metricValue!: number;
  @Field(() => Int) conversions!: number;
  @Field(() => Int) sampleSize!: number;
}

@ObjectType()
export class ExperimentResult {
  @Field({ nullable: true }) winner?: string;
  @Field(() => Float) pValue!: number;
  @Field(() => Float) power!: number;
  @Field(() => [Float]) confidenceInterval!: number[];
  @Field(() => [String]) recommendations!: string[];
}

@ObjectType()
export class Experiment {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() status!: string;
  @Field() hypothesis!: string;
  @Field() experimentType!: string;
  @Field(() => [Variant]) variants!: Variant[];
  @Field() targetMetric!: string;
  @Field(() => Int) sampleSize!: number;
  @Field(() => Int) duration!: number;
  @Field({ nullable: true }) createdAt!: number;
  @Field({ nullable: true }) startDate?: number;
  @Field({ nullable: true }) endDate?: number;
  @Field(() => ExperimentResult, { nullable: true }) results?: ExperimentResult;
}

// ─── Sprint 21: ML Wizards + MLflow ──────────────────────────────────────────

@ObjectType()
export class FeatureImportanceGQL {
  @Field() feature!: string;
  @Field(() => Float) importance!: number;
  @Field({ nullable: true }) direction?: string;
}

@ObjectType()
export class MLModel {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() algorithm!: string;
  @Field(() => GraphQLJSON) metrics!: Record<string, number>;
  @Field(() => Int) trainingTimeMs!: number;
  @Field(() => [FeatureImportanceGQL]) featuresImportance!: FeatureImportanceGQL[];
}

@ObjectType()
export class MLExperiment {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() status!: string;
  @Field() taskType!: string;
  @Field(() => [MLModel]) models!: MLModel[];
  @Field({ nullable: true }) targetColumn?: string;
  @Field(() => [String]) features!: string[];
  @Field(() => Int) createdAt!: number;
  @Field({ nullable: true }) completedAt?: number;
}

@ObjectType()
export class ClusteringResult {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field(() => Int) nClusters!: number;
  @Field(() => Float) silhouetteScore!: number;
  @Field(() => Float) daviesBouldinIndex!: number;
  @Field(() => [String]) clusterLabels!: string[];
  @Field(() => Int) totalPoints!: number;
}

@ObjectType()
export class ModelRegistryEntry {
  @Field(() => ID) id!: string;
  @Field() modelId!: string;
  @Field() name!: string;
  @Field() version!: string;
  @Field() stage!: string;
  @Field(() => Float) accuracy!: number;
  @Field(() => Float) f1Score!: number;
  @Field(() => Int) registeredAt!: number;
  @Field({ nullable: true }) description?: string;
}

@InputType()
export class CreateMLExperimentInput {
  @Field() name!: string;
  @Field() taskType!: string;
  @Field() dataset!: string;
  @Field({ nullable: true }) targetColumn?: string;
  @Field(() => [String]) features!: string[];
}

@InputType()
export class RunClusteringInput {
  @Field() name!: string;
  @Field() dataset!: string;
  @Field(() => [String]) features!: string[];
  @Field() autoK!: boolean;
}

@InputType()
export class RegisterModelInput {
  @Field() modelId!: string;
  @Field() name!: string;
  @Field() version!: string;
  @Field() stage!: string;
  @Field(() => GraphQLJSON) metrics!: Record<string, number>;
  @Field({ nullable: true }) description?: string;
}
