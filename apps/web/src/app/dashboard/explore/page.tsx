"use client";

import { useState } from "react";
import { Search, Sparkles, ArrowRight, Loader2, Code } from "lucide-react";

const SUGGESTIONS = [
  "Revenue by region for last 12 months",
  "Top 10 customers by lifetime value",
  "Monthly conversion funnel",
  "Product performance comparison",
];

const DEMO_RESULT = {
  data: [
    { region: "North America", revenue: 1250000 },
    { region: "Europe", revenue: 980000 },
    { region: "Asia Pacific", revenue: 750000 },
    { region: "Latin America", revenue: 420000 },
  ],
  chartType: "bar" as const,
  xField: "region",
  yField: "revenue",
  sql: "SELECT region, SUM(revenue) AS revenue FROM sales GROUP BY region ORDER BY revenue DESC",
  executionTimeMs: 142,
  intent: "Aggregate revenue by region",
  metric: "SUM(revenue)",
  dimension: "region",
  source: "sales",
};

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof DEMO_RESULT | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (q?: string) => {
    const queryStr = q || query;
    if (!queryStr.trim()) return;
    setIsLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(DEMO_RESULT);
    setIsLoading(false);
  };

  const maxRevenue = Math.max(...DEMO_RESULT.data.map((d) => d.revenue));

  return (
    <div className="page-content animate-fade-in">
      {/* AI Query Bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Explore</h1>
          <p className="text-sm text-muted mt-1">Ask a question about your data in natural language.</p>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            placeholder="Ask anything about your data..."
            className="w-full bg-surface-2 border border-border rounded-xl pl-12 pr-24 py-4 text-white text-base placeholder-surface-6 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all shadow-card"
          />
          <button
            onClick={() => handleQuery()}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-4 py-2 disabled:opacity-30"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); handleQuery(s); }}
              className="px-3 py-1.5 text-xs text-muted bg-surface-2 border border-border rounded-lg hover:border-accent/30 hover:text-accent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-16 animate-fade-in">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Analyzing your question...</p>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="max-w-3xl mx-auto space-y-4 animate-slide-up">
          {/* Chart */}
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Revenue by Region</h3>
            <div className="space-y-3">
              {result.data.map((d) => (
                <div key={d.region} className="flex items-center gap-4">
                  <span className="text-xs text-muted w-28 shrink-0">{d.region}</span>
                  <div className="flex-1 bg-surface-3 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">
                        ${(d.revenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SQL */}
          <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-[11px] text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3 h-3" /> Generated SQL
              </span>
              <span className="text-[11px] text-surface-6">{result.executionTimeMs}ms</span>
            </div>
            <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto">{result.sql}</pre>
          </div>

          {/* Show your work */}
          <div className="surface-card p-4">
            <h4 className="text-xs font-semibold text-white mb-3">How I got this</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Intent", value: result.intent },
                { label: "Metric", value: result.metric },
                { label: "Dimension", value: result.dimension },
                { label: "Source", value: result.source },
              ].map((item) => (
                <div key={item.label} className="bg-surface-3 rounded-lg p-2.5">
                  <span className="text-muted block mb-0.5">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-surface-6" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">Your visualization will appear here</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Connect to a data source and ask a question to get started. The AI will generate a dashboard based on your request.
          </p>
        </div>
      )}
    </div>
  );
}
