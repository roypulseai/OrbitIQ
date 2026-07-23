"use client";

import { useState } from "react";
import {
  ScrollText,
  Download,
  ChevronDown,
  Filter,
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  target: string;
  details: string;
  ip: string;
  status: "success" | "denied";
  type: string;
}

const EVENT_TYPES = ["All", "Policy Changed", "Query Executed", "Export", "Login", "RLS Enforced"];
const STATUS_FILTERS = ["All", "Success", "Denied"];
const USER_FILTERS = ["All", "alice@acme.com", "bob@acme.com", "carol@acme.com", "admin@orbitiq.dev"];

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2 min ago",
    event: "Policy Created",
    user: "admin@orbitiq.dev",
    target: "Region Filter",
    details: "Created RLS policy on Sales table with expression USERATTRIBUTE(\"region\") = \"US\"",
    ip: "192.168.1.100",
    status: "success",
    type: "Policy Changed",
  },
  {
    id: "2",
    timestamp: "8 min ago",
    event: "RLS Enforced",
    user: "bob@acme.com",
    target: "Sales",
    details: "Query filtered to EU region rows only (3 of 1,247 rows returned)",
    ip: "10.0.0.55",
    status: "success",
    type: "RLS Enforced",
  },
  {
    id: "3",
    timestamp: "15 min ago",
    event: "Access Denied",
    user: "bob@acme.com",
    target: "Employee",
    details: "RLS policy \"Department Restriction\" blocked access — user role not in [editor]",
    ip: "10.0.0.55",
    status: "denied",
    type: "RLS Enforced",
  },
  {
    id: "4",
    timestamp: "32 min ago",
    event: "Policy Updated",
    user: "admin@orbitiq.dev",
    target: "Manager Hierarchy",
    details: "Changed priority from 10 to 5, added editor role",
    ip: "192.168.1.100",
    status: "success",
    type: "Policy Changed",
  },
  {
    id: "5",
    timestamp: "1 hour ago",
    event: "Query Executed",
    user: "alice@acme.com",
    target: "Sales",
    details: "SELECT * FROM Sales WHERE date >= '2025-01-01' — 842 rows returned with RLS",
    ip: "10.0.0.12",
    status: "success",
    type: "Query Executed",
  },
  {
    id: "6",
    timestamp: "1 hour ago",
    event: "Export Started",
    user: "carol@acme.com",
    target: "Financials",
    details: "CSV export of 312 rows with RLS applied (cost_center = CC001)",
    ip: "10.0.0.88",
    status: "success",
    type: "Export",
  },
  {
    id: "7",
    timestamp: "2 hours ago",
    event: "Login",
    user: "alice@acme.com",
    target: "—",
    details: "Successful login via SSO (Okta)",
    ip: "10.0.0.12",
    status: "success",
    type: "Login",
  },
  {
    id: "8",
    timestamp: "2 hours ago",
    event: "Access Denied",
    user: "dave@acme.com",
    target: "Financials",
    details: "RLS policy \"Cost Center Guard\" blocked access — user cost_center CC003 ≠ CC001",
    ip: "10.0.0.99",
    status: "denied",
    type: "RLS Enforced",
  },
  {
    id: "9",
    timestamp: "3 hours ago",
    event: "Policy Deleted",
    user: "admin@orbitiq.dev",
    target: "Legacy Dept Filter",
    details: "Removed deprecated department filter policy from Employee table",
    ip: "192.168.1.100",
    status: "success",
    type: "Policy Changed",
  },
  {
    id: "10",
    timestamp: "4 hours ago",
    event: "Login",
    user: "bob@acme.com",
    target: "—",
    details: "Successful login via password",
    ip: "10.0.0.55",
    status: "success",
    type: "Login",
  },
  {
    id: "11",
    timestamp: "5 hours ago",
    event: "Query Executed",
    user: "admin@orbitiq.dev",
    target: "Reports",
    details: "SELECT * FROM Reports — 2,048 rows returned (admin bypass)",
    ip: "192.168.1.100",
    status: "success",
    type: "Query Executed",
  },
  {
    id: "12",
    timestamp: "6 hours ago",
    event: "Export Started",
    user: "alice@acme.com",
    target: "Sales",
    details: "PDF export of dashboard with 1,180 rows filtered by region = US",
    ip: "10.0.0.12",
    status: "success",
    type: "Export",
  },
];

export default function AuditPage() {
  const [eventFilter, setEventFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("Last 24 hours");

  const filtered = MOCK_AUDIT.filter((entry) => {
    if (eventFilter !== "All" && entry.type !== eventFilter) return false;
    if (userFilter !== "All" && entry.user !== userFilter) return false;
    if (statusFilter === "Success" && entry.status !== "success") return false;
    if (statusFilter === "Denied" && entry.status !== "denied") return false;
    return true;
  });

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-accent" />
            Security Audit Log
          </h1>
          <p className="text-sm text-muted mt-1">
            Immutable record of all security-related events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-dark pr-8 appearance-none cursor-pointer text-xs"
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>All time</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface-card p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-xs text-white/40 font-medium">Filters:</span>
          </div>
          <div className="relative">
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="input-dark pr-8 appearance-none cursor-pointer text-xs min-w-[160px]"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t === "All" ? "All Events" : t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="input-dark pr-8 appearance-none cursor-pointer text-xs min-w-[160px]"
            >
              {USER_FILTERS.map((u) => (
                <option key={u} value={u}>{u === "All" ? "All Users" : u}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark pr-8 appearance-none cursor-pointer text-xs min-w-[140px]"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
          <span className="text-xs text-white/40 ml-auto">{filtered.length} entries</span>
        </div>
      </div>

      {/* Audit Table */}
      <div className="surface-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Timestamp</th>
                <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Event</th>
                <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">User</th>
                <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Target</th>
                <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Details</th>
                <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">IP Address</th>
                <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4 text-xs text-white/50 whitespace-nowrap">{entry.timestamp}</td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium text-white">{entry.event}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-white/60">{entry.user}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 text-white/70 text-xs font-medium">
                      {entry.target}
                    </span>
                  </td>
                  <td className="py-3 pr-4 max-w-[320px]">
                    <span className="text-xs text-white/50 truncate block">{entry.details}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <code className="text-xs font-mono text-white/40">{entry.ip}</code>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === "success"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          entry.status === "success" ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                      {entry.status === "success" ? "Success" : "Denied"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/40 text-sm">
            No audit entries match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
