"use client";

import { useState } from "react";
import {
  FileText,
  Shield,
  AlertTriangle,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AuditEvent {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  target: string;
  details: string;
  severity: "info" | "warning" | "critical";
  ip: string;
  jsonDetails?: Record<string, unknown>;
}

const MOCK_AUDIT: AuditEvent[] = [
  {
    id: "1",
    timestamp: "2 min ago",
    event: "Policy Created",
    actor: "admin@orbitiq.dev",
    target: "RLS Policy: Region Filter",
    details: "Created row-level security policy for Sales table",
    severity: "info",
    ip: "192.168.1.100",
    jsonDetails: { policy_id: "rls_001", table: "Sales", expression: 'USERATTRIBUTE("region") = "US"' },
  },
  {
    id: "2",
    timestamp: "5 min ago",
    event: "Query Executed",
    actor: "alice@acme.com",
    target: "Sales Analytics",
    details: "RLS enforced: 3 row policies applied",
    severity: "info",
    ip: "10.0.0.45",
    jsonDetails: { query_id: "q_892", policies_applied: 3, rows_returned: 1247 },
  },
  {
    id: "3",
    timestamp: "12 min ago",
    event: "Data Export",
    actor: "bob@acme.com",
    target: "Financial Report Q2",
    details: "PDF export completed (24 pages)",
    severity: "warning",
    ip: "10.0.0.78",
    jsonDetails: { format: "PDF", pages: 24, file_size: "2.4 MB" },
  },
  {
    id: "4",
    timestamp: "18 min ago",
    event: "RLS Bypass Attempt",
    actor: "unknown",
    target: "Employees Table",
    details: "Unauthorized attempt to bypass row-level security",
    severity: "critical",
    ip: "203.0.113.42",
    jsonDetails: { attempted_by: "service_account_3", policy_bypassed: "dept_restriction", blocked: true },
  },
  {
    id: "5",
    timestamp: "25 min ago",
    event: "DSAR Request",
    actor: "carol@acme.com",
    target: "User Data Export",
    details: "Data portability request initiated",
    severity: "info",
    ip: "10.0.0.92",
    jsonDetails: { request_type: "portability", data_categories: ["profile", "activity", "preferences"] },
  },
  {
    id: "6",
    timestamp: "32 min ago",
    event: "Policy Updated",
    actor: "admin@orbitiq.dev",
    target: "CLS Policy: Salary Column",
    details: "Column-level security policy updated for Employees table",
    severity: "info",
    ip: "192.168.1.100",
    jsonDetails: { policy_id: "cls_003", column: "salary", action: "mask", mask_type: "partial" },
  },
  {
    id: "7",
    timestamp: "41 min ago",
    event: "Login",
    actor: "dave@acme.com",
    target: "OrbitIQ Platform",
    details: "Successful login via SSO",
    severity: "info",
    ip: "10.0.0.112",
    jsonDetails: { method: "SSO", provider: "Okta", mfa: true },
  },
  {
    id: "8",
    timestamp: "52 min ago",
    event: "Compliance Eval",
    actor: "System",
    target: "GDPR Pack",
    details: "Compliance evaluation passed (98.2% score)",
    severity: "info",
    ip: "-",
    jsonDetails: { pack: "GDPR", score: 98.2, violations: 0, warnings: 2 },
  },
  {
    id: "9",
    timestamp: "1 hr ago",
    event: "Data Export",
    actor: "eve@acme.com",
    target: "Customer Analytics",
    details: "CSV export completed (1,247 rows)",
    severity: "info",
    ip: "10.0.0.55",
    jsonDetails: { format: "CSV", rows: 1247, file_size: "340 KB" },
  },
  {
    id: "10",
    timestamp: "1.5 hr ago",
    event: "Unauthorized Access",
    actor: "service_account_2",
    target: "Financials Table",
    details: "Access denied: missing required role",
    severity: "critical",
    ip: "10.0.0.200",
    jsonDetails: { required_role: "finance_admin", actual_role: "viewer", blocked: true },
  },
  {
    id: "11",
    timestamp: "2 hr ago",
    event: "DSAR Request",
    actor: "alice@acme.com",
    target: "User Data Export",
    details: "Export request completed and delivered",
    severity: "info",
    ip: "10.0.0.45",
    jsonDetails: { request_id: "DSAR-001", format: "JSON", delivery: "secure_link" },
  },
  {
    id: "12",
    timestamp: "2.5 hr ago",
    event: "Policy Deleted",
    actor: "admin@orbitiq.dev",
    target: "RLS Policy: Legacy Filter",
    details: "Removed deprecated row-level security policy",
    severity: "warning",
    ip: "192.168.1.100",
    jsonDetails: { policy_id: "rls_012", reason: "deprecated" },
  },
  {
    id: "13",
    timestamp: "3 hr ago",
    event: "CLS Applied",
    actor: "System",
    target: "Employees.SSN",
    details: "Column masking applied per policy cls_004",
    severity: "info",
    ip: "-",
    jsonDetails: { column: "ssn", mask_type: "full", user_role: "viewer" },
  },
  {
    id: "14",
    timestamp: "3.5 hr ago",
    event: "Login Failed",
    actor: "unknown",
    target: "OrbitIQ Platform",
    details: "Invalid credentials (3rd attempt)",
    severity: "warning",
    ip: "198.51.100.77",
    jsonDetails: { attempts: 3, locked: false, method: "password" },
  },
  {
    id: "15",
    timestamp: "4 hr ago",
    event: "Compliance Eval",
    actor: "System",
    target: "CCPA Pack",
    details: "Compliance evaluation passed (95.8% score)",
    severity: "info",
    ip: "-",
    jsonDetails: { pack: "CCPA", score: 95.8, violations: 0, warnings: 4 },
  },
];

const EVENT_TYPES = [
  "All", "Policy Change", "Query Executed", "Data Export",
  "DSAR Request", "Login", "RLS Applied", "CLS Applied", "Compliance Eval",
];
const SEVERITIES = ["All", "Info", "Warning", "Critical"];

export default function AuditTrailPage() {
  const [events] = useState(MOCK_AUDIT);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [eventType, setEventType] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [complianceOnly, setComplianceOnly] = useState(false);

  const filteredEvents = events.filter((e) => {
    if (eventType !== "All" && !e.event.includes(eventType.replace(" ", ""))) return false;
    if (severity !== "All" && e.severity !== severity.toLowerCase()) return false;
    if (complianceOnly && !["Policy Created", "Policy Updated", "Policy Deleted", "Compliance Eval", "DSAR Request", "RLS Applied", "CLS Applied"].includes(e.event)) return false;
    return true;
  });

  const stats = [
    { label: "Total Events", value: "1,247", color: "text-blue-400", bg: "bg-blue-500/10", icon: FileText },
    { label: "Compliance Events", value: "342", color: "text-purple-400", bg: "bg-purple-500/10", icon: Shield },
    { label: "Critical Events", value: "12", color: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle },
    { label: "Today's Events", value: "23", color: "text-green-400", bg: "bg-green-500/10", icon: Clock },
  ];

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-accent" />
            Audit Trail
          </h1>
          <p className="text-surface-6 text-sm mt-1">
            Immutable, append-only record of all platform events
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-6">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-2 border border-border rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-6">Event Type:</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-white appearance-none cursor-pointer pr-8"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-6">Severity:</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-white appearance-none cursor-pointer pr-8"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
          <input
            type="checkbox"
            checked={complianceOnly}
            onChange={(e) => setComplianceOnly(e.target.checked)}
            className="rounded border-border"
          />
          Compliance Only
        </label>
        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-6">From:</label>
          <input type="date" className="bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-white" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-6">To:</label>
          <input type="date" className="bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-white" />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            Audit Log ({filteredEvents.length} events)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase w-8"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Details</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <>
                  <tr
                    key={event.id}
                    onClick={() => setExpanded(expanded === event.id ? null : event.id)}
                    className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      {expanded === event.id ? (
                        <ChevronUp className="w-4 h-4 text-surface-6" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-surface-6" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 whitespace-nowrap">{event.timestamp}</td>
                    <td className="px-4 py-3 text-sm font-medium text-white">{event.event}</td>
                    <td className="px-4 py-3 text-sm text-white/70">{event.actor}</td>
                    <td className="px-4 py-3 text-sm text-white/70 max-w-[200px] truncate">{event.target}</td>
                    <td className="px-4 py-3 text-sm text-white/60 max-w-[250px] truncate">{event.details}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.severity === "info"
                          ? "bg-blue-500/10 text-blue-400"
                          : event.severity === "warning"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          event.severity === "info"
                            ? "bg-blue-400"
                            : event.severity === "warning"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`} />
                        {event.severity === "info" ? "Info" : event.severity === "warning" ? "Warning" : "Critical"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 font-mono">{event.ip}</td>
                  </tr>
                  {expanded === event.id && event.jsonDetails && (
                    <tr key={`${event.id}-detail`}>
                      <td colSpan={8} className="px-4 py-3 bg-surface-3/50">
                        <pre className="text-xs font-mono text-white/70 whitespace-pre-wrap">
                          {JSON.stringify(event.jsonDetails, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
