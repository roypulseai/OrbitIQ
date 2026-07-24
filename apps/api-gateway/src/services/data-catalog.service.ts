import { Injectable, NotFoundException } from "@nestjs/common";

export interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  type: "table" | "column" | "metric" | "dashboard";
  connectionId: string;
  schema: string;
  tags: string[];
  owner: string;
  lastUpdated: Date;
  lineage: string[];
  qualityScore: number;
}

export interface CatalogSearchResult {
  entry: CatalogEntry;
  relevanceScore: number;
  matchField: string;
}

export interface CatalogStats {
  totalEntries: number;
  tables: number;
  columns: number;
  metrics: number;
  dashboards: number;
}

@Injectable()
export class DataCatalogService {
  private entries: Map<string, CatalogEntry> = new Map();

  constructor() {
    this.seedMockData();
  }

  // ─── Indexing ────────────────────────────────────────────────────────────

  indexConnection(connectionId: string): CatalogEntry[] {
    const now = new Date();
    const tables: Omit<CatalogEntry, "id">[] = [
      {
        name: "Customers",
        description: "Customer master data with contact info and segmentation",
        type: "table",
        connectionId,
        schema: "public",
        tags: ["PII", "core"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["raw Customers → cleaned → aggregated"],
        qualityScore: 0.95,
      },
      {
        name: "Orders",
        description: "All customer orders with line items",
        type: "table",
        connectionId,
        schema: "public",
        tags: ["transactional", "core"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["raw Orders → enriched → Orders"],
        qualityScore: 0.92,
      },
      {
        name: "Products",
        description: "Product catalog with pricing and categories",
        type: "table",
        connectionId,
        schema: "public",
        tags: ["core", "reference"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["raw Products → Products"],
        qualityScore: 0.88,
      },
    ];

    const created: CatalogEntry[] = [];
    for (const def of tables) {
      const entry: CatalogEntry = { id: crypto.randomUUID(), ...def };
      this.entries.set(entry.id, entry);
      created.push(entry);
    }
    return created;
  }

  // ─── Search ──────────────────────────────────────────────────────────────

  search(
    query?: string,
    filters?: { connectionId?: string; type?: string; tags?: string[] }
  ): CatalogSearchResult[] {
    let results = Array.from(this.entries.values());

    if (filters?.connectionId) {
      results = results.filter((e) => e.connectionId === filters.connectionId);
    }
    if (filters?.type) {
      results = results.filter((e) => e.type === filters.type);
    }
    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter((e) =>
        filters.tags!.some((t) => e.tags.includes(t))
      );
    }

    if (query) {
      const q = query.toLowerCase();
      const scored: CatalogSearchResult[] = [];
      for (const entry of results) {
        let score = 0;
        let field = "";
        if (entry.name.toLowerCase().includes(q)) {
          score = 1.0;
          field = "name";
        } else if (entry.description.toLowerCase().includes(q)) {
          score = 0.8;
          field = "description";
        } else if (entry.tags.some((t) => t.toLowerCase().includes(q))) {
          score = 0.6;
          field = "tags";
        }
        if (score > 0) scored.push({ entry, relevanceScore: score, matchField: field });
      }
      return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return results.map((entry) => ({ entry, relevanceScore: 1.0, matchField: "list" }));
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────

  getEntry(id: string): CatalogEntry {
    const entry = this.entries.get(id);
    if (!entry) throw new NotFoundException(`Catalog entry ${id} not found`);
    return entry;
  }

  listEntries(connectionId?: string, type?: string): CatalogEntry[] {
    let results = Array.from(this.entries.values());
    if (connectionId) results = results.filter((e) => e.connectionId === connectionId);
    if (type) results = results.filter((e) => e.type === type);
    return results;
  }

  getEntryLineage(id: string): CatalogEntry {
    return this.getEntry(id);
  }

  addTag(id: string, tag: string): CatalogEntry {
    const entry = this.getEntry(id);
    if (!entry.tags.includes(tag)) entry.tags.push(tag);
    entry.lastUpdated = new Date();
    this.entries.set(id, entry);
    return entry;
  }

  removeTag(id: string, tag: string): CatalogEntry {
    const entry = this.getEntry(id);
    entry.tags = entry.tags.filter((t) => t !== tag);
    entry.lastUpdated = new Date();
    this.entries.set(id, entry);
    return entry;
  }

  updateEntry(id: string, updates: Partial<Omit<CatalogEntry, "id">>): CatalogEntry {
    const entry = this.getEntry(id);
    const updated = {
      ...entry,
      ...Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined)),
      lastUpdated: new Date(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  getStats(connectionId?: string): CatalogStats {
    let results = Array.from(this.entries.values());
    if (connectionId) results = results.filter((e) => e.connectionId === connectionId);
    return {
      totalEntries: results.length,
      tables: results.filter((e) => e.type === "table").length,
      columns: results.filter((e) => e.type === "column").length,
      metrics: results.filter((e) => e.type === "metric").length,
      dashboards: results.filter((e) => e.type === "dashboard").length,
    };
  }

  // ─── Seed ────────────────────────────────────────────────────────────────

  private seedMockData(): void {
    const now = new Date();
    const connId = "conn-default";

    const seedEntries: Omit<CatalogEntry, "id">[] = [
      // Tables
      {
        name: "Customers",
        description: "Customer master data with contact info and segmentation",
        type: "table",
        connectionId: connId,
        schema: "public",
        tags: ["PII", "core"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["raw Customers → cleaned → aggregated"],
        qualityScore: 0.95,
      },
      {
        name: "Orders",
        description: "All customer orders with line items",
        type: "table",
        connectionId: connId,
        schema: "public",
        tags: ["transactional", "core"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["raw Orders → enriched → Orders"],
        qualityScore: 0.92,
      },
      {
        name: "Products",
        description: "Product catalog with pricing and categories",
        type: "table",
        connectionId: connId,
        schema: "public",
        tags: ["core", "reference"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["raw Products → Products"],
        qualityScore: 0.88,
      },
      // Columns
      {
        name: "email",
        description: "Customer email address",
        type: "column",
        connectionId: connId,
        schema: "public",
        tags: ["PII", "contact"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["Customers.email"],
        qualityScore: 0.98,
      },
      {
        name: "revenue",
        description: "Order revenue in USD",
        type: "column",
        connectionId: connId,
        schema: "public",
        tags: ["financial", "metric"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["Orders.total_amount", "Orders.currency"],
        qualityScore: 0.9,
      },
      {
        name: "order_date",
        description: "Date when order was placed",
        type: "column",
        connectionId: connId,
        schema: "public",
        tags: ["temporal"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["Orders.created_at"],
        qualityScore: 0.95,
      },
      {
        name: "customer_name",
        description: "Full name of the customer",
        type: "column",
        connectionId: connId,
        schema: "public",
        tags: ["PII", "name"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["Customers.first_name + Customers.last_name"],
        qualityScore: 0.93,
      },
      {
        name: "product_category",
        description: "Product category classification",
        type: "column",
        connectionId: connId,
        schema: "public",
        tags: ["reference", "dimension"],
        owner: "data-engineering",
        lastUpdated: now,
        lineage: ["Products.category"],
        qualityScore: 0.87,
      },
      // Metrics
      {
        name: "MRR",
        description: "Monthly Recurring Revenue",
        type: "metric",
        connectionId: connId,
        schema: "analytics",
        tags: ["saas", "financial"],
        owner: "analytics-team",
        lastUpdated: now,
        lineage: ["Subscriptions.plan_price × count"],
        qualityScore: 0.85,
      },
      {
        name: "Churn Rate",
        description: "Monthly customer churn rate",
        type: "metric",
        connectionId: connId,
        schema: "analytics",
        tags: ["saas"],
        owner: "analytics-team",
        lastUpdated: now,
        lineage: ["cancelled_subscriptions / total_subscriptions"],
        qualityScore: 0.82,
      },
      {
        name: "AOV",
        description: "Average Order Value",
        type: "metric",
        connectionId: connId,
        schema: "analytics",
        tags: ["retail", "financial"],
        owner: "analytics-team",
        lastUpdated: now,
        lineage: ["SUM(Orders.total) / COUNT(Orders.id)"],
        qualityScore: 0.88,
      },
      // Dashboards
      {
        name: "Revenue Overview",
        description: "High-level revenue dashboard with trend analysis",
        type: "dashboard",
        connectionId: connId,
        schema: "",
        tags: ["executive", "financial"],
        owner: "analytics-team",
        lastUpdated: now,
        lineage: ["MRR", "AOV", "Orders"],
        qualityScore: 0.9,
      },
      {
        name: "Customer Segmentation",
        description: "Customer segments by purchase behavior",
        type: "dashboard",
        connectionId: connId,
        schema: "",
        tags: ["marketing", "customer"],
        owner: "analytics-team",
        lastUpdated: now,
        lineage: ["Customers", "Orders"],
        qualityScore: 0.84,
      },
      {
        name: "Product Performance",
        description: "Product sales and inventory performance metrics",
        type: "dashboard",
        connectionId: connId,
        schema: "",
        tags: ["retail", "inventory"],
        owner: "analytics-team",
        lastUpdated: now,
        lineage: ["Products", "Orders", "revenue"],
        qualityScore: 0.86,
      },
      {
        name: "Churn Analysis",
        description: "Churn metrics and cohort analysis",
        type: "dashboard",
        connectionId: connId,
        schema: "",
        tags: ["saas", "retention"],
        owner: "analytics-team",
        lastUpdated: now,
        lineage: ["Churn Rate", "MRR", "Customers"],
        qualityScore: 0.81,
      },
    ];

    for (const def of seedEntries) {
      const entry: CatalogEntry = { id: crypto.randomUUID(), ...def };
      this.entries.set(entry.id, entry);
    }
  }
}
