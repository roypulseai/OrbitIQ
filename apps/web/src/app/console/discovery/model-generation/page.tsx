"use client";

import { useState } from "react";
import {
  Box,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  BarChart3,
  Columns,
  GitBranch,
  Sparkles,
  Eye,
} from "lucide-react";

const MOCK_DIMENSIONS = [
  { name: "Customer", sourceTable: "orders", sourceColumn: "customer_id", dataType: "integer", description: "Unique customer identifier for segmentation and analysis", suggestedAs: "dimension", confidence: 0.95 },
  { name: "Region", sourceTable: "customers", sourceColumn: "region", dataType: "varchar", description: "Geographic region for regional sales analysis", suggestedAs: "geographic", confidence: 0.92 },
  { name: "Product", sourceTable: "order_items", sourceColumn: "product_id", dataType: "integer", description: "Product identifier for product-level analysis", suggestedAs: "dimension", confidence: 0.97 },
  { name: "OrderDate", sourceTable: "orders", sourceColumn: "order_date", dataType: "timestamp", description: "Date and time of order placement for temporal analysis", suggestedAs: "time_dimension", confidence: 0.99 },
  { name: "Status", sourceTable: "orders", sourceColumn: "status", dataType: "varchar", description: "Order status for workflow and fulfillment tracking", suggestedAs: "dimension", confidence: 0.88 },
  { name: "Category", sourceTable: "products", sourceColumn: "category", dataType: "varchar", description: "Product category for category-level aggregation", suggestedAs: "dimension", confidence: 0.94 },
];

const MOCK_MEASURES = [
  { name: "revenue", sourceTable: "order_items", sourceColumn: "line_total", dataType: "decimal", aggregation: "SUM", description: "Total revenue from all order line items", format: "currency", confidence: 0.96 },
  { name: "order_count", sourceTable: "orders", sourceColumn: "id", dataType: "integer", aggregation: "COUNT", description: "Total number of orders placed", format: "number", confidence: 0.98 },
  { name: "avg_order_value", sourceTable: "orders", sourceColumn: "total_amount", dataType: "decimal", aggregation: "AVG", description: "Average order value across all orders", format: "currency", confidence: 0.93 },
  { name: "unique_customers", sourceTable: "orders", sourceColumn: "customer_id", dataType: "integer", aggregation: "COUNT_DISTINCT", description: "Count of unique customers who placed orders", format: "number", confidence: 0.97 },
  { name: "total_quantity", sourceTable: "order_items", sourceColumn: "quantity", dataType: "integer", aggregation: "SUM", description: "Total quantity of items sold across all orders", format: "number", confidence: 0.95 },
];

const MOCK_RELATIONSHIPS = [
  "orders.customer_id → customers.id (N:1)",
  "order_items.order_id → orders.id (N:1)",
  "order_items.product_id → products.id (N:1)",
];

const MOCK_DIFFS = [
  { field: "dimension.Customer", currentValue: "", proposedValue: "orders.customer_id as dimension", action: "added" },
  { field: "dimension.Region", currentValue: "", proposedValue: "customers.region as geographic", action: "added" },
  { field: "dimension.Product", currentValue: "", proposedValue: "order_items.product_id as dimension", action: "added" },
  { field: "dimension.OrderDate", currentValue: "", proposedValue: "orders.order_date as time_dimension", action: "added" },
  { field: "dimension.Status", currentValue: "", proposedValue: "orders.status as dimension", action: "added" },
  { field: "dimension.Category", currentValue: "", proposedValue: "products.category as dimension", action: "added" },
  { field: "measure.revenue", currentValue: "", proposedValue: "SUM(order_items.line_total)", action: "added" },
  { field: "measure.order_count", currentValue: "", proposedValue: "COUNT(orders.id)", action: "added" },
  { field: "measure.avg_order_value", currentValue: "", proposedValue: "AVG(orders.total_amount)", action: "added" },
  { field: "measure.unique_customers", currentValue: "", proposedValue: "COUNT_DISTINCT(orders.customer_id)", action: "added" },
  { field: "measure.total_quantity", currentValue: "", proposedValue: "SUM(order_items.quantity)", action: "added" },
  { field: "relationship", currentValue: "", proposedValue: "orders.customer_id → customers.id (N:1)", action: "added" },
  { field: "relationship", currentValue: "", proposedValue: "order_items.order_id → orders.id (N:1)", action: "added" },
  { field: "relationship", currentValue: "", proposedValue: "order_items.product_id → products.id (N:1)", action: "added" },
];

const MOCK_MODELS = [
  { id: "mg-001", name: "Sales Analytics Model", sourceConnectionId: "conn-sales-analytics", status: "draft", dimensionsCount: 6, measuresCount: 5, generatedAt: "2 hours ago" },
  { id: "mg-002", name: "Marketing Funnel Model", sourceConnectionId: "conn-marketing", status: "reviewing", dimensionsCount: 4, measuresCount: 3, generatedAt: "1 day ago" },
  { id: "mg-003", name: "Inventory Tracker", sourceConnectionId: "conn-inventory", status: "published", dimensionsCount: 8, measuresCount: 6, generatedAt: "3 days ago" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  reviewing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/15 text-green-400 border-green-500/20",
  published: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

const SUGGESTED_AS_STYLES: Record<string, string> = {
  dimension: "bg-white/10 text-white/60",
  time_dimension: "bg-blue-500/15 text-blue-400",
  geographic: "bg-green-500/15 text-green-400",
};

const AGG_STYLES: Record<string, string> = {
  SUM: "bg-green-500/15 text-green-400",
  COUNT: "bg-blue-500/15 text-blue-400",
  AVG: "bg-purple-500/15 text-purple-400",
  MIN: "bg-orange-500/15 text-orange-400",
  MAX: "bg-red-500/15 text-red-400",
  COUNT_DISTINCT: "bg-cyan-500/15 text-cyan-400",
};

const FORMAT_STYLES: Record<string, string> = {
  number: "bg-white/10 text-white/60",
  currency: "bg-green-500/15 text-green-400",
  percentage: "bg-yellow-500/15 text-yellow-400",
};

const ACTION_COLORS: Record<string, string> = {
  added: "text-green-400",
  modified: "text-yellow-400",
  removed: "text-red-400",
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 95 ? "bg-green-400" : pct >= 85 ? "bg-blue-400" : pct >= 75 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-white/50 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function ModelGenerationPage() {
  const [expandedModel, setExpandedModel] = useState<string | null>("mg-001");
  const [showDiffs, setShowDiffs] = useState(true);

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Model Auto-generation</h1>
          <p className="text-surface-6 text-sm mt-1">AI-drafted semantic models from discovery output</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          <Sparkles className="w-4 h-4" /> Generate Model
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Models", value: MOCK_MODELS.length, color: "text-white", icon: Box },
          { label: "Draft", value: MOCK_MODELS.filter(m => m.status === "draft").length, color: "text-yellow-400", icon: Clock },
          { label: "Reviewing", value: MOCK_MODELS.filter(m => m.status === "reviewing").length, color: "text-blue-400", icon: Eye },
          { label: "Published", value: MOCK_MODELS.filter(m => m.status === "published").length, color: "text-green-400", icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-6">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Models List */}
      <div className="space-y-3">
        {MOCK_MODELS.map(model => (
          <div key={model.id} className="bg-surface-2 border border-border rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-3/30 transition-colors"
              onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
            >
              {expandedModel === model.id ? <ChevronDown className="w-4 h-4 text-surface-6 shrink-0" /> : <ChevronRight className="w-4 h-4 text-surface-6 shrink-0" />}
              <Box className="w-5 h-5 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white">{model.name}</span>
                <span className="text-xs text-surface-6 ml-3">{model.sourceConnectionId}</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[model.status]}`}>{model.status}</span>
              <div className="flex items-center gap-4 text-xs text-surface-6 ml-4">
                <span className="flex items-center gap-1"><Columns className="w-3 h-3" /> {model.dimensionsCount} dims</span>
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {model.measuresCount} measures</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {model.generatedAt}</span>
              </div>
            </div>

            {expandedModel === model.id && (
              <div className="border-t border-border px-5 py-5 space-y-6">
                {/* Two-column: Dimensions + Measures */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Dimensions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Columns className="w-4 h-4 text-accent" /> Dimensions ({MOCK_DIMENSIONS.length})
                      </h4>
                      <button className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {MOCK_DIMENSIONS.map((dim, i) => (
                        <div key={i} className="bg-surface-1 border border-border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{dim.name}</span>
                            <div className="flex items-center gap-1">
                              <button className="p-1 rounded hover:bg-surface-3 transition-colors text-surface-6 hover:text-white">
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button className="p-1 rounded hover:bg-surface-3 transition-colors text-surface-6 hover:text-red-400">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-surface-6 font-mono">{dim.sourceTable}.{dim.sourceColumn}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-surface-3 text-white/50 px-1.5 py-0.5 rounded">{dim.dataType}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${SUGGESTED_AS_STYLES[dim.suggestedAs]}`}>{dim.suggestedAs}</span>
                          </div>
                          <div className="text-[11px] text-white/50 leading-relaxed">{dim.description}</div>
                          <ConfidenceBar value={dim.confidence} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Measures */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" /> Measures ({MOCK_MEASURES.length})
                      </h4>
                      <button className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {MOCK_MEASURES.map((meas, i) => (
                        <div key={i} className="bg-surface-1 border border-border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{meas.name}</span>
                            <div className="flex items-center gap-1">
                              <button className="p-1 rounded hover:bg-surface-3 transition-colors text-surface-6 hover:text-white">
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button className="p-1 rounded hover:bg-surface-3 transition-colors text-surface-6 hover:text-red-400">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-surface-6 font-mono">{meas.sourceTable}.{meas.sourceColumn}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${AGG_STYLES[meas.aggregation]}`}>{meas.aggregation}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${FORMAT_STYLES[meas.format]}`}>{meas.format}</span>
                          </div>
                          <div className="text-[11px] text-white/50 leading-relaxed">{meas.description}</div>
                          <ConfidenceBar value={meas.confidence} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inferred Relationships */}
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                    <GitBranch className="w-4 h-4 text-green-400" /> Inferred Relationships ({MOCK_RELATIONSHIPS.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_RELATIONSHIPS.map((rel, i) => (
                      <span key={i} className="text-xs bg-surface-1 border border-border text-white/70 px-3 py-1.5 rounded-lg font-mono">{rel}</span>
                    ))}
                  </div>
                </div>

                {/* Diff View */}
                <div>
                  <button
                    onClick={() => setShowDiffs(!showDiffs)}
                    className="flex items-center gap-2 text-sm font-semibold text-white mb-3"
                  >
                    {showDiffs ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Proposed Changes ({MOCK_DIFFS.length})
                  </button>
                  {showDiffs && (
                    <div className="bg-surface-1 border border-border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Field</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Current</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Proposed</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_DIFFS.map((diff, i) => (
                            <tr key={i} className="border-b border-border/50 hover:bg-surface-2/30 transition-colors">
                              <td className="px-4 py-2.5 text-sm font-mono text-white/70">{diff.field}</td>
                              <td className="px-4 py-2.5 text-sm text-white/40">{diff.currentValue || "—"}</td>
                              <td className="px-4 py-2.5 text-sm text-white/70 font-mono">{diff.proposedValue}</td>
                              <td className="px-4 py-2.5">
                                <span className={`text-xs font-medium ${ACTION_COLORS[diff.action]}`}>{diff.action}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {model.status === "draft" && (
                    <>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/15 text-green-400 border border-green-500/20 text-sm font-medium hover:bg-green-500/25 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/25 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {model.status === "reviewing" && (
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 text-accent border border-accent/20 text-sm font-medium hover:bg-accent/25 transition-colors">
                      <Send className="w-4 h-4" /> Publish
                    </button>
                  )}
                  {model.status === "published" && (
                    <span className="text-xs text-green-400 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> This model is live and available for queries</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
