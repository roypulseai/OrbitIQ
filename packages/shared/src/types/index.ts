export interface Organization {
  id: string;
  name: string;
  region: string;
  compliancePackId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  name: string;
  ssoSubject?: string;
  attributes: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  orgId: string;
  name: string;
  permissions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
}

export interface Connection {
  id: string;
  workspaceId: string;
  connectorType: string;
  config: Record<string, unknown>;
  regionPin?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscoveryRun {
  id: string;
  connectionId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  finishedAt?: Date;
  findings?: Record<string, unknown>;
}

export interface KnowledgeGraphMatch {
  id: string;
  discoveryRunId: string;
  sourceColumn: string;
  matchedEntityId: string;
  confidence: number;
}

export interface SemanticModel {
  id: string;
  workspaceId: string;
  name: string;
  gitRef?: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface Table {
  id: string;
  modelId: string;
  connectionId: string;
  physicalName: string;
  logicalName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  tableId: string;
  physicalName: string;
  logicalName: string;
  dataType: string;
  isPii: boolean;
  maskRule?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id: string;
  modelId: string;
  fromTableId: string;
  toTableId: string;
  cardinality: "1:1" | "1:N" | "N:N";
  joinExpr: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Measure {
  id: string;
  modelId: string;
  name: string;
  oqlExpression: string;
  format?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RLSPolicy {
  id: string;
  modelId: string;
  tableId: string;
  oqlExpression: string;
  appliesToRoleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  id: string;
  workspaceId: string;
  name: string;
  layout: Record<string, unknown>;
  gitRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tile {
  id: string;
  dashboardId: string;
  chartSpec: Record<string, unknown>;
  oqlQuery: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface AIProviderConfig {
  id: string;
  orgId: string;
  providerType: string;
  endpointUrl: string;
  encryptedKeyRef: string;
  taskRouting: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  orgId: string;
  actorId: string;
  action: string;
  target: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface AnalyticsJob {
  id: string;
  workspaceId: string;
  type: "forecast" | "hypothesis" | "cluster" | "classification" | "regression";
  params: Record<string, unknown>;
  status: "pending" | "running" | "completed" | "failed";
  modelRegistryRef?: string;
  createdAt: Date;
  updatedAt: Date;
}
