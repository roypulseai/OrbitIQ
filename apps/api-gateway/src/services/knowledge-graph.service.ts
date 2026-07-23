import { Injectable, NotFoundException } from "@nestjs/common";

export interface KGEntity {
  id: string;
  name: string;
  description: string;
  type: "entity" | "metric" | "relationship" | "attribute";
  vertical: "retail" | "saas" | "finance" | "healthcare" | "manufacturing" | "general";
  synonyms: string[];
  exampleColumns: string[];
  dataType?: string;
  createdAt: Date;
}

export interface KGRelationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  relationshipType: string;
  description: string;
  cardinality: "1:1" | "1:N" | "N:N";
  typicalIn: string[];
}

export interface KGMatch {
  id: string;
  sourceColumnName: string;
  sourceTableId: string;
  matchedEntityId: string;
  confidence: number;
  matchType: "name" | "synonym" | "semantic" | "pattern";
  createdAt: Date;
}

export interface DiscoveryRun {
  id: string;
  connectionId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  finishedAt?: Date;
  findings: { type: string; message: string; severity: string; column?: string; table?: string }[];
}

export interface KGStats {
  totalEntities: number;
  totalRelationships: number;
  totalMatches: number;
  verticalsCount: number;
}

export interface VerticalInfo {
  name: string;
  entityCount: number;
  relationshipCount: number;
}

@Injectable()
export class KnowledgeGraphService {
  private entities: Map<string, KGEntity> = new Map();
  private relationships: Map<string, KGRelationship> = new Map();
  private matches: Map<string, KGMatch> = new Map();
  private discoveryRuns: Map<string, DiscoveryRun> = new Map();

  constructor() {
    this.seedMockData();
  }

  // ─── Entity CRUD ────────────────────────────────────────────────────────

  createEntity(input: {
    name: string;
    description: string;
    type: KGEntity["type"];
    vertical: KGEntity["vertical"];
    synonyms: string[];
    exampleColumns: string[];
    dataType?: string;
  }): KGEntity {
    const entity: KGEntity = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
    };
    this.entities.set(entity.id, entity);
    return entity;
  }

  getEntity(id: string): KGEntity {
    const entity = this.entities.get(id);
    if (!entity) throw new NotFoundException(`KG entity ${id} not found`);
    return entity;
  }

  updateEntity(
    id: string,
    input: {
      name?: string;
      description?: string;
      type?: KGEntity["type"];
      vertical?: KGEntity["vertical"];
      synonyms?: string[];
      exampleColumns?: string[];
    }
  ): KGEntity {
    const entity = this.getEntity(id);
    const updated: KGEntity = {
      ...entity,
      ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
    };
    this.entities.set(id, updated);
    return updated;
  }

  deleteEntity(id: string): boolean {
    if (!this.entities.has(id)) throw new NotFoundException(`KG entity ${id} not found`);
    this.entities.delete(id);
    return true;
  }

  listEntities(vertical?: string, type?: string): KGEntity[] {
    let results = Array.from(this.entities.values());
    if (vertical) results = results.filter((e) => e.vertical === vertical);
    if (type) results = results.filter((e) => e.type === type);
    return results;
  }

  // ─── Relationship CRUD ──────────────────────────────────────────────────

  createRelationship(input: {
    fromEntityId: string;
    toEntityId: string;
    relationshipType: string;
    description: string;
    cardinality: KGRelationship["cardinality"];
    typicalIn: string[];
  }): KGRelationship {
    this.getEntity(input.fromEntityId);
    this.getEntity(input.toEntityId);
    const rel: KGRelationship = {
      id: crypto.randomUUID(),
      ...input,
    };
    this.relationships.set(rel.id, rel);
    return rel;
  }

  getRelationship(id: string): KGRelationship {
    const rel = this.relationships.get(id);
    if (!rel) throw new NotFoundException(`KG relationship ${id} not found`);
    return rel;
  }

  deleteRelationship(id: string): boolean {
    if (!this.relationships.has(id)) throw new NotFoundException(`KG relationship ${id} not found`);
    this.relationships.delete(id);
    return true;
  }

  listRelationships(vertical?: string): KGRelationship[] {
    if (!vertical) return Array.from(this.relationships.values());
    return Array.from(this.relationships.values()).filter((r) => r.typicalIn.includes(vertical));
  }

  // ─── Search ─────────────────────────────────────────────────────────────

  searchEntities(query: string, vertical?: string): KGEntity[] {
    const q = query.toLowerCase();
    let results = Array.from(this.entities.values());
    if (vertical) results = results.filter((e) => e.vertical === vertical);
    return results.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.synonyms.some((s) => s.toLowerCase().includes(q))
    );
  }

  // ─── Column Matching ────────────────────────────────────────────────────

  matchColumnsToEntities(
    columns: { name: string; table: string; sampleValues: string[] }[],
    vertical?: string
  ): KGMatch[] {
    const results: KGMatch[] = [];
    let candidates = Array.from(this.entities.values());
    if (vertical) candidates = candidates.filter((e) => e.vertical === vertical);

    for (const col of columns) {
      const nameLower = col.name.toLowerCase();
      let bestMatch: { entity: KGEntity; confidence: number; matchType: KGMatch["matchType"] } | null = null;

      for (const entity of candidates) {
        // Exact name match
        if (entity.name.toLowerCase() === nameLower) {
          bestMatch = { entity, confidence: 0.99, matchType: "name" };
          break;
        }

        // Synonym match
        for (const syn of entity.synonyms) {
          if (syn.toLowerCase() === nameLower) {
            if (!bestMatch || bestMatch.confidence < 0.92) {
              bestMatch = { entity, confidence: 0.92, matchType: "synonym" };
            }
          }
        }

        // Partial name match
        if (entity.name.toLowerCase().includes(nameLower) || nameLower.includes(entity.name.toLowerCase())) {
          if (!bestMatch || bestMatch.confidence < 0.75) {
            bestMatch = { entity, confidence: 0.75, matchType: "semantic" };
          }
        }

        // Example column match
        for (const ex of entity.exampleColumns) {
          if (ex.toLowerCase() === nameLower) {
            if (!bestMatch || bestMatch.confidence < 0.85) {
              bestMatch = { entity, confidence: 0.85, matchType: "pattern" };
            }
          }
        }
      }

      if (bestMatch) {
        const match: KGMatch = {
          id: crypto.randomUUID(),
          sourceColumnName: col.name,
          sourceTableId: col.table,
          matchedEntityId: bestMatch.entity.id,
          confidence: bestMatch.confidence,
          matchType: bestMatch.matchType,
          createdAt: new Date(),
        };
        this.matches.set(match.id, match);
        results.push(match);
      }
    }

    return results;
  }

  // ─── Discovery ──────────────────────────────────────────────────────────

  runDiscovery(connectionId: string): DiscoveryRun {
    const run: DiscoveryRun = {
      id: crypto.randomUUID(),
      connectionId,
      status: "completed",
      startedAt: new Date(),
      finishedAt: new Date(),
      findings: [
        { type: "entity_detected", message: "Column 'customer_id' likely represents Customer entity", severity: "info", column: "customer_id", table: "tbl-customers" },
        { type: "entity_detected", message: "Column 'order_date' matches OrderDate entity pattern", severity: "info", column: "order_date", table: "tbl-orders" },
        { type: "metric_detected", message: "Column 'total_amount' maps to Revenue metric", severity: "info", column: "total_amount", table: "tbl-orders" },
        { type: "relationship_suggested", message: "Customer -> Order relationship detected via customer_id FK", severity: "medium", column: "customer_id", table: "tbl-orders" },
        { type: "pii_warning", message: "Column 'email' contains personally identifiable information", severity: "high", column: "email", table: "tbl-customers" },
      ],
    };
    this.discoveryRuns.set(run.id, run);
    return run;
  }

  getDiscoveryRun(id: string): DiscoveryRun {
    const run = this.discoveryRuns.get(id);
    if (!run) throw new NotFoundException(`Discovery run ${id} not found`);
    return run;
  }

  listDiscoveryRuns(connectionId?: string): DiscoveryRun[] {
    const all = Array.from(this.discoveryRuns.values());
    if (connectionId) return all.filter((r) => r.connectionId === connectionId);
    return all;
  }

  // ─── Stats ──────────────────────────────────────────────────────────────

  getVerticals(): VerticalInfo[] {
    const verticals = new Map<string, { entityCount: number; relationshipCount: number }>();
    for (const entity of this.entities.values()) {
      const v = verticals.get(entity.vertical) || { entityCount: 0, relationshipCount: 0 };
      v.entityCount++;
      verticals.set(entity.vertical, v);
    }
    for (const rel of this.relationships.values()) {
      for (const v of rel.typicalIn) {
        const entry = verticals.get(v) || { entityCount: 0, relationshipCount: 0 };
        entry.relationshipCount++;
        verticals.set(v, entry);
      }
    }
    return Array.from(verticals.entries()).map(([name, counts]) => ({
      name,
      ...counts,
    }));
  }

  getGraphStats(): KGStats {
    const verticals = new Set(Array.from(this.entities.values()).map((e) => e.vertical));
    return {
      totalEntities: this.entities.size,
      totalRelationships: this.relationships.size,
      totalMatches: this.matches.size,
      verticalsCount: verticals.size,
    };
  }

  // ─── Seed ───────────────────────────────────────────────────────────────

  private seedMockData(): void {
    const now = new Date();

    // ── Retail Vertical ───────────────────────────────────────────────
    const retailEntities: Omit<KGEntity, "id" | "createdAt">[] = [
      { name: "Customer", description: "A buyer or shopper who purchases products", type: "entity", vertical: "retail", synonyms: ["buyer", "shopper", "consumer", "client"], exampleColumns: ["customer_id", "cust_id", "buyer_id", "account_id"], dataType: "bigint" },
      { name: "Order", description: "A purchase transaction made by a customer", type: "entity", vertical: "retail", synonyms: ["purchase", "transaction", "sale", "checkout"], exampleColumns: ["order_id", "purchase_id", "txn_id", "sale_id"], dataType: "bigint" },
      { name: "Product", description: "An item available for sale", type: "entity", vertical: "retail", synonyms: ["item", "sku", "merchandise", "goods"], exampleColumns: ["product_id", "item_id", "sku_id", "product_sku"], dataType: "bigint" },
      { name: "Revenue", description: "Total income from sales", type: "metric", vertical: "retail", synonyms: ["sales", "gmv", "net_sales", "income"], exampleColumns: ["revenue", "total_amount", "gross_sales", "net_revenue"], dataType: "decimal" },
      { name: "Quantity", description: "Number of units sold", type: "metric", vertical: "retail", synonyms: ["qty", "units", "amount_sold"], exampleColumns: ["quantity", "qty", "units_sold", "item_count"], dataType: "int" },
      { name: "OrderDate", description: "Date when an order was placed", type: "attribute", vertical: "retail", synonyms: ["purchase_date", "transaction_date", "sale_date"], exampleColumns: ["order_date", "purchase_date", "txn_date", "created_at"], dataType: "date" },
      { name: "Category", description: "Product classification or department", type: "attribute", vertical: "retail", synonyms: ["product_category", "department", "product_line"], exampleColumns: ["category", "product_category", "department", "product_line"], dataType: "varchar" },
      { name: "Price", description: "Unit price of a product", type: "metric", vertical: "retail", synonyms: ["unit_price", "cost", "msrp"], exampleColumns: ["price", "unit_price", "msrp", "list_price"], dataType: "decimal" },
    ];

    const retailIds: Record<string, string> = {};
    for (const def of retailEntities) {
      const entity = this.createEntity(def);
      retailIds[def.name] = entity.id;
    }

    // ── SaaS Vertical ─────────────────────────────────────────────────
    const saasEntities: Omit<KGEntity, "id" | "createdAt">[] = [
      { name: "Subscriber", description: "A user or tenant subscribed to a service", type: "entity", vertical: "saas", synonyms: ["user", "account", "tenant", "customer"], exampleColumns: ["subscriber_id", "user_id", "account_id", "tenant_id"], dataType: "bigint" },
      { name: "Subscription", description: "An active subscription plan for a subscriber", type: "entity", vertical: "saas", synonyms: ["plan", "license", "contract", "mrr"], exampleColumns: ["subscription_id", "plan_id", "license_id", "contract_id"], dataType: "bigint" },
      { name: "MRR", description: "Monthly Recurring Revenue from subscriptions", type: "metric", vertical: "saas", synonyms: ["monthly_recurring_revenue", "recurring_revenue"], exampleColumns: ["mrr", "monthly_revenue", "recurring_revenue"], dataType: "decimal" },
      { name: "Churn", description: "Rate at which subscribers cancel or downgrade", type: "metric", vertical: "saas", synonyms: ["churn_rate", "cancellation", "attrition", "downgrade"], exampleColumns: ["churn_rate", "cancellation_rate", "attrition"], dataType: "decimal" },
      { name: "NRR", description: "Net Revenue Retention — revenue retained including expansion", type: "metric", vertical: "saas", synonyms: ["net_revenue_retention", "expansion_rate"], exampleColumns: ["nrr", "net_retention", "revenue_retention"], dataType: "decimal" },
      { name: "FeatureUsage", description: "Tracking of feature adoption and engagement", type: "attribute", vertical: "saas", synonyms: ["usage", "activity", "engagement", "adoption"], exampleColumns: ["feature_usage", "usage_count", "activity_log", "engagement_score"], dataType: "int" },
      { name: "PlanTier", description: "Pricing tier or plan level", type: "attribute", vertical: "saas", synonyms: ["plan", "tier", "level", "pricing_tier"], exampleColumns: ["plan_tier", "tier", "plan_level", "pricing_plan"], dataType: "varchar" },
      { name: "BillingCycle", description: "Billing period and renewal schedule", type: "attribute", vertical: "saas", synonyms: ["billing_period", "renewal_date", "renewal_cycle"], exampleColumns: ["billing_cycle", "renewal_date", "billing_period"], dataType: "varchar" },
    ];

    const saasIds: Record<string, string> = {};
    for (const def of saasEntities) {
      const entity = this.createEntity(def);
      saasIds[def.name] = entity.id;
    }

    // ── Relationships ─────────────────────────────────────────────────
    const relationships: Omit<KGRelationship, "id">[] = [
      { fromEntityId: retailIds["Customer"], toEntityId: retailIds["Order"], relationshipType: "places", description: "Customer places orders", cardinality: "1:N", typicalIn: ["retail"] },
      { fromEntityId: retailIds["Order"], toEntityId: retailIds["Product"], relationshipType: "contains", description: "Orders contain products", cardinality: "N:N", typicalIn: ["retail"] },
      { fromEntityId: saasIds["Subscriber"], toEntityId: saasIds["Subscription"], relationshipType: "has", description: "Subscriber has subscriptions", cardinality: "1:N", typicalIn: ["saas"] },
      { fromEntityId: saasIds["Subscription"], toEntityId: saasIds["MRR"], relationshipType: "generates", description: "Subscriptions generate MRR", cardinality: "1:1", typicalIn: ["saas"] },
    ];

    for (const def of relationships) {
      const rel: KGRelationship = { id: crypto.randomUUID(), ...def };
      this.relationships.set(rel.id, rel);
    }
  }
}
