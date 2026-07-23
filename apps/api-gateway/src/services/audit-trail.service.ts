import { Injectable } from "@nestjs/common";

export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  actorId: string;
  actorEmail: string;
  targetType: string;
  targetId: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  severity: string;
  complianceRelevant: boolean;
}

export interface AuditQueryFilters {
  eventType?: string;
  actorId?: string;
  severity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  complianceRelevant?: boolean;
  targetType?: string;
  action?: string;
}

export interface AuditStats {
  totalEntries: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  complianceRelevantCount: number;
}

@Injectable()
export class AuditTrailService {
  private entries: AuditTrailEntry[] = [];

  constructor() {
    this.seedMockData();
  }

  log(entry: Omit<AuditTrailEntry, "id" | "timestamp">): AuditTrailEntry {
    const fullEntry: AuditTrailEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...entry,
    };
    this.entries.push(fullEntry);
    return fullEntry;
  }

  query(filters: AuditQueryFilters): AuditTrailEntry[] {
    return this.entries.filter((e) => {
      if (filters.eventType && e.eventType !== filters.eventType) return false;
      if (filters.actorId && e.actorId !== filters.actorId) return false;
      if (filters.severity && e.severity !== filters.severity) return false;
      if (filters.targetType && e.targetType !== filters.targetType) return false;
      if (filters.action && e.action !== filters.action) return false;
      if (filters.complianceRelevant !== undefined && e.complianceRelevant !== filters.complianceRelevant) return false;
      if (filters.dateFrom && e.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && e.timestamp > filters.dateTo) return false;
      return true;
    });
  }

  getStats(): AuditStats {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let complianceRelevantCount = 0;

    for (const entry of this.entries) {
      byType[entry.eventType] = (byType[entry.eventType] ?? 0) + 1;
      bySeverity[entry.severity] = (bySeverity[entry.severity] ?? 0) + 1;
      if (entry.complianceRelevant) complianceRelevantCount++;
    }

    return {
      totalEntries: this.entries.length,
      byType,
      bySeverity,
      complianceRelevantCount,
    };
  }

  exportEntries(filters: AuditQueryFilters): AuditTrailEntry[] {
    return this.query(filters);
  }

  // ─── Mock Data ────────────────────────────────────────────────────────

  private seedMockData(): void {
    const base = new Date("2026-07-01T10:00:00Z");

    const seeds: Array<Omit<AuditTrailEntry, "id">> = [
      {
        timestamp: new Date(base.getTime() - 30 * 86400000),
        eventType: "policy.create",
        actorId: "user-001",
        actorEmail: "admin@acme.com",
        targetType: "rls_policy",
        targetId: "rls-001",
        action: "create",
        details: { policyName: "US Region Sales Filter", modelId: "model-001" },
        ipAddress: "10.0.1.50",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: false,
      },
      {
        timestamp: new Date(base.getTime() - 28 * 86400000),
        eventType: "policy.update",
        actorId: "user-001",
        actorEmail: "admin@acme.com",
        targetType: "rls_policy",
        targetId: "rls-003",
        action: "update",
        details: { field: "oqlExpression", oldValue: "region = US", newValue: "region = US AND cost_center = CC001" },
        ipAddress: "10.0.1.50",
        userAgent: "Mozilla/5.0",
        severity: "warning",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 25 * 86400000),
        eventType: "policy.delete",
        actorId: "user-001",
        actorEmail: "admin@acme.com",
        targetType: "cls_policy",
        targetId: "cls-002",
        action: "delete",
        details: { policyName: "Deprecated email masking rule" },
        ipAddress: "10.0.1.50",
        userAgent: "Mozilla/5.0",
        severity: "critical",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 22 * 86400000),
        eventType: "query.execute",
        actorId: "user-002",
        actorEmail: "analyst@acme.com",
        targetType: "query",
        targetId: "q-exec-001",
        action: "execute",
        details: { modelId: "model-001", rlsApplied: true, rowsReturned: 142, executionMs: 340 },
        ipAddress: "10.0.2.15",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: false,
      },
      {
        timestamp: new Date(base.getTime() - 20 * 86400000),
        eventType: "data.export",
        actorId: "user-004",
        actorEmail: "data-steward@acme.com",
        targetType: "export",
        targetId: "exp-001",
        action: "create",
        details: { format: "csv", rowCount: 15000, connectionId: "conn-eu-prod", complianceEval: "passed" },
        ipAddress: "10.0.1.80",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 18 * 86400000),
        eventType: "dsar.request",
        actorId: "user-001",
        actorEmail: "admin@acme.com",
        targetType: "dsar",
        targetId: "dsar-001",
        action: "create",
        details: { userId: "user-001", type: "export", jurisdiction: "EU" },
        ipAddress: "10.0.1.50",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 15 * 86400000),
        eventType: "dsar.complete",
        actorId: "system",
        actorEmail: "system@orbitiq.io",
        targetType: "dsar",
        targetId: "dsar-001",
        action: "complete",
        details: { userId: "user-001", type: "export", recordsExported: 245 },
        ipAddress: "127.0.0.1",
        userAgent: "OrbitIQ/1.0",
        severity: "info",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 12 * 86400000),
        eventType: "auth.login",
        actorId: "user-001",
        actorEmail: "admin@acme.com",
        targetType: "session",
        targetId: "sess-001",
        action: "login",
        details: { method: "sso", mfa: true },
        ipAddress: "10.0.1.50",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: false,
      },
      {
        timestamp: new Date(base.getTime() - 10 * 86400000),
        eventType: "auth.logout",
        actorId: "user-003",
        actorEmail: "viewer@acme.com",
        targetType: "session",
        targetId: "sess-003",
        action: "logout",
        details: { reason: "user_initiated", sessionDurationMin: 120 },
        ipAddress: "10.0.3.22",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: false,
      },
      {
        timestamp: new Date(base.getTime() - 8 * 86400000),
        eventType: "connection.test",
        actorId: "user-004",
        actorEmail: "data-steward@acme.com",
        targetType: "connection",
        targetId: "conn-eu-prod",
        action: "test",
        details: { result: "success", latencyMs: 45, region: "eu-west-1" },
        ipAddress: "10.0.1.80",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: false,
      },
      {
        timestamp: new Date(base.getTime() - 6 * 86400000),
        eventType: "compliance.evaluate",
        actorId: "system",
        actorEmail: "system@orbitiq.io",
        targetType: "connection",
        targetId: "conn-eu-prod",
        action: "evaluate",
        details: { packsEvaluated: ["GDPR (EU)"], allPassed: true, residencyCompliant: true },
        ipAddress: "127.0.0.1",
        userAgent: "OrbitIQ/1.0",
        severity: "info",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 4 * 86400000),
        eventType: "data.export",
        actorId: "user-002",
        actorEmail: "analyst@acme.com",
        targetType: "export",
        targetId: "exp-002",
        action: "create",
        details: { format: "xlsx", rowCount: 8500, connectionId: "conn-us-prod", complianceEval: "passed" },
        ipAddress: "10.0.2.15",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 3 * 86400000),
        eventType: "ai.prompt",
        actorId: "user-002",
        actorEmail: "analyst@acme.com",
        targetType: "ai_interaction",
        targetId: "ai-001",
        action: "prompt",
        details: { prompt: "Show quarterly revenue by region", containsPII: false, sanitized: true },
        ipAddress: "10.0.2.15",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: false,
      },
      {
        timestamp: new Date(base.getTime() - 1 * 86400000),
        eventType: "policy.update",
        actorId: "user-001",
        actorEmail: "admin@acme.com",
        targetType: "security_policy",
        targetId: "sec-001",
        action: "update",
        details: { field: "maskType", oldValue: "partial", newValue: "full", tableId: "table-customers" },
        ipAddress: "10.0.1.50",
        userAgent: "Mozilla/5.0",
        severity: "warning",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(base.getTime() - 0.5 * 86400000),
        eventType: "compliance.evaluate",
        actorId: "system",
        actorEmail: "system@orbitiq.io",
        targetType: "connection",
        targetId: "conn-apac-staging",
        action: "evaluate",
        details: { packsEvaluated: ["CCPA/CPRA"], allPassed: true, advisoryWarnings: ["Consider pinning to ap-southeast-1"] },
        ipAddress: "127.0.0.1",
        userAgent: "OrbitIQ/1.0",
        severity: "warning",
        complianceRelevant: true,
      },
      {
        timestamp: new Date(),
        eventType: "dsar.request",
        actorId: "user-002",
        actorEmail: "analyst@acme.com",
        targetType: "dsar",
        targetId: "dsar-003",
        action: "create",
        details: { userId: "user-002", type: "portability", jurisdiction: "US-CA" },
        ipAddress: "10.0.2.15",
        userAgent: "Mozilla/5.0",
        severity: "info",
        complianceRelevant: true,
      },
    ];

    for (const seed of seeds) {
      const entry: AuditTrailEntry = {
        id: crypto.randomUUID(),
        ...seed,
      };
      this.entries.push(entry);
    }
  }
}
