"use client";

import { useState } from "react";
import { Database, TrendingUp, TrendingDown, Trash2, Search, Activity, BarChart3, RefreshCw } from "lucide-react";

interface CacheEntry {
  id: string;
  query: string;
  connection: string;
  size: string;
  createdAt: string;
  expiresAt: string;
  hits: number;
}

const MOCK_ENTRIES: CacheEntry[] = [
  { id: "1", query: "SELECT region, SUM(revenue) FROM sales WHERE date >= '2025-01-01' GROUP BY region", connection: "PostgreSQL - Main", size: "2.4 KB", createdAt: "12 min ago", expiresAt: "48 min", hits: 14 },
  { id: "2", query: "SELECT customer_id, COUNT(*) as orders FROM orders GROUP BY customer_id ORDER BY orders DESC LIMIT 100", connection: "PostgreSQL - Main", size: "8.1 KB", createdAt: "25 min ago", expiresAt: "35 min", hits: 7 },
  { id: "3", query: "SELECT date_trunc('month', created_at) AS month, SUM(amount) FROM transactions GROUP BY month", connection: "BigQuery - Analytics", size: "4.7 KB", createdAt: "1 hour ago", expiresAt: "2 hours", hits: 22 },
  { id: "4", query: "SELECT * FROM users WHERE status = 'active' AND last_login > NOW() - INTERVAL '30 days'", connection: "PostgreSQL - Users", size: "1.2 KB", createdAt: "2 hours ago", expiresAt: "Expired", hits: 3 },
  { id: "5", query: "SELECT product_name, AVG(rating) as avg_rating FROM reviews GROUP BY product_name HAVING AVG(rating) > 4.0", connection: "BigQuery - Analytics", size: "3.3 KB", createdAt: "3 hours ago", expiresAt: "1 hour", hits: 11 },
  { id: "6", query: "SELECT department, COUNT(*), AVG(salary) FROM employees GROUP BY department", connection: "Snowflake - HR", size: "0.8 KB", createdAt: "4 hours ago", expiresAt: "Expired", hits: 5 },
];

const CACHE_STATS = {
  hits: 12847,
  misses: 2103,
  hitRate: 85.9,
  totalEntries: 342,
};

export default function CachingPage() {
  const [entries, setEntries] = useState<CacheEntry[]>(MOCK_ENTRIES);
  const [patternInvalidation, setPatternInvalidation] = useState("");

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const clearAll = () => {
    setEntries([]);
  };

  const invalidateByPattern = () => {
    if (!patternInvalidation.trim()) return;
    setEntries((prev) => prev.filter((e) => !e.query.toLowerCase().includes(patternInvalidation.toLowerCase())));
    setPatternInvalidation("");
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <Database className="w-6 h-6 text-accent" />
          Query Cache
        </h1>
        <p className="text-sm text-muted mt-1">Monitor and manage cached query results for improved dashboard performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">Cache Hits</span>
            <div className="p-2 bg-success-muted rounded-lg">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{CACHE_STATS.hits.toLocaleString()}</div>
          <div className="text-[11px] text-success mt-1">+12.3% from last week</div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">Cache Misses</span>
            <div className="p-2 bg-warning-muted rounded-lg">
              <TrendingDown className="w-4 h-4 text-warning" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{CACHE_STATS.misses.toLocaleString()}</div>
          <div className="text-[11px] text-warning mt-1">-4.1% from last week</div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">Hit Rate</span>
            <div className="p-2 bg-accent-muted rounded-lg">
              <Activity className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-white tracking-tight">{CACHE_STATS.hitRate}%</div>
            <div className="relative w-10 h-10 mb-0.5">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#1f1f23" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${CACHE_STATS.hitRate} 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">Total Entries</span>
            <div className="p-2 bg-info-muted rounded-lg">
              <BarChart3 className="w-4 h-4 text-info" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{CACHE_STATS.totalEntries}</div>
          <div className="text-[11px] text-muted mt-1">Across 3 connections</div>
        </div>
      </div>

      {/* Cache Operations */}
      <div className="surface-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-accent" />
          Cache Operations
        </h2>
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <button onClick={clearAll} className="btn-danger text-xs">
            <Trash2 className="w-4 h-4" /> Clear All Cache
          </button>
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs text-muted mb-1.5">Pattern Invalidation</label>
            <input
              className="input-dark font-mono text-xs"
              placeholder="e.g. sales, region, transactions..."
              value={patternInvalidation}
              onChange={(e) => setPatternInvalidation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invalidateByPattern()}
            />
          </div>
          <button onClick={invalidateByPattern} className="btn-secondary text-xs" disabled={!patternInvalidation.trim()}>
            <Search className="w-4 h-4" /> Invalidate
          </button>
        </div>
      </div>

      {/* Recent Cache Entries */}
      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-accent" />
          Recent Cache Entries
          <span className="text-xs font-normal text-muted ml-1">({entries.length})</span>
        </h2>
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-10 h-10 text-surface-5 mx-auto mb-3" />
            <p className="text-sm text-muted">Cache is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Query</th>
                  <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Connection</th>
                  <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Size</th>
                  <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Created</th>
                  <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Expires</th>
                  <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Hits</th>
                  <th className="text-right text-[11px] font-medium text-muted uppercase tracking-wider pb-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isExpired = entry.expiresAt === "Expired";
                  return (
                    <tr key={entry.id} className="border-b border-border/50 last:border-0 group hover:bg-surface-3/30 transition-colors">
                      <td className="py-3 pr-4 max-w-[300px]">
                        <code className={`text-xs font-mono block truncate ${isExpired ? "text-muted" : "text-white/80"}`}>
                          {entry.query}
                        </code>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-muted">{entry.connection}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-white/70">{entry.size}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-muted">{entry.createdAt}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium ${isExpired ? "text-danger" : "text-muted"}`}>
                          {entry.expiresAt}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-accent font-mono">{entry.hits}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1.5 text-surface-6 hover:text-danger transition-colors opacity-0 group-hover:opacity-100 rounded"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
