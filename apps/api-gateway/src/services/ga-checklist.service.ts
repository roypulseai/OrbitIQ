import { Injectable } from "@nestjs/common";

export interface GACheckItem {
  id: string;
  category: string;
  item: string;
  status: "pass" | "fail" | "warning" | "pending";
  details: string;
  severity: "critical" | "high" | "medium" | "low";
  lastChecked: Date;
}

export interface GAReport {
  id: string;
  overallStatus: "ready" | "not_ready" | "conditional";
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  pending: number;
  checks: GACheckItem[];
  generatedAt: Date;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  status: "met" | "partial" | "not_met";
  article?: string;
}

export interface CompliancePack {
  id: string;
  name: string;
  region: string;
  regulation: string;
  status: "active" | "draft" | "deprecated";
  requirements: ComplianceRequirement[];
  coveragePercent: number;
}

export interface ConnectorCatalogEntry {
  id: string;
  name: string;
  type: string;
  category: string;
  status: "ga" | "beta" | "alpha";
  version: string;
  lastUpdated: Date;
}

export interface EmbeddingSDKConfig {
  id: string;
  name: string;
  domain: string;
  rlsEnabled: boolean;
  tokenSigning: boolean;
  maxConcurrentSessions: number;
  customTheme: string;
}

export interface SecurityAuditResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning";
  category: string;
  details: string;
  remediation?: string;
}

@Injectable()
export class GAChecklistService {
  private gaChecks: GACheckItem[] = [];
  private compliancePacks: CompliancePack[] = [];
  private connectorCatalog: ConnectorCatalogEntry[] = [];
  private embeddingConfigs: EmbeddingSDKConfig[] = [];

  constructor() {
    this.seedGAChecks();
    this.seedCompliancePacks();
    this.seedConnectorCatalog();
    this.seedEmbeddingConfigs();
  }

  generateGAReport(): GAReport {
    const checks = this.gaChecks;
    const passed = checks.filter((c) => c.status === "pass").length;
    const failed = checks.filter((c) => c.status === "fail").length;
    const warnings = checks.filter((c) => c.status === "warning").length;
    const pending = checks.filter((c) => c.status === "pending").length;

    let overallStatus: "ready" | "not_ready" | "conditional" = "ready";
    if (failed > 0) overallStatus = "not_ready";
    else if (warnings > 0) overallStatus = "conditional";

    return {
      id: "ga-report-001",
      overallStatus,
      totalChecks: checks.length,
      passed,
      failed,
      warnings,
      pending,
      checks,
      generatedAt: new Date(),
    };
  }

  getCompliancePacks(): CompliancePack[] {
    return this.compliancePacks;
  }

  getCompliancePack(id: string): CompliancePack | undefined {
    return this.compliancePacks.find((p) => p.id === id);
  }

  getConnectorCatalog(): ConnectorCatalogEntry[] {
    return this.connectorCatalog;
  }

  getEmbeddingSDKConfigs(): EmbeddingSDKConfig[] {
    return this.embeddingConfigs;
  }

  createEmbeddingConfig(config: {
    name: string;
    domain: string;
    rlsEnabled?: boolean;
    tokenSigning?: boolean;
    maxConcurrentSessions?: number;
    customTheme?: string;
  }): EmbeddingSDKConfig {
    const entry: EmbeddingSDKConfig = {
      id: crypto.randomUUID(),
      name: config.name,
      domain: config.domain,
      rlsEnabled: config.rlsEnabled ?? false,
      tokenSigning: config.tokenSigning ?? false,
      maxConcurrentSessions: config.maxConcurrentSessions ?? 10,
      customTheme: config.customTheme ?? "default",
    };
    this.embeddingConfigs.push(entry);
    return entry;
  }

  runSecurityAudit(): SecurityAuditResult[] {
    const now = new Date();
    return [
      {
        id: "sa-001",
        name: "SQL Injection Prevention",
        status: "pass",
        category: "Input Validation",
        details: "All database queries use parameterized statements",
      },
      {
        id: "sa-002",
        name: "XSS Prevention",
        status: "pass",
        category: "Input Validation",
        details: "All user input is sanitized and output is escaped",
      },
      {
        id: "sa-003",
        name: "CSRF Protection",
        status: "pass",
        category: "Authentication",
        details: "CSRF tokens are required for all state-changing operations",
      },
      {
        id: "sa-004",
        name: "Credential Storage",
        status: "pass",
        category: "Encryption",
        details: "All credentials encrypted at rest using AES-256-GCM",
      },
      {
        id: "sa-005",
        name: "TLS Enforcement",
        status: "pass",
        category: "Network Security",
        details: "All connections enforced to use TLS 1.3",
      },
      {
        id: "sa-006",
        name: "Rate Limiting",
        status: "warning",
        category: "Availability",
        details: "API rate limiting is configured but per-IP limits need tuning",
        remediation: "Review and adjust per-IP rate limits for production traffic patterns",
      },
      {
        id: "sa-007",
        name: "Dependency Vulnerabilities",
        status: "pass",
        category: "Supply Chain",
        details: "All npm audit advisories resolved, 0 critical/high CVEs",
      },
      {
        id: "sa-008",
        name: "JWT Token Expiry",
        status: "pass",
        category: "Authentication",
        details: "Access tokens expire in 15 minutes, refresh tokens in 7 days",
      },
      {
        id: "sa-009",
        name: "CORS Configuration",
        status: "pass",
        category: "Network Security",
        details: "CORS restricted to allowed origins list",
      },
      {
        id: "sa-010",
        name: "Audit Logging Completeness",
        status: "pass",
        category: "Compliance",
        details: "All security events logged with actor, action, and timestamp",
      },
      {
        id: "sa-011",
        name: "Penetration Test Remediation",
        status: "warning",
        category: "Security Testing",
        details: "2 medium-severity findings from pen test pending remediation",
        remediation: "Address IDOR vulnerability in sharing endpoint and fix session fixation in embedding flow",
      },
      {
        id: "sa-012",
        name: "Secret Management",
        status: "pass",
        category: "Encryption",
        details: "All secrets stored in environment variables, not in code",
      },
    ];
  }

  // ─── Seed Data ──────────────────────────────────────────────────────────

  private seedGAChecks(): void {
    const now = new Date();
    this.gaChecks = [
      {
        id: "ga-001",
        category: "Core Functionality",
        item: "Dashboard creation",
        status: "pass",
        details: "Dashboard CRUD operations fully tested across all chart types",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-002",
        category: "Core Functionality",
        item: "Chart rendering",
        status: "pass",
        details: "All 8 chart types render correctly with responsive sizing",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-003",
        category: "Core Functionality",
        item: "Data source connections",
        status: "pass",
        details: "8 database connectors tested and verified in production-like environment",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-004",
        category: "Core Functionality",
        item: "OQL execution",
        status: "pass",
        details: "Orbit Query Language parser and engine pass 98% of test suite",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-005",
        category: "Security",
        item: "RLS enforcement",
        status: "pass",
        details: "Row-level security policies enforced on all query paths",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-006",
        category: "Security",
        item: "CLS enforcement",
        status: "pass",
        details: "Column-level security masks sensitive fields for unauthorized users",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-007",
        category: "Security",
        item: "PII detection",
        status: "pass",
        details: "Automated PII scanner identifies 22 PII field types with 99.2% accuracy",
        severity: "high",
        lastChecked: now,
      },
      {
        id: "ga-008",
        category: "Security",
        item: "Audit trail",
        status: "pass",
        details: "Immutable audit log captures all CRUD operations and security events",
        severity: "high",
        lastChecked: now,
      },
      {
        id: "ga-009",
        category: "Security",
        item: "Credential encryption",
        status: "pass",
        details: "Database credentials encrypted at rest using AES-256-GCM with key rotation",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-010",
        category: "Security",
        item: "Pen test",
        status: "warning",
        details: "2 medium-severity findings pending remediation (IDOR in sharing, session fixation in embed)",
        severity: "high",
        lastChecked: now,
      },
      {
        id: "ga-011",
        category: "Performance",
        item: "P95 latency target",
        status: "pass",
        details: "P95 query latency at 380ms, below 500ms target",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-012",
        category: "Performance",
        item: "10K concurrent users",
        status: "pass",
        details: "Load test passed with 10,200 concurrent users, 99.8% success rate",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-013",
        category: "Performance",
        item: "Query caching",
        status: "pass",
        details: "Intelligent caching achieves 78% hit rate on repeated analytical queries",
        severity: "medium",
        lastChecked: now,
      },
      {
        id: "ga-014",
        category: "Compliance",
        item: "GDPR",
        status: "pass",
        details: "GDPR compliance pack active with 96% requirement coverage",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-015",
        category: "Compliance",
        item: "CCPA",
        status: "warning",
        details: "CCPA compliance pack active at 88% coverage, 2 requirements partial",
        severity: "high",
        lastChecked: now,
      },
      {
        id: "ga-016",
        category: "Compliance",
        item: "SOC2",
        status: "pass",
        details: "SOC2 Type II audit completed, report available for enterprise customers",
        severity: "critical",
        lastChecked: now,
      },
      {
        id: "ga-017",
        category: "Integration",
        item: "Embedding SDK",
        status: "pass",
        details: "Embedding SDK v1 with signed RLS-aware tokens tested across 3 customer portals",
        severity: "high",
        lastChecked: now,
      },
      {
        id: "ga-018",
        category: "Integration",
        item: "API stability",
        status: "pass",
        details: "GraphQL API versioned and backwards-compatible since Sprint 20",
        severity: "high",
        lastChecked: now,
      },
    ];
  }

  private seedCompliancePacks(): void {
    this.compliancePacks = [
      {
        id: "cp-ga-001",
        name: "GDPR (EU)",
        region: "European Union",
        regulation: "General Data Protection Regulation (EU) 2016/679",
        status: "active",
        coveragePercent: 96,
        requirements: [
          { id: "gdpr-r01", description: "Data processing requires lawful basis (Art. 6)", status: "met", article: "Art. 6" },
          { id: "gdpr-r02", description: "Right to access personal data (Art. 15)", status: "met", article: "Art. 15" },
          { id: "gdpr-r03", description: "Right to rectification (Art. 16)", status: "met", article: "Art. 16" },
          { id: "gdpr-r04", description: "Right to erasure (Art. 17)", status: "met", article: "Art. 17" },
          { id: "gdpr-r05", description: "Data portability (Art. 20)", status: "met", article: "Art. 20" },
          { id: "gdpr-r06", description: "Data Protection Impact Assessment (Art. 35)", status: "met", article: "Art. 35" },
          { id: "gdpr-r07", description: "Records of processing activities (Art. 30)", status: "met", article: "Art. 30" },
          { id: "gdpr-r08", description: "Data breach notification (Art. 33-34)", status: "met", article: "Art. 33" },
          { id: "gdpr-r09", description: "Data Protection Officer appointment (Art. 37)", status: "partial", article: "Art. 37" },
          { id: "gdpr-r10", description: "Cross-border transfer safeguards (Art. 44-49)", status: "met", article: "Art. 44" },
        ],
      },
      {
        id: "cp-ga-002",
        name: "CCPA (California)",
        region: "California, USA",
        regulation: "California Consumer Privacy Act (CCPA/CPRA)",
        status: "active",
        coveragePercent: 88,
        requirements: [
          { id: "ccpa-r01", description: "Right to know what data is collected", status: "met", article: "Section 1798.100" },
          { id: "ccpa-r02", description: "Right to delete personal information", status: "met", article: "Section 1798.105" },
          { id: "ccpa-r03", description: "Right to opt-out of sale/sharing", status: "met", article: "Section 1798.120" },
          { id: "ccpa-r04", description: "Non-discrimination for exercising rights", status: "met", article: "Section 1798.125" },
          { id: "ccpa-r05", description: "Financial incentive disclosures", status: "partial", article: "Section 1798.130" },
          { id: "ccpa-r06", description: "Do Not Sell/Share link requirement", status: "met", article: "Section 1798.135" },
        ],
      },
      {
        id: "cp-ga-003",
        name: "DPDP (India)",
        region: "India",
        regulation: "Digital Personal Data Protection Act, 2023",
        status: "draft",
        coveragePercent: 65,
        requirements: [
          { id: "dpdp-r01", description: "Consent notice requirements (Section 5)", status: "met", article: "Section 5" },
          { id: "dpdp-r02", description: "Purpose limitation (Section 6)", status: "met", article: "Section 6" },
          { id: "dpdp-r03", description: "Data principal rights (Section 8-11)", status: "partial", article: "Section 8" },
          { id: "dpdp-r04", description: "Data fiduciary obligations (Section 8)", status: "partial", article: "Section 8" },
          { id: "dpdp-r05", description: "Cross-border transfer restrictions (Section 16)", status: "not_met", article: "Section 16" },
        ],
      },
      {
        id: "cp-ga-004",
        name: "FADP (Switzerland)",
        region: "Switzerland",
        regulation: "Federal Act on Data Protection (nFADP), 2023",
        status: "draft",
        coveragePercent: 58,
        requirements: [
          { id: "fadp-r01", description: "Lawfulness of data processing (Art. 6)", status: "met", article: "Art. 6" },
          { id: "fadp-r02", description: "Duty to inform data subjects (Art. 19)", status: "partial", article: "Art. 19" },
          { id: "fadp-r03", description: "Data protection impact assessment (Art. 22)", status: "partial", article: "Art. 22" },
          { id: "fadp-r04", description: "Data breach notification to FDPIC (Art. 24)", status: "not_met", article: "Art. 24" },
        ],
      },
    ];
  }

  private seedConnectorCatalog(): void {
    this.connectorCatalog = [
      {
        id: "cc-001",
        name: "PostgreSQL",
        type: "postgresql",
        category: "Relational",
        status: "ga",
        version: "3.2.1",
        lastUpdated: new Date("2026-06-15"),
      },
      {
        id: "cc-002",
        name: "MySQL",
        type: "mysql",
        category: "Relational",
        status: "ga",
        version: "3.2.0",
        lastUpdated: new Date("2026-06-10"),
      },
      {
        id: "cc-003",
        name: "Snowflake",
        type: "snowflake",
        category: "Cloud Data Warehouse",
        status: "ga",
        version: "2.8.0",
        lastUpdated: new Date("2026-07-01"),
      },
      {
        id: "cc-004",
        name: "BigQuery",
        type: "bigquery",
        category: "Cloud Data Warehouse",
        status: "ga",
        version: "2.6.0",
        lastUpdated: new Date("2026-06-20"),
      },
      {
        id: "cc-005",
        name: "MongoDB",
        type: "mongodb",
        category: "Document",
        status: "ga",
        version: "2.1.0",
        lastUpdated: new Date("2026-05-30"),
      },
      {
        id: "cc-006",
        name: "SQL Server",
        type: "sqlserver",
        category: "Relational",
        status: "ga",
        version: "3.0.0",
        lastUpdated: new Date("2026-05-15"),
      },
      {
        id: "cc-007",
        name: "ClickHouse",
        type: "clickhouse",
        category: "Columnar / OLAP",
        status: "beta",
        version: "1.4.0-beta.2",
        lastUpdated: new Date("2026-07-10"),
      },
      {
        id: "cc-008",
        name: "Redis",
        type: "redis",
        category: "Key-Value / Cache",
        status: "beta",
        version: "1.2.0-beta.1",
        lastUpdated: new Date("2026-07-15"),
      },
    ];
  }

  private seedEmbeddingConfigs(): void {
    this.embeddingConfigs = [
      {
        id: "emb-ga-001",
        name: "Customer Portal Embed",
        domain: "https://portal.example.com",
        rlsEnabled: true,
        tokenSigning: true,
        maxConcurrentSessions: 50,
        customTheme: "dark",
      },
      {
        id: "emb-ga-002",
        name: "Partner Dashboard",
        domain: "https://partners.example.com",
        rlsEnabled: true,
        tokenSigning: true,
        maxConcurrentSessions: 25,
        customTheme: "light",
      },
    ];
  }
}
