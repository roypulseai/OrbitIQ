"use client";

import { useState } from "react";
import {
  BookOpen,
  Table2,
  Columns,
  BarChart3,
  Search,
  Filter,
  Tag,
  Database,
  Clock,
  GitBranch,
  LayoutDashboard,
} from "lucide-react";

interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  type: "table" | "column" | "metric" | "dashboard";
  tags: string[];
  qualityScore: number;
  lastUpdated: string;
  owner: string;
  lineage: string[];
}

const ENTRIES: CatalogEntry[] = [
  {
    id: "c1",
    name: "Customers",
    description: "Customer master data with contact info and segmentation",
    type: "table",
    tags: ["PII", "core"],
    qualityScore: 0.95,
    lastUpdated: "2 hours ago",
    owner: "DE",
    lineage: ["raw Customers → cleaned → aggregated"],
  },
  {
    id: "c2",
    name: "Orders",
    description: "All customer orders with line items",
    type: "table",
    tags: ["transactional", "core"],
    qualityScore: 0.92,
    lastUpdated: "2 hours ago",
    owner: "DE",
    lineage: ["raw Orders → enriched → Orders"],
  },
  {
    id: "c3",
    name: "Products",
    description: "Product catalog with pricing and categories",
    type: "table",
    tags: ["core", "reference"],
    qualityScore: 0.88,
    lastUpdated: "1 day ago",
    owner: "DE",
    lineage: ["raw Products → Products"],
  },
  {
    id: "c4",
    name: "email",
    description: "Customer email address",
    type: "column",
    tags: ["PII", "contact"],
    qualityScore: 0.98,
    lastUpdated: "3 hours ago",
    owner: "DE",
    lineage: ["Customers.email"],
  },
  {
    id: "c5",
    name: "revenue",
    description: "Order revenue in USD",
    type: "column",
    tags: ["financial", "metric"],
    qualityScore: 0.9,
    lastUpdated: "2 hours ago",
    owner: "DE",
    lineage: ["Orders.total_amount"],
  },
  {
    id: "c6",
    name: "order_date",
    description: "Date when order was placed",
    type: "column",
    tags: ["temporal"],
    qualityScore: 0.95,
    lastUpdated: "2 hours ago",
    owner: "DE",
    lineage: ["Orders.created_at"],
  },
  {
    id: "c7",
    name: "MRR",
    description: "Monthly Recurring Revenue",
    type: "metric",
    tags: ["saas", "financial"],
    qualityScore: 0.85,
    lastUpdated: "1 day ago",
    owner: "Analytics",
    lineage: ["Subscriptions × plan_price"],
  },
  {
    id: "c8",
    name: "Churn Rate",
    description: "Monthly customer churn rate",
    type: "metric",
    tags: ["saas"],
    qualityScore: 0.82,
    lastUpdated: "1 day ago",
    owner: "Analytics",
    lineage: ["cancelled / total"],
  },
  {
    id: "c9",
    name: "AOV",
    description: "Average Order Value",
    type: "metric",
    tags: ["retail", "financial"],
    qualityScore: 0.88,
    lastUpdated: "2 hours ago",
    owner: "Analytics",
    lineage: ["SUM(total) / COUNT(orders)"],
  },
];

const TYPE_CONFIG: Record<string, { icon: any; color: string; badge: string }> = {
  table: { icon: Table2, color: "text-green-400", badge: "bg-green-500/15 text-green-400 border-green-500/20" },
  column: { icon: Columns, color: "text-purple-400", badge: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  metric: { icon: BarChart3, color: "text-orange-400", badge: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  dashboard: { icon: LayoutDashboard, color: "text-blue-400", badge: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const STATS = [
  { label: "Total Entries", value: 15, color: "text-blue-400", icon: BookOpen },
  { label: "Tables", value: 3, color: "text-green-400", icon: Table2 },
  { label: "Columns", value: 8, color: "text-purple-400", icon: Columns },
  { label: "Metrics", value: 4, color: "text-orange-400", icon: BarChart3 },
];

function qualityColor(score: number) {
  if (score >= 0.9) return "bg-green-400";
  if (score >= 0.85) return "bg-yellow-400";
  return "bg-orange-400";
}

export default function DataCatalogPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = ENTRIES.filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Data Catalog</h1>
        <p className="text-surface-6 text-sm mt-1">Searchable index of all data assets across connections</p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search tables, columns, metrics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-surface-6 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/30 transition-all"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-6">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-6" />
          <span className="text-xs font-semibold text-surface-6 uppercase">Type</span>
        </div>
        {["all", "table", "column", "metric", "dashboard"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === t
                ? "bg-accent text-white"
                : "bg-surface-2 border border-border text-white/60 hover:text-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="w-px h-6 bg-border mx-1" />
        <div className="flex items-center gap-2 text-xs text-surface-6">
          <Tag className="w-3.5 h-3.5" /> Filter by tag
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-6">
          <Database className="w-3.5 h-3.5" /> Connection
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((entry) => {
          const cfg = TYPE_CONFIG[entry.type];
          const Icon = cfg.icon;
          return (
            <div
              key={entry.id}
              className="bg-surface-2 border border-border rounded-xl p-4 space-y-3 hover:border-accent/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${cfg.badge}`}>
                    {entry.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-surface-6">
                  <GitBranch className="w-3 h-3" />
                  {entry.lineage.length}
                </div>
              </div>

              <h4 className="text-sm font-bold text-white">{entry.name}</h4>
              <p className="text-xs text-white/60 line-clamp-2">{entry.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-surface-3 text-white/60 px-2 py-0.5 rounded font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quality Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-surface-6 uppercase">Quality Score</span>
                  <span className="text-[10px] text-white/60">{Math.round(entry.qualityScore * 100)}%</span>
                </div>
                <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${qualityColor(entry.qualityScore)}`}
                    style={{ width: `${entry.qualityScore * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-surface-6">
                  <Clock className="w-3 h-3" />
                  {entry.lastUpdated}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-surface-6">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {entry.owner[0]}
                  </div>
                  {entry.owner}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
