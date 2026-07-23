import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

export interface CompliancePack {
  id: string;
  name: string;
  jurisdiction: string;
  description: string;
  version: string;
  isEnabled: boolean;
  rules: ComplianceRule[];
  createdAt: Date;
}

export interface ComplianceRule {
  id: string;
  packId: string;
  ruleType: string;
  config: Record<string, unknown>;
  isEnabled: boolean;
}

export interface DataResidencyRule {
  id: string;
  connectionId: string;
  allowedRegions: string[];
  defaultRegion: string;
  enforcementLevel: string;
  createdAt: Date;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: string;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface DSARRequest {
  id: string;
  userId: string;
  type: string;
  status: string;
  requestedAt: Date;
  completedAt?: Date;
  requestedBy?: string;
}

export interface ComplianceEvaluation {
  allowed: boolean;
  violations: string[];
  evaluatedRules: string[];
}

@Injectable()
export class ComplianceService {
  private packs: Map<string, CompliancePack> = new Map();
  private rules: Map<string, ComplianceRule> = new Map();
  private residencyRules: Map<string, DataResidencyRule> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private dsarRequests: Map<string, DSARRequest> = new Map();

  constructor() {
    this.seedMockData();
  }

  // ─── Compliance Pack CRUD ─────────────────────────────────────────────

  createPack(input: {
    name: string;
    jurisdiction: string;
    description: string;
    version?: string;
  }): CompliancePack {
    const now = new Date();
    const pack: CompliancePack = {
      id: crypto.randomUUID(),
      name: input.name,
      jurisdiction: input.jurisdiction,
      description: input.description,
      version: input.version ?? "1.0.0",
      isEnabled: true,
      rules: [],
      createdAt: now,
    };
    this.packs.set(pack.id, pack);
    return pack;
  }

  getPack(id: string): CompliancePack {
    const pack = this.packs.get(id);
    if (!pack) throw new NotFoundException(`Compliance pack ${id} not found`);
    return pack;
  }

  listPacks(): CompliancePack[] {
    return Array.from(this.packs.values());
  }

  togglePack(id: string): CompliancePack {
    const pack = this.getPack(id);
    const updated = { ...pack, isEnabled: !pack.isEnabled };
    this.packs.set(id, updated);
    return updated;
  }

  // ─── Compliance Rule CRUD ─────────────────────────────────────────────

  createRule(input: {
    packId: string;
    ruleType: string;
    config: Record<string, unknown>;
  }): ComplianceRule {
    const rule: ComplianceRule = {
      id: crypto.randomUUID(),
      packId: input.packId,
      ruleType: input.ruleType,
      config: input.config,
      isEnabled: true,
    };
    this.rules.set(rule.id, rule);
    const pack = this.packs.get(rule.packId);
    if (pack) {
      pack.rules = [...pack.rules, rule];
      this.packs.set(rule.packId, pack);
    }
    return rule;
  }

  listRules(): ComplianceRule[] {
    return Array.from(this.rules.values());
  }

  listRulesForPack(packId: string): ComplianceRule[] {
    return Array.from(this.rules.values()).filter((r) => r.packId === packId);
  }

  toggleRule(id: string): ComplianceRule {
    const rule = this.rules.get(id);
    if (!rule) throw new NotFoundException(`Compliance rule ${id} not found`);
    const updated = { ...rule, isEnabled: !rule.isEnabled };
    this.rules.set(id, updated);
    return updated;
  }

  // ─── Data Residency CRUD ──────────────────────────────────────────────

  createResidencyRule(input: {
    connectionId: string;
    allowedRegions: string[];
    defaultRegion: string;
    enforcementLevel: string;
  }): DataResidencyRule {
    const now = new Date();
    const rule: DataResidencyRule = {
      id: crypto.randomUUID(),
      connectionId: input.connectionId,
      allowedRegions: input.allowedRegions,
      defaultRegion: input.defaultRegion,
      enforcementLevel: input.enforcementLevel,
      createdAt: now,
    };
    this.residencyRules.set(rule.id, rule);
    return rule;
  }

  getResidencyRule(id: string): DataResidencyRule {
    const rule = this.residencyRules.get(id);
    if (!rule) throw new NotFoundException(`Residency rule ${id} not found`);
    return rule;
  }

  listResidencyRules(): DataResidencyRule[] {
    return Array.from(this.residencyRules.values());
  }

  listResidencyForConnection(connectionId: string): DataResidencyRule[] {
    return Array.from(this.residencyRules.values()).filter(
      (r) => r.connectionId === connectionId
    );
  }

  updateResidencyRule(
    id: string,
    input: {
      allowedRegions?: string[];
      defaultRegion?: string;
      enforcementLevel?: string;
    }
  ): DataResidencyRule {
    const rule = this.getResidencyRule(id);
    const updated: DataResidencyRule = {
      ...rule,
      ...Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined)
      ),
    };
    this.residencyRules.set(id, updated);
    return updated;
  }

  // ─── Consent Record CRUD ──────────────────────────────────────────────

  createConsentRecord(input: {
    userId: string;
    purpose: string;
    granted: boolean;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
  }): ConsentRecord {
    const record: ConsentRecord = {
      id: crypto.randomUUID(),
      userId: input.userId,
      purpose: input.purpose,
      granted: input.granted,
      grantedAt: new Date(),
      expiresAt: input.expiresAt,
      metadata: input.metadata,
    };
    this.consentRecords.set(record.id, record);
    return record;
  }

  getConsentRecord(id: string): ConsentRecord {
    const record = this.consentRecords.get(id);
    if (!record) throw new NotFoundException(`Consent record ${id} not found`);
    return record;
  }

  listConsentRecords(): ConsentRecord[] {
    return Array.from(this.consentRecords.values());
  }

  listConsentForUser(userId: string): ConsentRecord[] {
    return Array.from(this.consentRecords.values()).filter(
      (r) => r.userId === userId
    );
  }

  revokeConsent(id: string): ConsentRecord {
    const record = this.getConsentRecord(id);
    const updated: ConsentRecord = { ...record, granted: false };
    this.consentRecords.set(id, updated);
    return updated;
  }

  // ─── DSAR Request CRUD ────────────────────────────────────────────────

  createDSARRequest(input: {
    userId: string;
    type: string;
    requestedBy?: string;
  }): DSARRequest {
    const request: DSARRequest = {
      id: crypto.randomUUID(),
      userId: input.userId,
      type: input.type,
      status: "pending",
      requestedAt: new Date(),
      requestedBy: input.requestedBy,
    };
    this.dsarRequests.set(request.id, request);
    return request;
  }

  getDSARRequest(id: string): DSARRequest {
    const request = this.dsarRequests.get(id);
    if (!request) throw new NotFoundException(`DSAR request ${id} not found`);
    return request;
  }

  listDSARRequests(): DSARRequest[] {
    return Array.from(this.dsarRequests.values());
  }

  listDSARRequestsByStatus(status: string): DSARRequest[] {
    return Array.from(this.dsarRequests.values()).filter(
      (r) => r.status === status
    );
  }

  updateDSARStatus(
    id: string,
    status: string
  ): DSARRequest {
    const request = this.getDSARRequest(id);
    const updated: DSARRequest = {
      ...request,
      status,
      ...(status === "completed" ? { completedAt: new Date() } : {}),
    };
    this.dsarRequests.set(id, updated);
    return updated;
  }

  // ─── Compliance Evaluation ────────────────────────────────────────────

  evaluateCompliance(
    connectionId: string,
    operationType: string
  ): ComplianceEvaluation {
    const violations: string[] = [];
    const evaluatedRules: string[] = [];

    // Check data residency rules
    const residencyRules = this.listResidencyForConnection(connectionId);
    for (const rule of residencyRules) {
      evaluatedRules.push(rule.id);
      if (rule.enforcementLevel === "strict" && rule.allowedRegions.length === 0) {
        violations.push(
          `Connection ${connectionId} has no allowed regions for operation "${operationType}"`
        );
      }
    }

    // Check enabled packs and their rules
    const enabledPacks = this.listPacks().filter((p) => p.isEnabled);
    for (const pack of enabledPacks) {
      for (const rule of pack.rules.filter((r) => r.isEnabled)) {
        evaluatedRules.push(rule.id);
        if (rule.ruleType === "data_residency" && residencyRules.length === 0) {
          violations.push(
            `Pack "${pack.name}" requires data residency for connection ${connectionId}`
          );
        }
        if (rule.ruleType === "consent_required" && operationType === "export") {
          violations.push(
            `Pack "${pack.name}" requires consent verification for exports`
          );
        }
      }
    }

    return {
      allowed: violations.length === 0,
      violations,
      evaluatedRules,
    };
  }

  // ─── Mock Data ────────────────────────────────────────────────────────

  private seedMockData(): void {
    const now = new Date();

    // Seed GDPR pack
    const gdprPack: CompliancePack = {
      id: "cp-gdpr-001",
      name: "GDPR (EU)",
      jurisdiction: "EU",
      description: "General Data Protection Regulation compliance pack for EU operations",
      version: "2.1.0",
      isEnabled: true,
      rules: [],
      createdAt: new Date("2026-01-10"),
    };
    this.packs.set(gdprPack.id, gdprPack);

    const gdprRules: ComplianceRule[] = [
      {
        id: "cr-gdpr-r1",
        packId: gdprPack.id,
        ruleType: "data_residency",
        config: { allowedRegions: ["eu-west-1", "eu-central-1"], enforcementLevel: "strict" },
        isEnabled: true,
      },
      {
        id: "cr-gdpr-r2",
        packId: gdprPack.id,
        ruleType: "rtbf",
        config: { retentionDays: 0, gracePeriodDays: 30, notifyDownstream: true },
        isEnabled: true,
      },
      {
        id: "cr-gdpr-r3",
        packId: gdprPack.id,
        ruleType: "consent_required",
        config: { purposes: ["marketing", "analytics", "profiling"], requiresExplicit: true },
        isEnabled: true,
      },
      {
        id: "cr-gdpr-r4",
        packId: gdprPack.id,
        ruleType: "purpose_limitation",
        config: { allowedPurposes: ["service_delivery", "legal_obligation", "consent"], auditTagging: true },
        isEnabled: true,
      },
    ];
    for (const rule of gdprRules) {
      this.rules.set(rule.id, rule);
    }
    gdprPack.rules = gdprRules;

    // Seed CCPA pack
    const ccpaPack: CompliancePack = {
      id: "cp-ccpa-001",
      name: "CCPA/CPRA (US/California)",
      jurisdiction: "US-CA",
      description: "California Consumer Privacy Act / California Privacy Rights Act compliance pack",
      version: "1.5.0",
      isEnabled: true,
      rules: [],
      createdAt: new Date("2026-01-10"),
    };
    this.packs.set(ccpaPack.id, ccpaPack);

    const ccpaRules: ComplianceRule[] = [
      {
        id: "cr-ccpa-r1",
        packId: ccpaPack.id,
        ruleType: "do_not_sell",
        config: { flagField: "do_not_sell", appliesTo: ["customer_data", "contact_info"], optOutUrl: "/privacy/do-not-sell" },
        isEnabled: true,
      },
      {
        id: "cr-ccpa-r2",
        packId: ccpaPack.id,
        ruleType: "dsar",
        config: { responseDays: 45, extensionDays: 45, allowedTypes: ["export", "deletion", "portability"] },
        isEnabled: true,
      },
      {
        id: "cr-ccpa-r3",
        packId: ccpaPack.id,
        ruleType: "retention_period",
        config: { maxRetentionDays: 730, requiresJustification: true, purgeAfterDays: 730 },
        isEnabled: true,
      },
    ];
    for (const rule of ccpaRules) {
      this.rules.set(rule.id, rule);
    }
    ccpaPack.rules = ccpaRules;

    // Seed data residency rules
    const residencySeeds: DataResidencyRule[] = [
      {
        id: "dr-001",
        connectionId: "conn-eu-prod",
        allowedRegions: ["eu-west-1", "eu-central-1", "eu-north-1"],
        defaultRegion: "eu-west-1",
        enforcementLevel: "strict",
        createdAt: new Date("2026-01-15"),
      },
      {
        id: "dr-002",
        connectionId: "conn-us-prod",
        allowedRegions: ["us-east-1", "us-west-2"],
        defaultRegion: "us-east-1",
        enforcementLevel: "strict",
        createdAt: new Date("2026-01-15"),
      },
      {
        id: "dr-003",
        connectionId: "conn-apac-staging",
        allowedRegions: ["ap-southeast-1", "ap-northeast-1", "us-west-2"],
        defaultRegion: "ap-southeast-1",
        enforcementLevel: "advisory",
        createdAt: new Date("2026-02-01"),
      },
    ];
    for (const rule of residencySeeds) {
      this.residencyRules.set(rule.id, rule);
    }

    // Seed consent records
    const consentSeeds: ConsentRecord[] = [
      {
        id: "consent-001",
        userId: "user-001",
        purpose: "analytics",
        granted: true,
        grantedAt: new Date("2026-01-20"),
        expiresAt: new Date("2027-01-20"),
      },
      {
        id: "consent-002",
        userId: "user-001",
        purpose: "marketing",
        granted: false,
        grantedAt: new Date("2026-01-20"),
      },
      {
        id: "consent-003",
        userId: "user-002",
        purpose: "analytics",
        granted: true,
        grantedAt: new Date("2026-02-01"),
        expiresAt: new Date("2027-02-01"),
      },
      {
        id: "consent-004",
        userId: "user-002",
        purpose: "profiling",
        granted: true,
        grantedAt: new Date("2026-02-10"),
        expiresAt: new Date("2026-08-10"),
      },
      {
        id: "consent-005",
        userId: "user-003",
        purpose: "service_delivery",
        granted: true,
        grantedAt: new Date("2026-01-05"),
      },
    ];
    for (const record of consentSeeds) {
      this.consentRecords.set(record.id, record);
    }

    // Seed DSAR requests
    const dsarSeeds: DSARRequest[] = [
      {
        id: "dsar-001",
        userId: "user-001",
        type: "export",
        status: "completed",
        requestedAt: new Date("2026-02-01"),
        completedAt: new Date("2026-02-15"),
        requestedBy: "user-001",
      },
      {
        id: "dsar-002",
        userId: "user-003",
        type: "deletion",
        status: "in_progress",
        requestedAt: new Date("2026-06-10"),
        requestedBy: "user-003",
      },
      {
        id: "dsar-003",
        userId: "user-002",
        type: "portability",
        status: "pending",
        requestedAt: new Date("2026-07-01"),
        requestedBy: "user-002",
      },
    ];
    for (const request of dsarSeeds) {
      this.dsarRequests.set(request.id, request);
    }
  }
}
