"use client";

import { useState } from "react";
import {
  Gauge,
  RefreshCw,
  Play,
  Pause,
  Activity,
  Zap,
  Server,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const aggregates = [
  { id: "agg_1", name: "daily_sales_agg", source: "orders", dims: ["date", "region"], measures: ["revenue", "order_count"], interval: "hourly", lastRefreshed: "2h ago", rows: "45.2K", size: "12.5 MB", status: "active" },
  { id: "agg_2", name: "monthly_customer_agg", source: "customers", dims: ["month", "segment"], measures: ["count", "avg_ltv"], interval: "daily", lastRefreshed: "5h ago", rows: "8.4K", size: "3.2 MB", status: "active" },
  { id: "agg_3", name: "hourly_events_agg", source: "events", dims: ["hour", "event_type"], measures: ["count", "unique_users"], interval: "hourly", lastRefreshed: "1h ago", rows: "120K", size: "28 MB", status: "active" },
  { id: "agg_4", name: "weekly_product_agg", source: "products", dims: ["week", "category"], measures: ["units_sold", "revenue"], interval: "weekly", lastRefreshed: "7d ago", rows: "2.1K", size: "800 KB", status: "stale" },
];

const cdcPipelines = [
  { id: "cdc_1", name: "PostgreSQL → Warehouse", source: "postgres", status: "running", tables: ["orders", "customers", "products"], lag: 12, events: "1.2M", errors: 3 },
  { id: "cdc_2", name: "MySQL → ClickHouse", source: "mysql", status: "running", tables: ["events", "sessions", "page_views"], lag: 45, events: "890K", errors: 12 },
  { id: "cdc_3", name: "SQL Server → Analytics", source: "sqlserver", status: "paused", tables: ["transactions", "accounts"], lag: 0, events: "450K", errors: 0 },
];

const streamingSources = [
  { id: "ss_1", name: "ClickHouse Analytics", type: "clickhouse", status: "active", throughput: 15000, latency: 8, topics: 12, partitions: 48 },
  { id: "ss_2", name: "Apache Pinot Realtime", type: "pinot", status: "active", throughput: 8500, latency: 15, topics: 6, partitions: 24 },
];

const loadTests = [
  {
    id: "lt_1", name: "Pre-GA Load Test", status: "completed", users: 1000, duration: "5m", target: 300,
    result: { p50: 85, p95: 180, p99: 290, max: 420, throughput: 4500, errorRate: 0.2, total: "1.35M", passed: true },
  },
  {
    id: "lt_2", name: "NFR Compliance Test", status: "completed", users: 10000, duration: "10m", target: 300,
    result: { p50: 120, p95: 245, p99: 380, max: 650, throughput: 12000, errorRate: 0.8, total: "7.2M", passed: true },
  },
];

type Tab = "aggregates" | "cdc" | "streaming" | "load";

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("aggregates");

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "aggregates", label: "Aggregates", icon: Server },
    { key: "cdc", label: "CDC Pipelines", icon: Activity },
    { key: "streaming", label: "Streaming", icon: Zap },
    { key: "load", label: "Load Tests", icon: Gauge },
  ];

  return (
    <div className="min-h-screen bg-surface-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Gauge className="h-7 w-7 text-accent" /> Performance &amp; Scale
          </h1>
          <p className="text-secondary mt-1">Aggregate-awareness, CDC pipelines, and load testing</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full font-medium">Aggregate Hit: 78.5%</span>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">CDC Lag: 28ms avg</span>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full font-medium">Streaming: 23.5K/s</span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-secondary hover:text-primary"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "aggregates" && (
        <div className="space-y-4">
          {aggregates.map((agg) => (
            <div key={agg.id} className="bg-surface-2 border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary font-semibold">{agg.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 text-secondary">→ {agg.source}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${agg.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {agg.status}
                  </span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface-3 text-secondary hover:text-primary rounded-lg transition-colors">
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted text-xs">Dimensions</span>
                  <div className="flex flex-wrap gap-1 mt-1">{agg.dims.map((d) => <span key={d} className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{d}</span>)}</div>
                </div>
                <div>
                  <span className="text-muted text-xs">Measures</span>
                  <div className="flex flex-wrap gap-1 mt-1">{agg.measures.map((m) => <span key={m} className="text-xs px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">{m}</span>)}</div>
                </div>
                <div><span className="text-muted text-xs">Refresh</span><p className="text-primary">{agg.interval}</p></div>
                <div><span className="text-muted text-xs">Rows</span><p className="text-primary">{agg.rows}</p></div>
                <div><span className="text-muted text-xs">Size</span><p className="text-primary">{agg.size}</p></div>
              </div>
              <p className="text-xs text-muted mt-2">Last refreshed: {agg.lastRefreshed}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "cdc" && (
        <div className="space-y-4">
          {cdcPipelines.map((p) => (
            <div key={p.id} className="bg-surface-2 border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${p.status === "running" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  <span className="font-semibold text-primary">{p.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-surface-3 text-secondary rounded-full uppercase">{p.source}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "running" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {p.status}
                  </span>
                </div>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  p.status === "running"
                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                }`}>
                  {p.status === "running" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Start</>}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted text-xs">Tables</span>
                  <div className="flex flex-wrap gap-1 mt-1">{p.tables.map((t) => <span key={t} className="text-xs px-1.5 py-0.5 bg-surface-3 text-secondary rounded">{t}</span>)}</div>
                </div>
                <div><span className="text-muted text-xs">Lag</span><p className="text-primary font-mono">{p.lag}ms</p></div>
                <div><span className="text-muted text-xs">Events Processed</span><p className="text-primary font-mono">{p.events}</p></div>
                <div><span className="text-muted text-xs">Errors</span><p className={`font-mono ${p.errors > 0 ? "text-amber-400" : "text-emerald-400"}`}>{p.errors}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "streaming" && (
        <div className="space-y-4">
          {streamingSources.map((s) => (
            <div key={s.id} className="bg-surface-2 border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-accent" />
                  <span className="font-semibold text-primary">{s.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-surface-3 text-secondary rounded-full uppercase">{s.type}</span>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-surface-3 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{(s.throughput / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted mt-1">events/sec</p>
                </div>
                <div className="bg-surface-3 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{s.latency}ms</p>
                  <p className="text-xs text-muted mt-1">latency</p>
                </div>
                <div className="bg-surface-3 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{s.topics}</p>
                  <p className="text-xs text-muted mt-1">topics</p>
                </div>
                <div className="bg-surface-3 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{s.partitions}</p>
                  <p className="text-xs text-muted mt-1">partitions</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "load" && (
        <div className="space-y-6">
          {loadTests.map((lt) => (
            <div key={lt.id} className="bg-surface-2 border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-accent" />
                  <span className="font-semibold text-primary">{lt.name}</span>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </span>
                  {lt.result.passed && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">P95 Target: {lt.target}ms ✓</span>
                  )}
                </div>
                <div className="text-sm text-secondary">
                  {lt.users.toLocaleString()} users · {lt.duration}
                </div>
              </div>

              {lt.result && (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-surface-3 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-primary">{lt.result.p50}ms</p>
                      <p className="text-xs text-muted">p50</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-accent">{lt.result.p95}ms</p>
                      <p className="text-xs text-muted">p95</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-primary">{lt.result.p99}ms</p>
                      <p className="text-xs text-muted">p99</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-primary">{lt.result.max}ms</p>
                      <p className="text-xs text-muted">max</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /><span className="text-secondary">Throughput:</span><span className="text-primary font-semibold">{lt.result.throughput.toLocaleString()}/s</span></div>
                    <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /><span className="text-secondary">Error Rate:</span><span className="text-primary font-semibold">{lt.result.errorRate}%</span></div>
                    <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-accent" /><span className="text-secondary">Total:</span><span className="text-primary font-semibold">{lt.result.total}</span></div>
                  </div>

                  <div className="mt-4 bg-surface-3 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-muted mb-1">
                      <span>Latency Distribution</span>
                      <span>Target: {lt.target}ms</span>
                    </div>
                    <div className="relative h-6 bg-surface-1 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-accent/60 rounded-full" style={{ width: `${(lt.result.p95 / lt.target) * 100}%` }} />
                      <div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: `${(lt.result.p50 / lt.target) * 100}%` }} />
                      <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-amber-400" style={{ left: "100%" }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-1">
                      <span>0ms</span>
                      <span className="text-primary">p50: {lt.result.p50}ms</span>
                      <span className="text-accent">p95: {lt.result.p95}ms</span>
                      <span>{lt.target}ms</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
