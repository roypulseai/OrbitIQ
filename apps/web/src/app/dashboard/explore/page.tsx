"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Sparkles, ArrowRight, Loader2, Code, Database } from "lucide-react";

interface TableInfo { id: string; tableName: string; databasePath: string; }

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
  sql: string;
  warnings: string[];
}

async function gqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch("http://localhost:4001/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  return json.data;
}

const OQL_EXAMPLES = [
  { label: "SELECT * FROM table LIMIT 10", description: "Browse table" },
  { label: "SELECT region, SUM(revenue) FROM sales GROUP BY region ORDER BY revenue DESC", description: "Aggregation" },
  { label: "SELECT department, COUNT(*) as headcount FROM employees GROUP BY department", description: "Count by group" },
];

export default function ExplorePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [oql, setOql] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaPreview, setSchemaPreview] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const data = await gqlFetch<{ allIngestedTables: TableInfo[] }>(
        `query { allIngestedTables { id tableName databasePath } }`
      );
      setTables(data.allIngestedTables);
      if (data.allIngestedTables.length > 0 && !selectedTable) {
        setSelectedTable(data.allIngestedTables[0].id);
      }
    } catch { /* tables not loaded yet */ }
  }, [selectedTable]);

  useEffect(() => { fetchTables(); }, []);

  useEffect(() => {
    if (!selectedTable) { setSchemaPreview(null); return; }
    gqlFetch<{ queryTable: { columns: string[]; rows: string; rowCount: number } }>(
      `query Preview($tableId: String!) { queryTable(tableId: $tableId, limit: 5, offset: 0) { columns rows rowCount } }`,
      { tableId: selectedTable }
    ).then(data => {
      setSchemaPreview({ columns: data.queryTable.columns, rows: JSON.parse(data.queryTable.rows) });
    }).catch(() => setSchemaPreview(null));
  }, [selectedTable]);

  const handleExecute = async (queryOverride?: string) => {
    const q = (queryOverride || oql).trim();
    if (!q || !selectedTable) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await gqlFetch<{ executeRawSQL: QueryResult }>(
        `mutation Exec($sql: String!, $tableId: String) { executeRawSQL(sql: $sql, tableId: $tableId) { columns rows rowCount executionTimeMs sql warnings } }`,
        { sql: q, tableId: selectedTable }
      );
      const r = data.executeRawSQL;
      setResult({ ...r, rows: JSON.parse(r.rows as any) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsLoading(false);
    }
  };

  const tableName = tables.find(t => t.id === selectedTable)?.tableName || "";

  return (
    <div className="page-content animate-fade-in">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Explore</h1>
          <p className="text-sm text-muted mt-1">Query your ingested data with SQL or OQL.</p>
        </div>

        {tables.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-4 h-4 text-accent" />
            <select
              className="input-dark text-sm"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.tableName}</option>
              ))}
            </select>
            {schemaPreview && (
              <span className="text-xs text-surface-6">{schemaPreview.columns.length} columns, {schemaPreview.rows.length} preview rows</span>
            )}
          </div>
        )}

        {tables.length === 0 && (
          <div className="surface-card p-6 text-center mb-4">
            <Database className="w-8 h-8 text-surface-6 mx-auto mb-2" />
            <p className="text-sm text-muted">No ingested tables yet. Upload a file in the <strong>Ingestion</strong> page first.</p>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <input
            type="text"
            value={oql}
            onChange={(e) => setOql(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecute()}
            placeholder={selectedTable ? `SELECT * FROM ${tableName} LIMIT 10` : "Select a table first..."}
            className="w-full bg-surface-2 border border-border rounded-xl pl-12 pr-24 py-4 text-white text-sm font-mono placeholder-surface-6 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all shadow-card"
            disabled={!selectedTable}
          />
          <button
            onClick={() => handleExecute()}
            disabled={isLoading || !oql.trim() || !selectedTable}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-4 py-2 disabled:opacity-30"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {OQL_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setOql(ex.label); handleExecute(ex.label); }}
              className="px-3 py-1.5 text-xs text-muted bg-surface-2 border border-border rounded-lg hover:border-accent/30 hover:text-accent transition-colors"
              disabled={!selectedTable}
            >
              {ex.description}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16 animate-fade-in">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Executing query...</p>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto surface-card p-4 mb-4 border border-danger/30">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {result && !isLoading && (
        <div className="max-w-4xl mx-auto space-y-4 animate-slide-up">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Results</h3>
              <span className="text-xs text-surface-6">{result.rowCount} rows in {result.executionTimeMs}ms</span>
            </div>
            {result.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {result.columns.map(col => (
                        <th key={col} className="text-left py-2 px-3 text-muted font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-surface-3/50">
                        {result.columns.map(col => (
                          <td key={col} className="py-2 px-3 text-white font-mono">{String(row[col] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.rowCount > 50 && (
                  <p className="text-xs text-surface-6 mt-2 text-center">Showing 50 of {result.rowCount} rows</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">No results returned.</p>
            )}
          </div>

          <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-[11px] text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3 h-3" /> Generated SQL
              </span>
              <span className="text-[11px] text-surface-6">{result.executionTimeMs}ms</span>
            </div>
            <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto">{result.sql}</pre>
          </div>

          {result.warnings.length > 0 && (
            <div className="surface-card p-3 border border-yellow-500/30">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-400">{w}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && !isLoading && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-surface-6" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">Your results will appear here</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {tables.length > 0
              ? "Select a table and write a SQL query to explore your data."
              : "Upload a data file in the Ingestion page to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
