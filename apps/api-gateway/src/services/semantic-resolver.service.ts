import { Injectable } from "@nestjs/common";
import { ParsedIntent, ParsedEntity } from "./intent-parser.service";

export interface AvailableEntity {
  name: string;
  type: string;
  dataType: string;
  sourceTable: string;
}

export interface QueryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  oql: string;
}

@Injectable()
export class SemanticResolverService {
  private modelEntities: Map<string, AvailableEntity[]> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    this.modelEntities.set("sales-model", [
      { name: "order_id", type: "dimension", dataType: "string", sourceTable: "orders" },
      { name: "order_date", type: "dimension", dataType: "date", sourceTable: "orders" },
      { name: "region", type: "dimension", dataType: "string", sourceTable: "orders" },
      { name: "country", type: "dimension", dataType: "string", sourceTable: "orders" },
      { name: "product_category", type: "dimension", dataType: "string", sourceTable: "orders" },
      { name: "customer_segment", type: "dimension", dataType: "string", sourceTable: "orders" },
      { name: "revenue", type: "measure", dataType: "decimal", sourceTable: "orders" },
      { name: "quantity", type: "measure", dataType: "integer", sourceTable: "orders" },
      { name: "discount", type: "measure", dataType: "decimal", sourceTable: "orders" },
      { name: "profit", type: "measure", dataType: "decimal", sourceTable: "orders" },
    ]);

    this.modelEntities.set("subscriptions-model", [
      { name: "subscription_id", type: "dimension", dataType: "string", sourceTable: "subscriptions" },
      { name: "plan", type: "dimension", dataType: "string", sourceTable: "subscriptions" },
      { name: "status", type: "dimension", dataType: "string", sourceTable: "subscriptions" },
      { name: "start_date", type: "dimension", dataType: "date", sourceTable: "subscriptions" },
      { name: "month", type: "dimension", dataType: "date", sourceTable: "subscriptions" },
      { name: "mrr", type: "measure", dataType: "decimal", sourceTable: "subscriptions" },
      { name: "churn_rate", type: "measure", dataType: "decimal", sourceTable: "subscriptions" },
      { name: "ltv", type: "measure", dataType: "decimal", sourceTable: "subscriptions" },
      { name: "subscriber_count", type: "measure", dataType: "integer", sourceTable: "subscriptions" },
    ]);

    this.modelEntities.set("customers-model", [
      { name: "customer_id", type: "dimension", dataType: "string", sourceTable: "customers" },
      { name: "name", type: "dimension", dataType: "string", sourceTable: "customers" },
      { name: "email", type: "dimension", dataType: "string", sourceTable: "customers" },
      { name: "segment", type: "dimension", dataType: "string", sourceTable: "customers" },
      { name: "region", type: "dimension", dataType: "string", sourceTable: "customers" },
      { name: "lifetime_value", type: "measure", dataType: "decimal", sourceTable: "customers" },
      { name: "order_count", type: "measure", dataType: "integer", sourceTable: "customers" },
      { name: "avg_order_value", type: "measure", dataType: "decimal", sourceTable: "customers" },
      { name: "last_order_date", type: "dimension", dataType: "date", sourceTable: "customers" },
    ]);
  }

  resolveToQuery(intent: ParsedIntent, modelId: string): string {
    const entities = this.modelEntities.get(modelId) || this.modelEntities.get("sales-model") || [];

    const selectParts: string[] = [];
    const measureParts: string[] = [];
    const whereParts: string[] = [];
    const groupByParts: string[] = [];

    intent.entities.forEach((ent) => {
      const matched = entities.find(
        (e) => e.name === ent.matchedField?.split(".").pop() || e.name === ent.name
      );
      if (matched) {
        if (matched.type === "dimension") {
          selectParts.push(matched.name);
          groupByParts.push(matched.name);
        } else {
          if (intent.aggregations.length > 0) {
            const agg = intent.aggregations.find((a) => a.field === ent.name);
            if (agg) {
              measureParts.push(`${agg.function}(${matched.name}) AS ${agg.alias}`);
            } else {
              measureParts.push(matched.name);
            }
          } else {
            measureParts.push(matched.name);
          }
        }
      }
    });

    intent.filters.forEach((filter) => {
      const matched = entities.find((e) => e.name === filter.field);
      const fieldName = matched?.name || filter.field;
      whereParts.push(`${fieldName} ${filter.operator} '${filter.value}'`);
    });

    const allSelect = [...selectParts, ...measureParts];
    if (allSelect.length === 0) allSelect.push("*");

    let oql = `FROM ${modelId} SELECT ${allSelect.join(", ")}`;
    if (whereParts.length > 0) {
      oql += ` WHERE ${whereParts.join(" AND ")}`;
    }
    if (groupByParts.length > 0 && measureParts.length > 0) {
      oql += ` GROUP BY ${groupByParts.join(", ")}`;
    }
    if (intent.entities.find((e) => e.entityType === "measure")) {
      const measure = intent.entities.find((e) => e.entityType === "measure");
      if (measure && groupByParts.length > 0) {
        const alias = intent.aggregations[0]?.alias || measure.name;
        oql += ` ORDER BY ${alias} DESC`;
      }
    }
    oql += ` LIMIT 100`;

    return oql;
  }

  getAvailableEntities(modelId: string): AvailableEntity[] {
    return this.modelEntities.get(modelId) || this.modelEntities.get("sales-model") || [];
  }

  suggestVisualizations(intent: ParsedIntent): { type: string; reason: string; confidence: number }[] {
    const suggestions: { type: string; reason: string; confidence: number }[] = [];

    if (intent.intent === "trend" || intent.intent === "forecast") {
      suggestions.push({ type: "line", reason: "Trend and forecast queries are best visualized with line charts", confidence: 0.95 });
      suggestions.push({ type: "area", reason: "Area charts can show volume changes over time", confidence: 0.70 });
    }

    if (intent.intent === "compare") {
      suggestions.push({ type: "bar", reason: "Bar charts are ideal for comparing values across categories", confidence: 0.92 });
      suggestions.push({ type: "pie", reason: "Pie charts show proportional composition", confidence: 0.60 });
    }

    if (intent.intent === "aggregate") {
      if (intent.entities.some((e) => e.entityType === "dimension")) {
        suggestions.push({ type: "bar", reason: "Aggregated data grouped by dimension works well with bar charts", confidence: 0.88 });
        suggestions.push({ type: "pie", reason: "Show proportional breakdown of aggregated values", confidence: 0.65 });
      } else {
        suggestions.push({ type: "kpi", reason: "Single aggregated metric is best shown as a KPI card", confidence: 0.90 });
      }
    }

    if (intent.intent === "query" || intent.intent === "filter") {
      suggestions.push({ type: "table", reason: "Raw query results are best displayed in a table", confidence: 0.85 });
    }

    if (intent.intent === "visualize") {
      suggestions.push({ type: "bar", reason: "Default visualization for ad-hoc exploration", confidence: 0.75 });
      suggestions.push({ type: "line", reason: "Consider time-series if data has a temporal component", confidence: 0.65 });
    }

    if (intent.intent === "explain") {
      suggestions.push({ type: "bar", reason: "Explanatory queries benefit from bar charts showing comparisons", confidence: 0.80 });
      suggestions.push({ type: "scatter", reason: "Scatter plots can reveal correlations and drivers", confidence: 0.70 });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  validateQuery(oql: string, modelId: string): QueryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const entities = this.getAvailableEntities(modelId);

    if (!oql.trim()) {
      errors.push("OQL query is empty");
      return { valid: false, errors, warnings, oql };
    }

    const upper = oql.toUpperCase();
    if (!upper.includes("SELECT")) {
      errors.push("OQL query must include a SELECT clause");
    }
    if (!upper.includes("FROM")) {
      errors.push("OQL query must include a FROM clause");
    }

    const selectMatch = oql.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch) {
      const columns = selectMatch[1].split(",").map((c) => {
        const parts = c.trim().split(/\s+AS\s+/i);
        const col = parts[0].trim();
        const aggMatch = col.match(/\w+\((.+)\)/);
        return (aggMatch ? aggMatch[1] : col).trim();
      });

      columns.forEach((col) => {
        if (col !== "*" && !col.match(/\d/) && !entities.some((e) => e.name === col)) {
          warnings.push(`Column "${col}" not found in model "${modelId}"`);
        }
      });
    }

    if (upper.includes("DELETE") || upper.includes("UPDATE") || upper.includes("INSERT")) {
      errors.push("OQL only supports SELECT queries");
    }

    if (!upper.includes("LIMIT")) {
      warnings.push("Consider adding a LIMIT clause to prevent large result sets");
    }

    if (upper.includes("SELECT *")) {
      warnings.push("Consider selecting specific columns instead of SELECT *");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      oql,
    };
  }
}
