import { Injectable } from "@nestjs/common";

export interface ParsedEntity {
  name: string;
  entityType: "dimension" | "measure" | "table";
  sourceModel: string;
  matchedField: string;
}

export interface ParsedFilter {
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "in" | "between";
  value: string;
  logicalOperator: "AND" | "OR";
}

export interface ParsedAggregation {
  field: string;
  function: "SUM" | "COUNT" | "AVG" | "MIN" | "MAX" | "COUNT_DISTINCT";
  alias: string;
}

export interface ParsedIntent {
  id: string;
  rawQuery: string;
  parsedAt: Date;
  intent: "query" | "visualize" | "filter" | "aggregate" | "compare" | "trend" | "forecast" | "explain";
  entities: ParsedEntity[];
  filters: ParsedFilter[];
  aggregations: ParsedAggregation[];
  visualizationHint?: "bar" | "line" | "area" | "pie" | "scatter" | "table" | "kpi";
  confidence: number;
  suggestedOQL?: string;
}

export interface IntentStats {
  totalIntents: number;
  avgConfidence: number;
  queriesThisWeek: number;
  topIntent: string;
}

@Injectable()
export class IntentParserService {
  private recentIntents: ParsedIntent[] = [];

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    this.recentIntents = [
      {
        id: "intent-001",
        rawQuery: "Show me total revenue by region for Q1 2026",
        parsedAt: new Date("2026-07-24T10:15:00Z"),
        intent: "aggregate",
        entities: [
          { name: "revenue", entityType: "measure", sourceModel: "sales-model", matchedField: "sales.revenue" },
          { name: "region", entityType: "dimension", sourceModel: "sales-model", matchedField: "sales.region" },
        ],
        filters: [
          { field: "order_date", operator: ">=", value: "2026-01-01", logicalOperator: "AND" },
          { field: "order_date", operator: "<", value: "2026-04-01", logicalOperator: "AND" },
        ],
        aggregations: [
          { field: "revenue", function: "SUM", alias: "total_revenue" },
        ],
        visualizationHint: "bar",
        confidence: 0.92,
        suggestedOQL: `FROM sales SELECT region, SUM(revenue) AS total_revenue WHERE order_date >= '2026-01-01' AND order_date < '2026-04-01' GROUP BY region ORDER BY total_revenue DESC`,
      },
      {
        id: "intent-002",
        rawQuery: "What's the churn rate trend over the last 12 months?",
        parsedAt: new Date("2026-07-24T09:42:00Z"),
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
        parsedAt: new Date("2026-07-24T08:30:00Z"),
        intent: "compare",
        entities: [
          { name: "revenue", entityType: "measure", sourceModel: "sales-model", matchedField: "sales.revenue" },
          { name: "region", entityType: "dimension", sourceModel: "sales-model", matchedField: "sales.region" },
        ],
        filters: [
          { field: "region", operator: "in", value: "US, EU", logicalOperator: "AND" },
        ],
        aggregations: [
          { field: "revenue", function: "SUM", alias: "total_revenue" },
        ],
        visualizationHint: "bar",
        confidence: 0.90,
        suggestedOQL: `FROM sales SELECT region, SUM(revenue) AS total_revenue WHERE region IN ('US', 'EU') GROUP BY region`,
      },
      {
        id: "intent-004",
        rawQuery: "List all customers with lifetime value above $10,000",
        parsedAt: new Date("2026-07-23T16:55:00Z"),
        intent: "query",
        entities: [
          { name: "customer", entityType: "table", sourceModel: "customers-model", matchedField: "customers" },
          { name: "lifetime_value", entityType: "measure", sourceModel: "customers-model", matchedField: "customers.lifetime_value" },
        ],
        filters: [
          { field: "lifetime_value", operator: ">", value: "10000", logicalOperator: "AND" },
        ],
        aggregations: [],
        visualizationHint: "table",
        confidence: 0.95,
        suggestedOQL: `FROM customers SELECT id, name, email, lifetime_value WHERE lifetime_value > 10000 ORDER BY lifetime_value DESC`,
      },
      {
        id: "intent-005",
        rawQuery: "Forecast next quarter's MRR based on current trends",
        parsedAt: new Date("2026-07-23T14:20:00Z"),
        intent: "forecast",
        entities: [
          { name: "MRR", entityType: "measure", sourceModel: "finance-model", matchedField: "revenue.mrr" },
          { name: "quarter", entityType: "dimension", sourceModel: "finance-model", matchedField: "revenue.quarter" },
        ],
        filters: [],
        aggregations: [
          { field: "mrr", function: "SUM", alias: "total_mrr" },
        ],
        visualizationHint: "line",
        confidence: 0.75,
        suggestedOQL: `FROM revenue SELECT DATE_TRUNC('quarter', period) AS quarter, SUM(mrr) AS total_mrr WHERE period >= DATE_SUB(TODAY, 4, 'quarter') GROUP BY quarter ORDER BY quarter ASC`,
      },
    ];
  }

  parseIntent(query: string, modelId?: string): ParsedIntent {
    const lower = query.toLowerCase();
    let intent: ParsedIntent["intent"] = "query";
    let confidence = 0.85;
    let visualizationHint: ParsedIntent["visualizationHint"] = "table";

    if (lower.match(/\b(show|display|chart|visualize|graph|plot)\b/)) {
      intent = "visualize";
      confidence = 0.88;
    } else if (lower.match(/\b(filter|where|find|search|list|show me)\b/) && !lower.match(/\b(total|sum|count|average)\b/)) {
      intent = "filter";
      confidence = 0.82;
    } else if (lower.match(/\b(total|sum|count|average|avg|min|max|aggregate)\b/)) {
      intent = "aggregate";
      confidence = 0.90;
      visualizationHint = "bar";
    } else if (lower.match(/\b(compare|vs|versus|difference|between)\b/)) {
      intent = "compare";
      confidence = 0.87;
      visualizationHint = "bar";
    } else if (lower.match(/\b(trend|over time|timeline|history|change over)\b/)) {
      intent = "trend";
      confidence = 0.86;
      visualizationHint = "line";
    } else if (lower.match(/\b(forecast|predict|projection|future|estimate)\b/)) {
      intent = "forecast";
      confidence = 0.72;
      visualizationHint = "line";
    } else if (lower.match(/\b(why|explain|reason|cause|impact|driver)\b/)) {
      intent = "explain";
      confidence = 0.78;
    }

    const knownEntities: { pattern: RegExp; name: string; entityType: ParsedEntity["entityType"]; field: string }[] = [
      { pattern: /\brevenue\b/i, name: "revenue", entityType: "measure", field: "sales.revenue" },
      { pattern: /\bcustomer/i, name: "customer", entityType: "table", field: "customers" },
      { pattern: /\border/i, name: "order", entityType: "table", field: "orders" },
      { pattern: /\bregion\b/i, name: "region", entityType: "dimension", field: "sales.region" },
      { pattern: /\bchurn/i, name: "churn_rate", entityType: "measure", field: "subscriptions.churn_rate" },
      { pattern: /\bmonth\b/i, name: "month", entityType: "dimension", field: "time.month" },
      { pattern: /\bquarter\b/i, name: "quarter", entityType: "dimension", field: "time.quarter" },
      { pattern: /\byear\b/i, name: "year", entityType: "dimension", field: "time.year" },
      { pattern: /\bMRR\b/, name: "MRR", entityType: "measure", field: "revenue.mrr" },
      { pattern: /\blifetime.value|LTV\b/i, name: "lifetime_value", entityType: "measure", field: "customers.ltv" },
      { pattern: /\bproduct\b/i, name: "product", entityType: "dimension", field: "products.name" },
      { pattern: /\bcategory\b/i, name: "category", entityType: "dimension", field: "products.category" },
    ];

    const entities: ParsedEntity[] = [];
    for (const ent of knownEntities) {
      if (ent.pattern.test(query)) {
        entities.push({
          name: ent.name,
          entityType: ent.entityType,
          sourceModel: modelId || "default-model",
          matchedField: ent.field,
        });
      }
    }

    const filters: ParsedFilter[] = [];
    const aggFunctions: ParsedAggregation[] = [];

    if (intent === "aggregate" || intent === "compare") {
      const measure = entities.find((e) => e.entityType === "measure");
      if (measure) {
        aggFunctions.push({
          field: measure.name,
          function: "SUM",
          alias: `total_${measure.name}`,
        });
      }
    }

    if (lower.match(/\babove|greater|more than|over|>\s*\$?[\d,]+\b/)) {
      const match = query.match(/(?:above|greater|more than|over|>)\s*\$?([\d,]+)/i);
      if (match) {
        const measure = entities.find((e) => e.entityType === "measure");
        filters.push({
          field: measure?.name || "value",
          operator: ">",
          value: match[1].replace(/,/g, ""),
          logicalOperator: "AND",
        });
      }
    }

    let suggestedOQL = "";
    if (entities.length > 0) {
      const table = entities.find((e) => e.entityType === "table")?.matchedField || "data";
      const dims = entities.filter((e) => e.entityType === "dimension");
      const measures = entities.filter((e) => e.entityType === "measure");

      const selectParts: string[] = [];
      dims.forEach((d) => selectParts.push(d.name));
      measures.forEach((m) => {
        if (aggFunctions.length > 0) {
          const agg = aggFunctions.find((a) => a.field === m.name);
          if (agg) {
            selectParts.push(`${agg.function}(${m.matchedField}) AS ${agg.alias}`);
          } else {
            selectParts.push(m.name);
          }
        } else {
          selectParts.push(m.name);
        }
      });

      if (selectParts.length === 0) selectParts.push("*");

      suggestedOQL = `FROM ${table} SELECT ${selectParts.join(", ")}`;

      if (filters.length > 0) {
        const filterClauses = filters.map((f) => `${f.field} ${f.operator} '${f.value}'`);
        suggestedOQL += ` WHERE ${filterClauses.join(" AND ")}`;
      }

      if (dims.length > 0 && aggFunctions.length > 0) {
        suggestedOQL += ` GROUP BY ${dims.map((d) => d.name).join(", ")}`;
      }

      suggestedOQL += ` LIMIT 100`;
    }

    confidence += Math.random() * 0.05 - 0.025;
    confidence = Math.min(0.99, Math.max(0.5, confidence));

    const intentResult: ParsedIntent = {
      id: `intent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      rawQuery: query,
      parsedAt: new Date(),
      intent,
      entities,
      filters,
      aggregations: aggFunctions,
      visualizationHint,
      confidence: Math.round(confidence * 100) / 100,
      suggestedOQL: suggestedOQL || undefined,
    };

    this.recentIntents.unshift(intentResult);
    if (this.recentIntents.length > 50) {
      this.recentIntents = this.recentIntents.slice(0, 50);
    }

    return intentResult;
  }

  getRecentIntents(limit: number = 10): ParsedIntent[] {
    return this.recentIntents.slice(0, limit);
  }

  getIntentStats(): IntentStats {
    const total = this.recentIntents.length;
    const avgConfidence = total > 0
      ? this.recentIntents.reduce((sum, i) => sum + i.confidence, 0) / total
      : 0;

    const intentCounts: Record<string, number> = {};
    this.recentIntents.forEach((i) => {
      intentCounts[i.intent] = (intentCounts[i.intent] || 0) + 1;
    });
    const topIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "query";

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const queriesThisWeek = this.recentIntents.filter((i) => i.parsedAt >= weekAgo).length;

    return {
      totalIntents: total,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      queriesThisWeek,
      topIntent,
    };
  }
}
