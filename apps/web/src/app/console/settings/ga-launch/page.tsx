"use client";

import { useState } from "react";
import {
  Rocket,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Circle,
  Shield,
  Database,
  Zap,
  FileCheck,
  Plug,
  RefreshCw,
  Plus,
  Eye,
  Lock,
  Globe,
  Code,
} from "lucide-react";

interface GACheckItem {
  id: string;
  category: string;
  item: string;
  status: "pass" | "fail" | "warning" | "pending";
  details: string;
  severity: "critical" | "high" | "medium" | "low";
  lastChecked: string;
}

interface CompliancePack {
  id: string;
  name: string;
  region: string;
  regulation: string;
  status: "active" | "draft" | "deprecated";
  requirementsCount: number;
  coveragePercent: number;
}

interface ConnectorCatalogEntry {
  id: string;
  name: string;
  type: string;
  category: string;
  status: "ga" | "beta" | "alpha";
  version: string;
  lastUpdated: string;
}

interface EmbeddingConfig {
  id: string;
  name: string;
  domain: string;
  rlsEnabled: boolean;
  tokenSigning: boolean;
  maxConcurrentSessions: number;
  customTheme: string;
}

interface SecurityAuditResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning";
  category: string;
  details: string;
  remediation?: string;
}

const MOCK_CHECKS: GACheckItem[] = [
  { id: "ga-001", category: "Core Functionality", item: "Dashboard creation", status: "pass", details: "Dashboard CRUD operations fully tested across all chart types", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-002", category: "Core Functionality", item: "Chart rendering", status: "pass", details: "All 8 chart types render correctly with responsive sizing", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-003", category: "Core Functionality", item: "Data source connections", status: "pass", details: "8 database connectors tested and verified in production-like environment", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-004", category: "Core Functionality", item: "OQL execution", status: "pass", details: "Orbit Query Language parser and engine pass 98% of test suite", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-005", category: "Security", item: "RLS enforcement", status: "pass", details: "Row-level security policies enforced on all query paths", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-006", category: "Security", item: "CLS enforcement", status: "pass", details: "Column-level security masks sensitive fields for unauthorized users", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-007", category: "Security", item: "PII detection", status: "pass", details: "Automated PII scanner identifies 22 PII field types with 99.2% accuracy", severity: "high", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-008", category: "Security", item: "Audit trail", status: "pass", details: "Immutable audit log captures all CRUD operations and security events", severity: "high", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-009", category: "Security", item: "Credential encryption", status: "pass", details: "Database credentials encrypted at rest using AES-256-GCM with key rotation", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-010", category: "Security", item: "Pen test", status: "warning", details: "2 medium-severity findings pending remediation", severity: "high", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-011", category: "Performance", item: "P95 latency target", status: "pass", details: "P95 query latency at 380ms, below 500ms target", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-012", category: "Performance", item: "10K concurrent users", status: "pass", details: "Load test passed with 10,200 concurrent users, 99.8% success rate", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-013", category: "Performance", item: "Query caching", status: "pass", details: "Intelligent caching achieves 78% hit rate on repeated analytical queries", severity: "medium", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-014", category: "Compliance", item: "GDPR", status: "pass", details: "GDPR compliance pack active with 96% requirement coverage", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-015", category: "Compliance", item: "CCPA", status: "warning", details: "CCPA compliance pack active at 88% coverage, 2 requirements partial", severity: "high", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-016", category: "Compliance", item: "SOC2", status: "pass", details: "SOC2 Type II audit completed, report available for enterprise customers", severity: "critical", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-017", category: "Integration", item: "Embedding SDK", status: "pass", details: "Embedding SDK v1 with signed RLS-aware tokens tested across 3 customer portals", severity: "high", lastChecked: "2026-07-24T10:00:00Z" },
  { id: "ga-018", category: "Integration", item: "API stability", status: "pass", details: "GraphQL API versioned and backwards-compatible since Sprint 20", severity: "high", lastChecked: "2026-07-24T10:00:00Z" },
];

const MOCK_COMPLIANCE_PACKS: CompliancePack[] = [
  { id: "cp-ga-001", name: "GDPR (EU)", region: "European Union", regulation: "General Data Protection Regulation (EU) 2016/679", status: "active", requirementsCount: 24, coveragePercent: 96 },
  { id: "cp-ga-002", name: "CCPA (California)", region: "California, USA", regulation: "California Consumer Privacy Act (CCPA/CPRA)", status: "active", requirementsCount: 18, coveragePercent: 88 },
  { id: "cp-ga-003", name: "DPDP (India)", region: "India", regulation: "Digital Personal Data Protection Act, 2023", status: "draft", requirementsCount: 16, coveragePercent: 65 },
  { id: "cp-ga-004", name: "FADP (Switzerland)", region: "Switzerland", regulation: "Federal Act on Data Protection (nFADP), 2023", status: "draft", requirementsCount: 14, coveragePercent: 58 },
];

const MOCK_CONNECTORS: ConnectorCatalogEntry[] = [
  { id: "cc-001", name: "PostgreSQL", type: "postgresql", category: "Relational", status: "ga", version: "3.2.1", lastUpdated: "2026-06-15" },
  { id: "cc-002", name: "MySQL", type: "mysql", category: "Relational", status: "ga", version: "3.2.0", lastUpdated: "2026-06-10" },
  { id: "cc-003", name: "Snowflake", type: "snowflake", category: "Cloud Data Warehouse", status: "ga", version: "2.8.0", lastUpdated: "2026-07-01" },
  { id: "cc-004", name: "BigQuery", type: "bigquery", category: "Cloud Data Warehouse", status: "ga", version: "2.6.0", lastUpdated: "2026-06-20" },
  { id: "cc-005", name: "MongoDB", type: "mongodb", category: "Document", status: "ga", version: "2.1.0", lastUpdated: "2026-05-30" },
  { id: "cc-006", name: "SQL Server", type: "sqlserver", category: "Relational", status: "ga", version: "3.0.0", lastUpdated: "2026-05-15" },
  { id: "cc-007", name: "ClickHouse", type: "clickhouse", category: "Columnar / OLAP", status: "beta", version: "1.4.0-beta.2", lastUpdated: "2026-07-10" },
  { id: "cc-008", name: "Redis", type: "redis", category: "Key-Value / Cache", status: "beta", version: "1.2.0-beta.1", lastUpdated: "2026-07-15" },
];

const MOCK_EMBEDDING_CONFIGS: EmbeddingConfig[] = [
  { id: "emb-ga-001", name: "Customer Portal Embed", domain: "https://portal.example.com", rlsEnabled: true, tokenSigning: true, maxConcurrentSessions: 50, customTheme: "dark" },
  { id: "emb-ga-002", name: "Partner Dashboard", domain: "https://partners.example.com", rlsEnabled: true, tokenSigning: true, maxConcurrentSessions: 25, customTheme: "light" },
];

const MOCK_SECURITY_AUDIT: SecurityAuditResult[] = [
  { id: "sa-001", name: "SQL Injection Prevention", status: "pass", category: "Input Validation", details: "All database queries use parameterized statements" },
  { id: "sa-002", name: "XSS Prevention", status: "pass", category: "Input Validation", details: "All user input is sanitized and output is escaped" },
  { id: "sa-003", name: "CSRF Protection", status: "pass", category: "Authentication", details: "CSRF tokens are required for all state-changing operations" },
  { id: "sa-004", name: "Credential Storage", status: "pass", category: "Encryption", details: "All credentials encrypted at rest using AES-256-GCM" },
  { id: "sa-005", name: "TLS Enforcement", status: "pass", category: "Network Security", details: "All connections enforced to use TLS 1.3" },
  { id: "sa-006", name: "Rate Limiting", status: "warning", category: "Availability", details: "API rate limiting is configured but per-IP limits need tuning", remediation: "Review and adjust per-IP rate limits for production traffic patterns" },
  { id: "sa-007", name: "Dependency Vulnerabilities", status: "pass", category: "Supply Chain", details: "All npm audit advisories resolved, 0 critical/high CVEs" },
  { id: "sa-008", name: "JWT Token Expiry", status: "pass", category: "Authentication", details: "Access tokens expire in 15 minutes, refresh tokens in 7 days" },
  { id: "sa-009", name: "CORS Configuration", status: "pass", category: "Network Security", details: "CORS restricted to allowed origins list" },
  { id: "sa-010", name: "Audit Logging Completeness", status: "pass", category: "Compliance", details: "All security events logged with actor, action, and timestamp" },
  { id: "sa-011", name: "Penetration Test Remediation", status: "warning", category: "Security Testing", details: "2 medium-severity findings from pen test pending remediation", remediation: "Address IDOR vulnerability in sharing endpoint and fix session fixation in embedding flow" },
  { id: "sa-012", name: "Secret Management", status: "pass", category: "Encryption", details: "All secrets stored in environment variables, not in code" },
];

const CATEGORIES = ["Core Functionality", "Security", "Performance", "Compliance", "Integration"];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Core Functionality": <Rocket className="w-4 h-4" />,
  Security: <Shield className="w-4 h-4" />,
  Performance: <Zap className="w-4 h-4" />,
  Compliance: <FileCheck className="w-4 h-4" />,
  Integration: <Plug className="w-4 h-4" />,
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pass":
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case "fail":
      return <XCircle className="w-4 h-4 text-red-400" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    default:
      return <Circle className="w-4 h-4 text-slate-500" />;
  }
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-300 border-red-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${colors[severity] || colors.low}`}>
      {severity}
    </span>
  );
}

function OverallStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ready: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    conditional: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    not_ready: "bg-red-500/20 text-red-300 border-red-500/40",
  };
  const labels: Record<string, string> = {
    ready: "Ready",
    conditional: "Conditional",
    not_ready: "Not Ready",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${colors[status] || colors.not_ready}`}>
      {labels[status] || status}
    </span>
  );
}

function ConnectorStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ga: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    beta: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    alpha: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border uppercase ${colors[status] || ""}`}>
      {status}
    </span>
  );
}

function PackStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    draft: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    deprecated: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize ${colors[status] || ""}`}>
      {status}
    </span>
  );
}

export default function GALaunchPage() {
  const [checks] = useState<GACheckItem[]>(MOCK_CHECKS);
  const [compliancePacks] = useState<CompliancePack[]>(MOCK_COMPLIANCE_PACKS);
  const [connectors] = useState<ConnectorCatalogEntry[]>(MOCK_CONNECTORS);
  const [embeddingConfigs, setEmbeddingConfigs] = useState<EmbeddingConfig[]>(MOCK_EMBEDDING_CONFIGS);
  const [securityAudit] = useState<SecurityAuditResult[]>(MOCK_SECURITY_AUDIT);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showNewEmbedForm, setShowNewEmbedForm] = useState(false);
  const [newEmbed, setNewEmbed] = useState({ name: "", domain: "", rlsEnabled: true, tokenSigning: true, maxConcurrentSessions: 10, customTheme: "dark" });

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warning").length;
  const pending = checks.filter((c) => c.status === "pending").length;
  const overallStatus = failed > 0 ? "not_ready" : warnings > 0 ? "conditional" : "ready";

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => setIsAuditing(false), 2000);
  };

  const handleCreateEmbed = () => {
    if (!newEmbed.name || !newEmbed.domain) return;
    const config: EmbeddingConfig = {
      id: `emb-new-${Date.now()}`,
      ...newEmbed,
    };
    setEmbeddingConfigs([...embeddingConfigs, config]);
    setNewEmbed({ name: "", domain: "", rlsEnabled: true, tokenSigning: true, maxConcurrentSessions: 10, customTheme: "dark" });
    setShowNewEmbedForm(false);
  };

  const secPassed = securityAudit.filter((s) => s.status === "pass").length;
  const secFailed = securityAudit.filter((s) => s.status === "fail").length;
  const secWarnings = securityAudit.filter((s) => s.status === "warning").length;

  return (
    <div className="page-content animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
              <Rocket className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">GA Launch Checklist</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 ml-12">Readiness assessment for production launch</p>
        </div>
        <div className="flex items-center gap-3">
          <OverallStatusBadge status={overallStatus} />
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAuditing ? "animate-spin" : ""}`} />
            {isAuditing ? "Running..." : "Run Audit"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="surface-card p-5 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Check Progress</h2>
          <span className="text-xs text-slate-400">{checks.length} total checks</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
          {passed > 0 && (
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${(passed / checks.length) * 100}%` }}
            />
          )}
          {warnings > 0 && (
            <div
              className="bg-amber-500 transition-all duration-500"
              style={{ width: `${(warnings / checks.length) * 100}%` }}
            />
          )}
          {failed > 0 && (
            <div
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${(failed / checks.length) * 100}%` }}
            />
          )}
          {pending > 0 && (
            <div
              className="bg-slate-600 transition-all duration-500"
              style={{ width: `${(pending / checks.length) * 100}%` }}
            />
          )}
        </div>
        <div className="flex items-center gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Passed: {passed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-400">Warnings: {warnings}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400">Failed: {failed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-400">Pending: {pending}</span>
          </div>
        </div>
      </div>

      {/* Checklist by Category */}
      {CATEGORIES.map((cat) => {
        const catChecks = checks.filter((c) => c.category === cat);
        return (
          <div key={cat} className="surface-card rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-2.5">
              <span className="text-slate-400">{CATEGORY_ICONS[cat]}</span>
              <h3 className="text-sm font-semibold text-slate-200">{cat}</h3>
              <span className="text-xs text-slate-500 ml-auto">
                {catChecks.filter((c) => c.status === "pass").length}/{catChecks.length} passed
              </span>
            </div>
            <div className="divide-y divide-slate-700/30">
              {catChecks.map((check) => (
                <div key={check.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <StatusIcon status={check.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">{check.item}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{check.details}</div>
                  </div>
                  <SeverityBadge severity={check.severity} />
                  <span className="text-[10px] text-slate-600 whitespace-nowrap hidden sm:block">
                    {new Date(check.lastChecked).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Compliance Packs */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <FileCheck className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Compliance Packs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compliancePacks.map((pack) => (
            <div key={pack.id} className="surface-card p-5 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{pack.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{pack.region}</p>
                </div>
                <PackStatusBadge status={pack.status} />
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{pack.regulation}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Coverage</div>
                    <div className="text-sm font-semibold text-slate-200">{pack.coveragePercent}%</div>
                  </div>
                  <div className="w-px h-6 bg-slate-700" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Requirements</div>
                    <div className="text-sm font-semibold text-slate-200">{pack.requirementsCount}</div>
                  </div>
                </div>
                <div className="w-24">
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pack.coveragePercent >= 90 ? "bg-emerald-500" : pack.coveragePercent >= 70 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${pack.coveragePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connector Catalog */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Database className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Connector Catalog</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {connectors.map((conn) => (
            <div key={conn.id} className="surface-card p-4 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors group">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Database className="w-4 h-4 text-slate-400" />
                </div>
                <ConnectorStatusBadge status={conn.status} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mt-2">{conn.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{conn.category}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                <span className="text-[10px] text-slate-500 font-mono">v{conn.version}</span>
                <span className="text-[10px] text-slate-600">Updated {conn.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedding SDK */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Code className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Embedding SDK Configs</h2>
          </div>
          <button
            onClick={() => setShowNewEmbedForm(!showNewEmbedForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New
          </button>
        </div>

        {showNewEmbedForm && (
          <div className="surface-card p-5 rounded-xl border border-violet-500/30 mb-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">New Embedding Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Name</label>
                <input
                  value={newEmbed.name}
                  onChange={(e) => setNewEmbed({ ...newEmbed, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                  placeholder="e.g., Internal Analytics"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Domain</label>
                <input
                  value={newEmbed.domain}
                  onChange={(e) => setNewEmbed({ ...newEmbed, domain: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                  placeholder="https://analytics.example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Max Concurrent Sessions</label>
                <input
                  type="number"
                  value={newEmbed.maxConcurrentSessions}
                  onChange={(e) => setNewEmbed({ ...newEmbed, maxConcurrentSessions: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Theme</label>
                <select
                  value={newEmbed.customTheme}
                  onChange={(e) => setNewEmbed({ ...newEmbed, customTheme: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEmbed.rlsEnabled}
                  onChange={(e) => setNewEmbed({ ...newEmbed, rlsEnabled: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                RLS Enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEmbed.tokenSigning}
                  onChange={(e) => setNewEmbed({ ...newEmbed, tokenSigning: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500"
                />
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Token Signing
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => setShowNewEmbedForm(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEmbed}
                disabled={!newEmbed.name || !newEmbed.domain}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Create
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {embeddingConfigs.map((cfg) => (
            <div key={cfg.id} className="surface-card p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{cfg.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">{cfg.domain}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 font-mono uppercase">{cfg.customTheme}</span>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-1.5">
                  <Lock className={`w-3.5 h-3.5 ${cfg.rlsEnabled ? "text-emerald-400" : "text-slate-600"}`} />
                  <span className={`text-xs ${cfg.rlsEnabled ? "text-slate-300" : "text-slate-600"}`}>RLS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className={`w-3.5 h-3.5 ${cfg.tokenSigning ? "text-emerald-400" : "text-slate-600"}`} />
                  <span className={`text-xs ${cfg.tokenSigning ? "text-slate-300" : "text-slate-600"}`}>Signing</span>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-slate-500">{cfg.maxConcurrentSessions} sessions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Shield className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Security Audit Results</h2>
        </div>
        <div className="surface-card rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400">{secPassed} passed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-slate-400">{secFailed} failed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-400">{secWarnings} warnings</span>
            </div>
          </div>
          <div className="divide-y divide-slate-700/30">
            {securityAudit.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                <StatusIcon status={item.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.details}</div>
                  {item.remediation && (
                    <div className="text-xs text-amber-400/70 mt-1">Fix: {item.remediation}</div>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 px-2 py-0.5 bg-slate-800 rounded">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
