"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";
import {
  MessageSquare,
  Play,
  ExternalLink,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface ParsedEntity {
  name: string;
  entityType: string;
  sourceModel: string;
  matchedField: string;
}

interface ParsedFilter {
  field: string;
  operator: string;
  value: string;
  logicalOperator: string;
}

interface ParsedAggregation {
  field: string;
  function: string;
  alias: string;
}

interface ParsedIntent {
  id: string;
  rawQuery: string;
  parsedAt: string;
  intent: string;
  entities: ParsedEntity[];
  filters: ParsedFilter[];
  aggregations: ParsedAggregation[];
  visualizationHint?: string;
  confidence: number;
  suggestedOQL?: string;
}

interface IntentStatsData {
  totalIntents: number;
  avgConfidence: number;
  queriesThisWeek: number;
  topIntent: string;
}

const QUICK_QUERIES = [
  "Show total revenue by region",
  "What's the churn trend?",
  "Compare US vs EU sales",
  "Top 10 customers by LTV",
  "Forecast next quarter MRR",
];

const INTENT_COLORS: Record<string, string> = {
  query: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  visualize: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  filter: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  aggregate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  compare: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  trend: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  forecast: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  explain: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const VIZ_COLORS: Record<string, string> = {
  bar: "bg-orange-500/15 text-orange-400",
  line: "bg-sky-500/15 text-sky-400",
  area: "bg-teal-500/15 text-teal-400",
  pie: "bg-fuchsia-500/15 text-fuchsia-400",
  scatter: "bg-lime-500/15 text-lime-400",
  table: "bg-gray-500/15 text-gray-400",
  kpi: "bg-yellow-500/15 text-yellow-400",
};

const MOCK_INTENTS: ParsedIntent[] = [
  {
    id: "intent-001",
    rawQuery: "Show me total revenue by region for Q1 2026",
    parsedAt: "2 hours ago",
    intent: "aggregate",
    entities: [
      { name: "revenue", entityType: "measure", sourceModel: "sales-model", matchedField: "sales.revenue" },
      { name: "region", entityType: "dimension", sourceModel: "sales-model", matchedField: "sales.region" },
    ],
    filters: [
      { field: "order_date", operator: ">=", value: "2026-01-01", logicalOperator: "AND" },
      { field: "order_date", operator: "<", value: "2026-04-01", logicalOperator: "AND" },
    ],
    aggregations: [{ field: "revenue", function: "SUM", alias: "total_revenue" }],
    visualizationHint: "bar",
    confidence: 0.92,
    suggestedOQL: `FROM sales SELECT region, SUM(revenue) AS total_revenue WHERE order_date >= '2026-01-01' AND order_date < '2026-04-01' GROUP BY region ORDER BY total_revenue DESC`,
  },
  {
    id: "intent-002",
    rawQuery: "What's the churn rate trend over the last 12 months?",
    parsedAt: "5 hours ago",
    intent: "trend",
    entities: [
      { name: "churn_rate", entityType: "measure", sourceModel: "subscriptions-model", matchedField: "subscriptions.churn_rate" },
      { name: "month", entityType: "dimension", sourceModel: "subscriptions-model", matchedField: "subscriptions.month" },
    ],
    filters: [],
    aggregations: [],
    visualizationHint: "line",
    confidence: 0.88,
    suggestedOQL: `FROM subscriptions SELECT DATE_TRUNC('month', period) AS month, churn_rate WHERE period >= DATE_SUB(TODAY, 12, 'month') ORDER BY month ASC`,
  },
  {
    id: "intent-003",
    rawQuery: "Compare revenue between US and EU regions",
    parsedAt: "8 hours ago",
    intent: "compare",
    entities: [
      { name: "revenue", entityType: "measure", sourceModel: "sales-model", matchedField: "sales.revenue" },
      { name: "region", entityType: "dimension", sourceModel: "sales-model", matchedField: "sales.region" },
    ],
    filters: [{ field: "region", operator: "in", value: "US, EU", logicalOperator: "AND" }],
    aggregations: [{ field: "revenue", function: "SUM", alias: "total_revenue" }],
    visualizationHint: "bar",
    confidence: 0.90,
    suggestedOQL: `FROM sales SELECT region, SUM(revenue) AS total_revenue WHERE region IN ('US', 'EU') GROUP BY region`,
  },
  {
    id: "intent-004",
    rawQuery: "List all customers with lifetime value above $10,000",
    parsedAt: "1 day ago",
    intent: "query",
    entities: [
      { name: "customer", entityType: "table", sourceModel: "customers-model", matchedField: "customers" },
      { name: "lifetime_value", entityType: "measure", sourceModel: "customers-model", matchedField: "customers.ltv" },
    ],
    filters: [{ field: "lifetime_value", operator: ">", value: "10000", logicalOperator: "AND" }],
    aggregations: [],
    visualizationHint: "table",
    confidence: 0.95,
    suggestedOQL: `FROM customers SELECT id, name, email, lifetime_value WHERE lifetime_value > 10000 ORDER BY lifetime_value DESC`,
  },
  {
    id: "intent-005",
    rawQuery: "Forecast next quarter's MRR based on current trends",
    parsedAt: "1 day ago",
    intent: "forecast",
    entities: [
      { name: "MRR", entityType: "measure", sourceModel: "finance-model", matchedField: "revenue.mrr" },
      { name: "quarter", entityType: "dimension", sourceModel: "finance-model", matchedField: "revenue.quarter" },
    ],
    filters: [],
    aggregations: [{ field: "mrr", function: "SUM", alias: "total_mrr" }],
    visualizationHint: "line",
    confidence: 0.75,
    suggestedOQL: `FROM revenue SELECT DATE_TRUNC('quarter', period) AS quarter, SUM(mrr) AS total_mrr WHERE period >= DATE_SUB(TODAY, 4, 'quarter') GROUP BY quarter ORDER BY quarter ASC`,
  },
];

const MOCK_STATS: IntentStatsData = {
  totalIntents: 247,
  avgConfidence: 0.88,
  queriesThisWeek: 42,
  topIntent: "aggregate",
};

function parseIntentMock(query: string): ParsedIntent {
  const lower = query.toLowerCase();
  let intent = "query";
  let confidence = 0.85;
  let visualizationHint = "table";

  if (lower.match(/\b(show|display|chart|visualize|graph)\b/)) { intent = "visualize"; confidence = 0.88; }
  else if (lower.match(/\b(total|sum|count|average)\b/)) { intent = "aggregate"; confidence = 0.90; visualizationHint = "bar"; }
  else if (lower.match(/\b(compare|vs|versus|between)\b/)) { intent = "compare"; confidence = 0.87; visualizationHint = "bar"; }
  else if (lower.match(/\b(trend|over time|timeline)\b/)) { intent = "trend"; confidence = 0.86; visualizationHint = "line"; }
  else if (lower.match(/\b(forecast|predict|projection)\b/)) { intent = "forecast"; confidence = 0.72; visualizationHint = "line"; }
  else if (lower.match(/\b(filter|where|find|list)\b/)) { intent = "filter"; confidence = 0.82; }
  else if (lower.match(/\b(why|explain|reason)\b/)) { intent = "explain"; confidence = 0.78; }

  const entities: ParsedEntity[] = [];
  if (lower.includes("revenue")) entities.push({ name: "revenue", entityType: "measure", sourceModel: "sales-model", matchedField: "sales.revenue" });
  if (lower.includes("region")) entities.push({ name: "region", entityType: "dimension", sourceModel: "sales-model", matchedField: "sales.region" });
  if (lower.includes("customer")) entities.push({ name: "customer", entityType: "table", sourceModel: "customers-model", matchedField: "customers" });
  if (lower.includes("churn")) entities.push({ name: "churn_rate", entityType: "measure", sourceModel: "subscriptions-model", matchedField: "subscriptions.churn_rate" });
  if (lower.includes("month")) entities.push({ name: "month", entityType: "dimension", sourceModel: "subscriptions-model", matchedField: "subscriptions.month" });
  if (lower.includes("mrr")) entities.push({ name: "MRR", entityType: "measure", sourceModel: "finance-model", matchedField: "revenue.mrr" });
  if (lower.includes("ltv") || lower.includes("lifetime")) entities.push({ name: "lifetime_value", entityType: "measure", sourceModel: "customers-model", matchedField: "customers.ltv" });

  const filters: ParsedFilter[] = [];
  if (lower.includes("above") || lower.includes("greater")) {
    const match = query.match(/(?:above|greater|more than|over)\s*\$?([\d,]+)/i);
    if (match) filters.push({ field: "value", operator: ">", value: match[1].replace(/,/g, ""), logicalOperator: "AND" });
  }

  const aggregations: ParsedAggregation[] = [];
  if (intent === "aggregate" && entities.some((e) => e.entityType === "measure")) {
    const measure = entities.find((e) => e.entityType === "measure")!;
    aggregations.push({ field: measure.name, function: "SUM", alias: `total_${measure.name}` });
  }

  confidence += Math.random() * 0.05 - 0.025;
  confidence = Math.min(0.99, Math.max(0.5, Math.round(confidence * 100) / 100));

  const selectParts: string[] = [];
  entities.filter((e) => e.entityType === "dimension").forEach((e) => selectParts.push(e.name));
  entities.filter((e) => e.entityType === "measure").forEach((e) => {
    if (aggregations.length > 0) {
      const agg = aggregations.find((a) => a.field === e.name);
      if (agg) selectParts.push(`${agg.function}(${e.matchedField}) AS ${agg.alias}`);
      else selectParts.push(e.name);
    } else {
      selectParts.push(e.name);
    }
  });
  if (selectParts.length === 0) selectParts.push("*");

  const table = entities.find((e) => e.entityType === "table")?.matchedField || entities[0]?.matchedField?.split(".")[0] || "data";
  let oql = `FROM ${table} SELECT ${selectParts.join(", ")}`;
  if (filters.length > 0) oql += ` WHERE ${filters.map((f) => `${f.field} ${f.operator} '${f.value}'`).join(" AND ")}`;
  if (entities.some((e) => e.entityType === "dimension") && aggregations.length > 0) {
    oql += ` GROUP BY ${entities.filter((e) => e.entityType === "dimension").map((e) => e.name).join(", ")}`;
  }
  oql += " LIMIT 100";

  return {
    id: `intent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    rawQuery: query,
    parsedAt: "just now",
    intent,
    entities,
    filters,
    aggregations,
    visualizationHint,
    confidence,
    suggestedOQL: oql,
  };
}

export default function IntentParserPage() {
  const [query, setQuery] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedIntent | null>(null);
  const [recentIntents] = useState<ParsedIntent[]>(MOCK_INTENTS);
  const [stats] = useState<IntentStatsData>(MOCK_STATS);

  const handleParse = () => {
    if (!query.trim()) return;
    setParsing(true);
    setParsedResult(null);
    setTimeout(() => {
      setParsedResult(parseIntentMock(query));
      setParsing(false);
    }, 800 + Math.random() * 600);
  };

  const handleQuickQuery = (q: string) => {
    setQuery(q);
    setParsing(true);
    setParsedResult(null);
    setTimeout(() => {
      setParsedResult(parseIntentMock(q));
      setParsing(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Intent Parser</h1>
              <p className="text-sm text-muted mt-0.5">Natural language to query — powered by AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* NL Query Input */}
      <div className="surface-card p-5 mb-6">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleParse(); } }}
          className="input-dark w-full h-28 font-mono text-sm resize-none mb-4"
          placeholder="Ask a question about your data..."
        />
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {QUICK_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuery(q)}
                className="px-3 py-1.5 text-xs font-medium bg-surface-3 text-muted hover:text-white hover:bg-surface-4 rounded-full border border-border transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <Button onClick={handleParse} disabled={parsing || !query.trim()}>
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Parse
          </Button>
        </div>
      </div>

      {/* Parsed Result */}
      {parsedResult && (
        <div className="surface-card p-5 mb-6 animate-slide-down">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-white">Parsed Result</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Intent + Entities + Filters */}
            <div className="lg:col-span-2 space-y-4">
              {/* Intent + Confidence */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${INTENT_COLORS[parsedResult.intent] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                  {parsedResult.intent.toUpperCase()}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-muted">Confidence</span>
                  <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden max-w-[200px]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-500 transition-all"
                      style={{ width: `${parsedResult.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-white">{(parsedResult.confidence * 100).toFixed(0)}%</span>
                </div>
                {parsedResult.visualizationHint && (
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${VIZ_COLORS[parsedResult.visualizationHint] || ""}`}>
                    {parsedResult.visualizationHint}
                  </span>
                )}
              </div>

              {/* Entities */}
              {parsedResult.entities.length > 0 && (
                <div>
                  <div className="text-xs text-muted mb-2">Extracted Entities</div>
                  <div className="flex flex-wrap gap-2">
                    {parsedResult.entities.map((ent, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-3 rounded-md border border-border">
                        <span className={`w-1.5 h-1.5 rounded-full ${ent.entityType === "measure" ? "bg-amber-400" : ent.entityType === "dimension" ? "bg-sky-400" : "bg-emerald-400"}`} />
                        <span className="text-xs text-white font-medium">{ent.name}</span>
                        <span className="text-[10px] text-surface-6">{ent.entityType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              {parsedResult.filters.length > 0 && (
                <div>
                  <div className="text-xs text-muted mb-2">Filters</div>
                  <div className="flex flex-wrap gap-2">
                    {parsedResult.filters.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-3 rounded-md border border-border text-xs">
                        <span className="text-sky-400 font-mono">{f.field}</span>
                        <span className="text-muted">{f.operator}</span>
                        <span className="text-white font-mono">{f.value}</span>
                        {i < parsedResult.filters.length - 1 && (
                          <span className="text-accent font-semibold ml-1">{f.logicalOperator}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aggregations */}
              {parsedResult.aggregations.length > 0 && (
                <div>
                  <div className="text-xs text-muted mb-2">Aggregations</div>
                  <div className="flex flex-wrap gap-2">
                    {parsedResult.aggregations.map((agg, i) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/30 text-xs font-mono">
                        {agg.function}({agg.field}) AS {agg.alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested OQL */}
              {parsedResult.suggestedOQL && (
                <div>
                  <div className="text-xs text-muted mb-2">Suggested OQL</div>
                  <pre className="bg-surface-3 border border-border rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {parsedResult.suggestedOQL}
                  </pre>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="space-y-3">
              <div className="p-4 bg-surface-2 rounded-lg border border-border">
                <div className="text-xs text-muted mb-3">Actions</div>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors">
                    <Play className="w-4 h-4" /> Execute
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-3 hover:bg-surface-4 text-muted hover:text-white rounded-lg text-sm font-medium transition-colors border border-border">
                    <ExternalLink className="w-4 h-4" /> Open in OQL Playground
                  </button>
                </div>
              </div>

              <div className="p-4 bg-surface-2 rounded-lg border border-border">
                <div className="text-xs text-muted mb-2">Raw Query</div>
                <p className="text-xs text-white leading-relaxed">{parsedResult.rawQuery}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Intents */}
      <div className="surface-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold text-white">Recent Intents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs text-muted font-medium">Time</th>
                <th className="text-left py-2 text-xs text-muted font-medium">Query</th>
                <th className="text-center py-2 text-xs text-muted font-medium">Intent</th>
                <th className="text-center py-2 text-xs text-muted font-medium">Confidence</th>
                <th className="text-center py-2 text-xs text-muted font-medium">Visualization</th>
                <th className="text-center py-2 text-xs text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentIntents.map((intent) => (
                <tr key={intent.id} className="border-b border-border/50 hover:bg-surface-2/50">
                  <td className="py-2.5 text-xs text-muted whitespace-nowrap">{intent.parsedAt}</td>
                  <td className="py-2.5 text-xs text-white max-w-[250px] truncate">{intent.rawQuery}</td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${INTENT_COLORS[intent.intent] || ""}`}>
                      {intent.intent}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-500"
                          style={{ width: `${intent.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted">{(intent.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    {intent.visualizationHint && (
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${VIZ_COLORS[intent.visualizationHint] || ""}`}>
                        {intent.visualizationHint}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    <button className="p-1 rounded hover:bg-surface-3 text-muted hover:text-white transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="surface-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted">Total Intents</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.totalIntents}</div>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted">Avg Confidence</span>
          </div>
          <div className="text-xl font-bold text-white">{(stats.avgConfidence * 100).toFixed(0)}%</div>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-muted">Queries This Week</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.queriesThisWeek}</div>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted">Top Intent</span>
          </div>
          <div className="text-xl font-bold text-white capitalize">{stats.topIntent}</div>
        </div>
      </div>
    </div>
  );
}
