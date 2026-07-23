"use client";

import { useState } from "react";
import { Button, Badge } from "@orbitiq/design-system";
import { Code, Play, Copy, Download, Loader2, CheckCircle, Clock } from "lucide-react";

const SAMPLE_QUERIES = [
  "SELECT * FROM sales WHERE region = 'North America' LIMIT 10;",
  "OQL: revenue by region for last 12 months;",
  "OQL: top 10 customers by lifetime value;",
];

const DEMO_OUTPUT = {
  columns: ["region", "month", "revenue", "orders"],
  rows: [
    ["North America", "2025-01", "$125,000", "1,250"],
    ["North America", "2025-02", "$132,000", "1,320"],
    ["Europe", "2025-01", "$98,000", "980"],
    ["Europe", "2025-02", "$105,000", "1,050"],
    ["Asia Pacific", "2025-01", "$75,000", "750"],
    ["Asia Pacific", "2025-02", "$82,000", "820"],
  ],
  generatedSql: "SELECT region, DATE_TRUNC('month', created_at) AS month, SUM(revenue) AS revenue, COUNT(*) AS orders FROM sales GROUP BY region, month ORDER BY month, revenue DESC",
  executionTimeMs: 142,
  rowCount: 6,
};

export default function OQLPage() {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0]);
  const [result, setResult] = useState<typeof DEMO_OUTPUT | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 800));
    setResult(DEMO_OUTPUT);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DEMO_OUTPUT.generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OQL Playground</h1>
          <p className="text-sm text-muted mt-1">Write OQL or SQL queries and see results instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted uppercase tracking-wider">Query</span>
                <Badge variant="accent">OQL v1</Badge>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setQuery(SAMPLE_QUERIES[0])} className="px-2 py-1 text-[10px] text-muted hover:text-white bg-surface-3 rounded transition-colors">
                  Example 1
                </button>
                <button onClick={() => setQuery(SAMPLE_QUERIES[1])} className="px-2 py-1 text-[10px] text-muted hover:text-white bg-surface-3 rounded transition-colors">
                  Example 2
                </button>
                <button onClick={() => setQuery(SAMPLE_QUERIES[2])} className="px-2 py-1 text-[10px] text-muted hover:text-white bg-surface-3 rounded transition-colors">
                  Example 3
                </button>
              </div>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-green-400 font-mono text-sm p-4 resize-none focus:outline-none placeholder-surface-6 min-h-[200px]"
              placeholder="Type your OQL query here..."
              spellCheck={false}
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-surface-6">{query.length} chars</span>
              <Button onClick={handleRun} isLoading={isLoading}>
                <Play className="w-4 h-4" /> Run Query
              </Button>
            </div>
          </div>

          {/* SQL Translation */}
          {result && (
            <div className="surface-card overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-[11px] text-muted uppercase tracking-wider">Generated SQL</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-[11px] text-muted hover:text-accent transition-colors">
                  {copied ? <CheckCircle className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto">{result.generatedSql}</pre>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {isLoading && (
            <div className="surface-card p-12 text-center animate-fade-in">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted">Executing query...</p>
            </div>
          )}

          {!isLoading && result && (
            <div className="surface-card overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-[11px] text-muted uppercase tracking-wider">Results</span>
                <div className="flex items-center gap-3 text-[11px] text-surface-6">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {result.executionTimeMs}ms</span>
                  <span>{result.rowCount} rows</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {result.columns.map((col) => (
                        <th key={col} className="px-4 py-2.5 text-left text-muted font-medium bg-surface-2">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border hover:bg-surface-2 transition-colors">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-2 text-white font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t border-border">
                <span className="text-[11px] text-surface-6">Showing {result.rowCount} of {result.rowCount} rows</span>
                <button className="flex items-center gap-1 text-[11px] text-muted hover:text-accent transition-colors">
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>
            </div>
          )}

          {!isLoading && !result && (
            <div className="surface-card p-12 text-center">
              <Code className="w-10 h-10 text-surface-6 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">Run a query to see results</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Write OQL or SQL in the editor, then click Run. Results appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
