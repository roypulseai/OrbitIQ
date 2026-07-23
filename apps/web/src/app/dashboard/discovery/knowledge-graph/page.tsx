"use client";

import { useState } from "react";
import { Brain, GitBranch, Globe, Plus, X, Trash2, Edit } from "lucide-react";

interface Entity {
  id: string;
  name: string;
  type: string;
  vertical: string;
  synonyms: string[];
  exampleColumns: string[];
  description: string;
}

const RETAIL_ENTITIES: Entity[] = [
  { id: "r1", name: "Customer", type: "entity", vertical: "retail", synonyms: ["buyer", "shopper", "consumer", "client"], exampleColumns: ["customer_id", "customer_name", "buyer_id"], description: "A person or organization that purchases goods or services" },
  { id: "r2", name: "Order", type: "entity", vertical: "retail", synonyms: ["purchase", "transaction", "sale", "checkout"], exampleColumns: ["order_id", "order_number", "purchase_id"], description: "A purchase transaction made by a customer" },
  { id: "r3", name: "Product", type: "entity", vertical: "retail", synonyms: ["item", "SKU", "merchandise", "goods"], exampleColumns: ["product_id", "product_name", "item_name"], description: "A goods item available for sale" },
  { id: "r4", name: "Revenue", type: "metric", vertical: "retail", synonyms: ["sales", "GMV", "net_sales", "income"], exampleColumns: ["total_revenue", "net_revenue", "gross_sales"], description: "Total income from sales" },
  { id: "r5", name: "Quantity", type: "attribute", vertical: "retail", synonyms: ["qty", "units", "amount_sold"], exampleColumns: ["qty_sold", "quantity", "units_sold"], description: "Number of units sold" },
  { id: "r6", name: "OrderDate", type: "attribute", vertical: "retail", synonyms: ["purchase_date", "transaction_date", "sale_date"], exampleColumns: ["order_date", "purchase_date", "created_at"], description: "Date when an order was placed" },
  { id: "r7", name: "Category", type: "attribute", vertical: "retail", synonyms: ["product_category", "department", "product_line"], exampleColumns: ["category", "product_category", "department"], description: "Product classification group" },
  { id: "r8", name: "Price", type: "metric", vertical: "retail", synonyms: ["unit_price", "cost", "MSRP"], exampleColumns: ["price", "unit_price", "list_price"], description: "Monetary value of a product" },
];

const SAAS_ENTITIES: Entity[] = [
  { id: "s1", name: "Subscriber", type: "entity", vertical: "saas", synonyms: ["user", "account", "tenant", "customer"], exampleColumns: ["subscriber_id", "user_id", "account_id"], description: "A user or tenant subscribed to the service" },
  { id: "s2", name: "Subscription", type: "entity", vertical: "saas", synonyms: ["plan", "license", "contract"], exampleColumns: ["subscription_id", "plan_id", "license_id"], description: "An active subscription to the service" },
  { id: "s3", name: "MRR", type: "metric", vertical: "saas", synonyms: ["monthly_recurring_revenue", "recurring_revenue"], exampleColumns: ["mrr", "mrr_amount", "monthly_revenue"], description: "Monthly Recurring Revenue" },
  { id: "s4", name: "Churn", type: "metric", vertical: "saas", synonyms: ["churn_rate", "cancellation", "attrition"], exampleColumns: ["churn_flag", "churn_rate", "cancellation_reason"], description: "Rate at which subscribers cancel" },
  { id: "s5", name: "NRR", type: "metric", vertical: "saas", synonyms: ["net_revenue_retention", "expansion_rate"], exampleColumns: ["nrr", "net_retention", "revenue_retention"], description: "Net Revenue Retention rate" },
  { id: "s6", name: "FeatureUsage", type: "entity", vertical: "saas", synonyms: ["usage", "activity", "engagement"], exampleColumns: ["feature_usage", "usage_count", "activity_log"], description: "Tracking of feature adoption and usage" },
  { id: "s7", name: "PlanTier", type: "attribute", vertical: "saas", synonyms: ["plan", "tier", "level", "pricing_tier"], exampleColumns: ["plan_tier", "subscription_plan", "pricing_tier"], description: "Subscription plan level" },
  { id: "s8", name: "BillingCycle", type: "attribute", vertical: "saas", synonyms: ["billing_period", "renewal_date", "renewal_cycle"], exampleColumns: ["billing_cycle", "renewal_date", "next_billing"], description: "Billing frequency and renewal cycle" },
];

const ALL_ENTITIES = [...RETAIL_ENTITIES, ...SAAS_ENTITIES];

const RELATIONSHIPS = [
  { from: "Customer", to: "Order", type: "places", cardinality: "1:N", vertical: "retail" },
  { from: "Order", to: "Product", type: "contains", cardinality: "N:N", vertical: "retail" },
  { from: "Subscriber", to: "Subscription", type: "has", cardinality: "1:N", vertical: "saas" },
  { from: "Subscription", to: "MRR", type: "generates", cardinality: "1:1", vertical: "saas" },
];

const TYPE_COLORS: Record<string, string> = {
  entity: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  metric: "bg-green-500/15 text-green-400 border-green-500/20",
  relationship: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  attribute: "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

const VERTICAL_COLORS: Record<string, string> = {
  retail: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  saas: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

export default function KnowledgeGraphPage() {
  const [selectedVertical, setSelectedVertical] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const entities = selectedVertical === "all" ? ALL_ENTITIES : ALL_ENTITIES.filter((e) => e.vertical === selectedVertical);

  // Simple SVG layout
  const nodePositions: Record<string, { x: number; y: number }> = {};
  const retailNodes = RETAIL_ENTITIES.map((e, i) => ({ ...e, x: 120, y: 60 + i * 65 }));
  const saasNodes = SAAS_ENTITIES.map((e, i) => ({ ...e, x: 520, y: 60 + i * 65 }));
  [...retailNodes, ...saasNodes].forEach((n) => { nodePositions[n.name] = { x: n.x, y: n.y }; });

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Graph</h1>
          <p className="text-surface-6 text-sm mt-1">Industry ontology of canonical business entities and relationships</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Entity
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Entities", value: ALL_ENTITIES.length, color: "text-blue-400", icon: Brain },
          { label: "Relationships", value: RELATIONSHIPS.length, color: "text-purple-400", icon: GitBranch },
          { label: "Verticals", value: 2, color: "text-green-400", icon: Globe },
        ].map((s) => (
          <div key={s.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-6">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Vertical Tabs */}
      <div className="flex gap-2">
        {["all", "retail", "saas"].map((v) => (
          <button
            key={v}
            onClick={() => setSelectedVertical(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedVertical === v ? "bg-accent text-white" : "bg-surface-2 border border-border text-white/60 hover:text-white"}`}
          >
            {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Graph Visualization */}
      <div className="bg-surface-2 border border-border rounded-xl p-5 relative">
        <svg width="100%" height="560" viewBox="0 0 750 560">
          {/* Edges */}
          {RELATIONSHIPS.filter((r) => selectedVertical === "all" || r.vertical === selectedVertical).map((rel, i) => {
            const from = nodePositions[rel.from];
            const to = nodePositions[rel.to];
            if (!from || !to) return null;
            return (
              <g key={i}>
                <line x1={from.x + 80} y1={from.y + 18} x2={to.x} y2={to.y + 18} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <text x={(from.x + 80 + to.x) / 2} y={(from.y + to.y) / 2 + 15} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">
                  {rel.type} ({rel.cardinality})
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {entities.map((entity) => {
            const pos = nodePositions[entity.name];
            if (!pos) return null;
            return (
              <g
                key={entity.id}
                onClick={() => setSelectedEntity(entity)}
                className="cursor-pointer"
              >
                <rect
                  x={pos.x - 5}
                  y={pos.y - 5}
                  width="170"
                  height="40"
                  rx="8"
                  fill="rgba(17,17,19,0.95)"
                  stroke={selectedEntity?.id === entity.id ? "#6366f1" : entity.vertical === "retail" ? "rgba(6,182,212,0.4)" : "rgba(168,85,247,0.4)"}
                  strokeWidth={selectedEntity?.id === entity.id ? "2" : "1"}
                />
                <text x={pos.x + 8} y={pos.y + 14} fill="white" fontSize="12" fontWeight="600">{entity.name}</text>
                <text x={pos.x + 8} y={pos.y + 28} fill="rgba(255,255,255,0.4)" fontSize="9">{entity.type} · {entity.synonyms.length} synonyms</text>
              </g>
            );
          })}
        </svg>

        {/* Entity Detail Panel */}
        {selectedEntity && (
          <div className="absolute right-5 top-5 w-72 bg-surface-1 border border-border rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{selectedEntity.name}</h4>
              <button onClick={() => setSelectedEntity(null)} className="p-1 rounded hover:bg-surface-3 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/60">{selectedEntity.description}</p>
            <div className="flex gap-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${TYPE_COLORS[selectedEntity.type]}`}>{selectedEntity.type}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${VERTICAL_COLORS[selectedEntity.vertical]}`}>{selectedEntity.vertical}</span>
            </div>
            <div>
              <div className="text-[10px] text-surface-6 uppercase mb-1">Synonyms</div>
              <div className="flex flex-wrap gap-1">
                {selectedEntity.synonyms.map((s) => (
                  <span key={s} className="text-[10px] bg-surface-3 text-white/60 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-surface-6 uppercase mb-1">Example Columns</div>
              <div className="flex flex-wrap gap-1">
                {selectedEntity.exampleColumns.map((c) => (
                  <span key={c} className="text-[10px] bg-surface-3 text-white/60 px-2 py-0.5 rounded font-mono">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entities Table */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-white">All Entities</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Type</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Vertical</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Synonyms</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity) => (
              <tr key={entity.id} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white">{entity.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${TYPE_COLORS[entity.type]}`}>{entity.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${VERTICAL_COLORS[entity.vertical]}`}>{entity.vertical}</span>
                </td>
                <td className="px-4 py-3 text-sm text-white/60">{entity.synonyms.length}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-surface-4 text-white/40 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
