import { z } from "zod";

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  region: z.string().min(2).max(10),
  compliancePackId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  ssoSubject: z.string().optional(),
  attributes: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const roleSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1).max(100),
  permissions: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const connectionSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  connectorType: z.string().min(1).max(100),
  config: z.record(z.unknown()),
  regionPin: z.string().max(10).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const semanticModelSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(255),
  gitRef: z.string().optional(),
  status: z.enum(["draft", "published"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const dashboardSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(255),
  layout: z.record(z.unknown()),
  gitRef: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const tileSchema = z.object({
  id: z.string().uuid(),
  dashboardId: z.string().uuid(),
  chartSpec: z.record(z.unknown()),
  oqlQuery: z.record(z.unknown()),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  actorId: z.string().uuid(),
  action: z.string().min(1).max(255),
  target: z.string().min(1).max(255),
  metadata: z.record(z.unknown()),
  timestamp: z.date(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type ConnectionInput = z.infer<typeof connectionSchema>;
export type SemanticModelInput = z.infer<typeof semanticModelSchema>;
export type DashboardInput = z.infer<typeof dashboardSchema>;
export type TileInput = z.infer<typeof tileSchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;
