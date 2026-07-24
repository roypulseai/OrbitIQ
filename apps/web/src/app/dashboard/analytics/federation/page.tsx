"use client";

import { useState } from "react";
import {
  Network,
  Zap,
  Link2,
  BarChart3,
  Play,
  Trash2,
  CheckCircle,
  Loader2,
  ArrowRight,
  Cpu,
  Activity,
  Database,
} from "lucide-react";

interface Engine {
  id: string;
  name: string;
  type: string;
  status: string;
  avgLatencyMs: number;
  activeConnections: number;
  maxConnections: number;
  queriesProcessed: number;
}

interface CacheEntry {
  id: string;
  queryHash: string;
  engine: string;
  plan: string;
  resultPreview: string;
  hitCount: number;
  lastAccessed: string;
}

interface CacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  totalCachedPlans: number;
}

interface QueryResultData {
  columns: { name: string; type: string }[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
}

const SEED_ENGINES: Engine[] = [
  {
    id: "engine-duckdb-001",
    name: "DuckDB Local",
    type: "duckdb",
    status: "active",
    avgLatencyMs: 25,
    activeConnections: 12,
    maxConnections: 50,
    queriesProcessed: 12500,
  },
  {
    id: "engine-trino-001",
    name: "Trino Cluster",
    type: "trino",
    status: "active",
    avgLatencyMs: 180,
    activeConnections: 45,
    maxConnections: 200,
    queriesProcessed: 4200,
  },
  {
    id: "engine-clickhouse-001",
    name: "ClickHouse Analytics",
    type: "clickhouse",
    status: "active",
    avgLatencyMs: 35,
    activeConnections: 28,
    maxConnections: 100,
    queriesProcessed: 8900,
  },
];

const SEED_CACHE: CacheEntry[] = [
  {
    id: "cache-001",
    queryHash: "a1b2c3d4",
    engine: "duckdb",
    plan: "SeqScan → HashAggregate → Projection",
    resultPreview: "SELECT region, SUM(revenue) FROM sales GROUP BY region → 8 rows",
    hitCount: 3,
    lastAccessed: "1 hour ago",
  },
  {
    id: "cache-002",
    queryHash: "e5f6g7h8",
    engine: "trino",
    plan: "DistributedJoin → Filter → Sort → Limit",
    resultPreview: "Multi-join across sales + customers + products → 1240 rows",
    hitCount: 2,
    lastAccessed: "2 hours ago",
  },
  {
    id: "cache-003",
    queryHash: "i9j0k1l2",
    engine: "clickhouse",
    plan: "MergeTree → AggregationMerge → Final",
    resultPreview: "Real-time events aggregation → 48 time buckets",
    hitCount: 5,
    lastAccessed: "30 min ago",
  },
  {
    id: "cache-004",
    queryHash: "m3n4o5p6",
    engine: "duckdb",
    plan: "IndexScan → Projection",
    resultPreview: "Single-table SELECT with WHERE → 156 rows",
    hitCount: 8,
    lastAccessed: "15 min ago",
  },
];

const MOCK_RESULT: QueryResultData = {
  columns: [
    { name: "region", type: "varchar" },
    { name: "total_revenue", type: "float8" },
    { name: "order_count", type: "int8" },
  ],
  rows: [
    { region: "North America", total_revenue: 2847500.5, order_count: 14230 },
    { region: "Europe", total_revenue: 1923100.75, order_count: 9870 },
    { region: "Asia Pacific", total_revenue: 1456200.3, order_count: 7650 },
    { region: "Latin America", total_revenue: 834100.2, order_count: 4320 },
  ],
  rowCount: 4,
  executionTimeMs: 23,
};

function autoSelectEngine(query: string): { engine: string; reason: string; latency: number } {
  const lower = query.toLowerCase();
  const joinCount = (lower.match(/\bjoin\b/g) || []).length;
  const hasStreaming = /\b(stream|real[- ]?time|event|live|kafka)\b/.test(lower);
  const isSingleSource = /\bfrom\s+\w+\s*$/.test(lower.trim().replace(/;$/, ""));

  if (hasStreaming) {
    return { engine: "clickhouse", reason: "Streaming/real-time keywords detected → ClickHouse", latency: 35 };
  }
  if (isSingleSource && joinCount === 0) {
    return { engine: "duckdb", reason: "Single-source query → DuckDB (fastest local)", latency: 25 };
  }
  if (joinCount <= 2) {
    return { engine: "duckdb", reason: `Simple query (${joinCount} join${joinCount !== 1 ? "s" : ""}) → DuckDB`, latency: 30 };
  }
  if (joinCount > 3) {
    return { engine: "trino", reason: `Complex query (${joinCount} joins) → Trino distributed`, latency: 180 };
  }
  return { engine: "duckdb", reason: "Moderate complexity → DuckDB", latency: 40 };
}

const ENGINE_ICONS: Record<string, any> = {
  duckdb: Zap,
  trino: Link2,
  clickhouse: BarChart3,
};

const ENGINE_COLORS: Record<string, string> = {
  duckdb: "text-yellow-400",
  trino: "text-blue-400",
  clickhouse: "text-emerald-400",
};

const ENGINE_BG: Record<string, string> = {
  duckdb: "bg-yellow-400/10 border-yellow-400/20",
  trino: "bg-blue-400/10 border-blue-400/20",
  clickhouse: "bg-emerald-400/10 border-emerald-400/20",
};

export default function FederationPage() {
  const [query, setQuery] = useState("SELECT region, SUM(revenue) as total_revenue, COUNT(*) as order_count\nFROM sales\nGROUP BY region\nORDER BY total_revenue DESC;");
  const [selectedEngine, setSelectedEngine] = useState("auto");
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<QueryResultData | null>(null);
  const [resultEngine, setResultEngine] = useState("");
  const [resultLatency, setResultLatency] = useState(0);
  const [cache, setCache] = useState<CacheEntry[]>(SEED_CACHE);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalQueries: 25600,
    cacheHits: 18,
    cacheMisses: 7,
    hitRate: 68,
    totalCachedPlans: 4,
  });

  const autoSelection = autoSelectEngine(query);

  const handleExecute = () => {
    setExecuting(true);
    const delay = 300 + Math.random() * 700;
    setTimeout(() => {
      const engine = selectedEngine === "auto" ? autoSelection.engine : selectedEngine;
      setResult(MOCK_RESULT);
      setResultEngine(engine);
      setResultLatency(autoSelection.latency + Math.round(Math.random() * 15));
      setExecuting(false);
      setCacheStats((prev) => ({
        ...prev,
        totalQueries: prev.totalQueries + 1,
        cacheHits: prev.cacheHits + (Math.random() > 0.3 ? 1 : 0),
      }));
    }, delay);
  };

  const handleClearCache = () => {
    setCache([]);
    setCacheStats((prev) => ({
      ...prev,
      totalCachedPlans: 0,
    }));
  };

  const handleInvalidate = (id: string) => {
    setCache((prev) => prev.filter((c) => c.id !== id));
    setCacheStats((prev) => ({
      ...prev,
      totalCachedPlans: prev.totalCachedPlans - 1,
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Federated Query Engine</h1>
              <p className="text-sm text-muted">
                Auto-select between DuckDB, Trino, and ClickHouse
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <Activity className="w-3.5 h-3.5" />
            Cache Hit Rate: {cacheStats.hitRate}%
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-sm text-muted">
            <Cpu className="w-3.5 h-3.5" />
            {cacheStats.totalCachedPlans} cached plans
          </span>
        </div>
      </div>

      {/* Engine Cards */}
      <div className="grid grid-cols-3 gap-4">
        {SEED_ENGINES.map((engine) => {
          const Icon = ENGINE_ICONS[engine.type] || Database;
          const colorClass = ENGINE_COLORS[engine.type] || "text-muted";
          const bgClass = ENGINE_BG[engine.type] || "bg-surface-3 border-border";
          const connPct = Math.round((engine.activeConnections / engine.maxConnections) * 100);

          return (
            <div
              key={engine.id}
              className={`rounded-xl border p-5 ${bgClass} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-surface-1 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{engine.name}</h3>
                    <p className="text-xs text-muted capitalize">{engine.type}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">{engine.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-surface-6 uppercase tracking-wider">Latency</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {engine.avgLatencyMs}
                    <span className="text-xs font-normal text-muted ml-0.5">ms</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-surface-6 uppercase tracking-wider">Processed</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {engine.queriesProcessed.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted">Connections</span>
                  <span className="text-white">
                    {engine.activeConnections}/{engine.maxConnections}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-1 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${connPct}%`,
                      backgroundColor:
                        connPct > 80 ? "#ef4444" : connPct > 50 ? "#eab308" : "#22c55e",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Query Editor */}
      <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-2/50">
          <h2 className="text-sm font-semibold text-white">Query Editor</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/30"
            >
              <option value="auto">Auto-Select</option>
              <option value="duckdb">DuckDB</option>
              <option value="trino">Trino</option>
              <option value="clickhouse">ClickHouse</option>
            </select>
            <button
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {executing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Execute
            </button>
          </div>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-36 bg-surface-1 p-4 font-mono text-sm text-green-400 resize-none focus:outline-none placeholder-surface-6"
          placeholder="Enter your SQL query..."
          spellCheck={false}
        />

        {/* Auto-Selection Logic */}
        <div className="px-5 py-3 border-t border-border bg-surface-3/30">
          <div className="flex items-center gap-2 text-xs">
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted">Auto-selection:</span>
            <span className="text-white font-medium">{autoSelection.reason}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {(["duckdb", "trino", "clickhouse"] as const).map((eng) => (
              <div key={eng} className="flex items-center gap-1.5 text-xs">
                <div
                  className={`w-2 h-2 rounded-full ${
                    autoSelection.engine === eng ? "bg-white" : "bg-surface-6"
                  }`}
                />
                <span className={autoSelection.engine === eng ? "text-white" : "text-surface-6"}>
                  {eng === "duckdb" ? "DuckDB" : eng === "trino" ? "Trino" : "ClickHouse"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Result Table */}
        {result && (
          <div className="border-t border-border">
            <div className="flex items-center justify-between px-5 py-2 bg-surface-3/30">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Completed
                </span>
                <span className="text-muted">
                  Engine: <span className="text-white capitalize">{resultEngine}</span>
                </span>
                <span className="text-muted">
                  Latency: <span className="text-white">{resultLatency}ms</span>
                </span>
                <span className="text-muted">
                  Rows: <span className="text-white">{result.rowCount}</span>
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {result.columns.map((col) => (
                      <th
                        key={col.name}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-muted bg-surface-3/20"
                      >
                        {col.name}
                        <span className="ml-1.5 text-surface-6 font-normal">({col.type})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-surface-3/20">
                      {result.columns.map((col) => (
                        <td key={col.name} className="px-4 py-2 text-white font-mono text-xs">
                          {typeof row[col.name] === "number"
                            ? row[col.name].toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : row[col.name]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Query Plan Cache */}
        <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-white">Query Plan Cache</h2>
            <button
              onClick={handleClearCache}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cache
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted bg-surface-3/20">
                    Query Preview
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted bg-surface-3/20">
                    Engine
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted bg-surface-3/20">
                    Hits
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted bg-surface-3/20">
                    Last Accessed
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted bg-surface-3/20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {cache.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-surface-6 text-sm">
                      Cache is empty
                    </td>
                  </tr>
                ) : (
                  cache.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-surface-3/20">
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-white font-mono truncate max-w-[280px]">
                          {entry.resultPreview}
                        </p>
                        <p className="text-[10px] text-surface-6 mt-0.5">{entry.plan}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs capitalize text-white">{entry.engine}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-medium text-white">{entry.hitCount}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-muted">{entry.lastAccessed}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleInvalidate(entry.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Invalidate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cache Stats */}
          <div className="px-5 py-3 border-t border-border bg-surface-3/30">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] text-surface-6 uppercase tracking-wider">Total Queries</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {cacheStats.totalQueries.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-surface-6 uppercase tracking-wider">Cache Hits</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{cacheStats.cacheHits}</p>
              </div>
              <div>
                <p className="text-[11px] text-surface-6 uppercase tracking-wider">Misses</p>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{cacheStats.cacheMisses}</p>
              </div>
              <div>
                <p className="text-[11px] text-surface-6 uppercase tracking-wider">Hit Rate</p>
                <p className="text-sm font-bold text-white mt-0.5">{cacheStats.hitRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engine Health Monitor */}
        <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-white">Engine Health Monitor</h2>
          </div>

          <div className="p-5 space-y-4">
            {SEED_ENGINES.map((engine) => {
              const Icon = ENGINE_ICONS[engine.type] || Database;
              const colorClass = ENGINE_COLORS[engine.type] || "text-muted";
              const uptime = 99.9;
              const queries24h = Math.round(engine.queriesProcessed * 0.08);

              return (
                <div
                  key={engine.id}
                  className="rounded-lg border border-border bg-surface-3/30 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                      <span className="text-sm font-medium text-white">{engine.name}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400">Operational</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-surface-6 uppercase">Latency</p>
                      <p className="text-xs font-semibold text-white">{engine.avgLatencyMs}ms</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-surface-6 uppercase">Uptime</p>
                      <p className="text-xs font-semibold text-white">{uptime}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-surface-6 uppercase">Queries/24h</p>
                      <p className="text-xs font-semibold text-white">
                        {queries24h.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-surface-6">Uptime</span>
                      <span className="text-white">{uptime}%</span>
                    </div>
                    <div className="w-full h-1 bg-surface-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${uptime}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
