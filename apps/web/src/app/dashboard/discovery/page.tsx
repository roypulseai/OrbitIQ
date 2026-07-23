"use client";

import { useState } from "react";
import { Play, Table2, Columns, ScanSearch, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react";

const MOCK_JOBS = [
  { id: "abc-123", connection: "PostgreSQL Primary", status: "completed", tables: 8, columns: 64, duration: "2m 15s", started: "2 hours ago" },
  { id: "def-456", connection: "Snowflake Analytics", status: "running", tables: 3, totalTables: 12, columns: 18, duration: "15m", started: "15 min ago" },
  { id: "ghi-789", connection: "BigQuery Data Lake", status: "pending", tables: 0, totalTables: 6, columns: 0, duration: "-", started: "just now" },
];

const MOCK_COLUMNS = [
  { name: "customer_id", type: "integer", nullPct: 0, cardinality: 10000, format: "numeric", confidence: 0.99, topValues: [{ v: "10001", c: 200 }, { v: "10002", c: 198 }, { v: "10003", c: 195 }], samples: ["10001", "10002", "10042"] },
  { name: "email", type: "varchar", nullPct: 0.5, cardinality: 9950, format: "email", confidence: 0.98, topValues: [{ v: "john@example.com", c: 3 }, { v: "jane@test.com", c: 2 }], samples: ["john@example.com", "jane@test.com", "bob@demo.io"] },
  { name: "first_name", type: "varchar", nullPct: 0.2, cardinality: 8420, format: "text", confidence: 0.85, topValues: [{ v: "James", c: 120 }, { v: "Mary", c: 110 }, { v: "John", c: 90 }], samples: ["James", "Mary", "John"] },
  { name: "phone", type: "varchar", nullPct: 5.3, cardinality: 7800, format: "phone", confidence: 0.92, topValues: [{ v: "+1-555-0123", c: 1 }, { v: "+1-555-0456", c: 1 }], samples: ["+1-555-0123", "+1-555-0456"] },
  { name: "region", type: "varchar", nullPct: 0, cardinality: 5, format: "text", confidence: 0.70, topValues: [{ v: "US", c: 4000 }, { v: "EU", c: 3000 }, { v: "APAC", c: 2000 }], samples: ["US", "EU", "APAC"] },
  { name: "created_at", type: "timestamp", nullPct: 0, cardinality: 9980, format: "date", confidence: 0.95, topValues: [], samples: ["2024-01-15", "2024-06-20"], min: "2023-01-15", max: "2026-07-20" },
  { name: "lifetime_value", type: "decimal", nullPct: 12.5, cardinality: 8700, format: "currency", confidence: 0.88, topValues: [], samples: ["$1,250.75", "$3,400.00"], min: "$0.00", max: "$45,230.50", mean: "$1,250.75" },
  { name: "status", type: "varchar", nullPct: 0, cardinality: 3, format: "text", confidence: 0.75, topValues: [{ v: "active", c: 6500 }, { v: "inactive", c: 2500 }, { v: "suspended", c: 1000 }], samples: ["active", "inactive", "suspended"] },
];

const FORMAT_COLORS: Record<string, string> = {
  email: "bg-red-500/15 text-red-400",
  phone: "bg-orange-500/15 text-orange-400",
  date: "bg-blue-500/15 text-blue-400",
  currency: "bg-green-500/15 text-green-400",
  numeric: "bg-purple-500/15 text-purple-400",
  text: "bg-white/10 text-white/60",
  boolean: "bg-yellow-500/15 text-yellow-400",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-500/15 text-green-400 border-green-500/20",
  running: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  pending: "bg-white/10 text-white/40 border-white/10",
};

export default function DataDiscoveryPage() {
  const [selectedJob, setSelectedJob] = useState("abc-123");
  const [selectedTable, setSelectedTable] = useState("Customers");

  const stats = [
    { label: "Tables Profiled", value: "24", color: "text-blue-400", icon: Table2 },
    { label: "Columns Analyzed", value: "186", color: "text-purple-400", icon: Columns },
    { label: "Formats Detected", value: "12", color: "text-green-400", icon: ScanSearch },
    { label: "Avg Null %", value: "3.2%", color: "text-yellow-400", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Discovery</h1>
          <p className="text-surface-6 text-sm mt-1">Automated profiling and semantic analysis of connected data sources</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          <Play className="w-4 h-4" /> Run Discovery
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-6">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Profiling Jobs */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Recent Profiling Jobs</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Job ID</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Connection</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Tables</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Columns</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Duration</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Started</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_JOBS.map((job) => (
              <tr
                key={job.id}
                onClick={() => setSelectedJob(job.id)}
                className={`border-b border-border/50 hover:bg-surface-3/30 transition-colors cursor-pointer ${selectedJob === job.id ? "bg-accent/5" : ""}`}
              >
                <td className="px-4 py-3 text-sm font-mono text-white/70">{job.id}</td>
                <td className="px-4 py-3 text-sm text-white">{job.connection}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
                    {job.status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
                    {job.status === "completed" && <CheckCircle className="w-3 h-3" />}
                    {job.status === "pending" && <Clock className="w-3 h-3" />}
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white/70">{job.tables}{job.totalTables ? `/${job.totalTables}` : ""}</td>
                <td className="px-4 py-3 text-sm text-white/70">{job.columns}</td>
                <td className="px-4 py-3 text-sm text-white/60">{job.duration}</td>
                <td className="px-4 py-3 text-sm text-white/60">{job.started}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profiling Results */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Profiling Results — Job {selectedJob}</h3>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option>Customers</option>
            <option>Orders</option>
            <option>Products</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {MOCK_COLUMNS.map((col) => (
            <div key={col.name} className="bg-surface-1 border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-semibold text-white">{col.name}</span>
                <span className="text-[10px] text-surface-6 bg-surface-3 px-1.5 py-0.5 rounded">{col.type}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/60">
                <span>Cardinality: <span className="text-white/80">{col.cardinality.toLocaleString()}</span></span>
                <span>Null: <span className={col.nullPct > 5 ? "text-red-400" : col.nullPct > 1 ? "text-yellow-400" : "text-green-400"}>{col.nullPct}%</span></span>
              </div>

              <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(1 - col.nullPct / 100) * 100}%`,
                    backgroundColor: col.nullPct > 5 ? "#ef4444" : col.nullPct > 1 ? "#eab308" : "#22c55e",
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${FORMAT_COLORS[col.format] ?? "bg-white/10 text-white/60"}`}>
                  {col.format}
                </span>
                <span className="text-[10px] text-white/40">{Math.round(col.confidence * 100)}%</span>
              </div>

              {col.topValues.length > 0 && (
                <div className="space-y-0.5">
                  {col.topValues.slice(0, 3).map((tv) => (
                    <div key={tv.v} className="flex items-center justify-between text-[11px]">
                      <span className="text-white/60 font-mono truncate">{tv.v}</span>
                      <span className="text-white/40">{tv.c.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {col.min && (
                <div className="text-[11px] text-white/50">
                  Range: <span className="text-white/70">{col.min}</span> — <span className="text-white/70">{col.max}</span>
                  {col.mean && <> (mean: <span className="text-white/70">{col.mean}</span>)</>}
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-1">
                {col.samples.map((s) => (
                  <span key={s} className="text-[10px] bg-surface-3 text-white/50 px-1.5 py-0.5 rounded font-mono">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
