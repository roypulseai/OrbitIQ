"use client";

import { useState } from "react";
import { Button, Modal } from "@orbitiq/design-system";
import { Plus, ArrowRightLeft, Sparkles, Trash2 } from "lucide-react";

interface Relationship {
  id: string;
  name: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  confidence: number;
}

const DEMO_RELATIONSHIPS: Relationship[] = [
  { id: "1", name: "users_orders", sourceTable: "users", sourceColumn: "id", targetTable: "orders", targetColumn: "user_id", type: "one-to-many", confidence: 0.98 },
  { id: "2", name: "orders_items", sourceTable: "orders", sourceColumn: "id", targetTable: "order_items", targetColumn: "order_id", type: "one-to-many", confidence: 0.95 },
  { id: "3", name: "products_categories", sourceTable: "products", sourceColumn: "category_id", targetTable: "categories", targetColumn: "id", type: "many-to-one", confidence: 0.92 },
];

const TYPE_COLORS: Record<string, string> = {
  "one-to-one": "badge-info",
  "one-to-many": "badge-accent",
  "many-to-one": "badge-accent",
  "many-to-many": "badge-warning",
};

export default function RelationshipsPage() {
  const [relationships] = useState<Relationship[]>(DEMO_RELATIONSHIPS);
  const [view, setView] = useState<"canvas" | "list">("canvas");
  const [showAddModal, setShowAddModal] = useState(false);

  const nodes = [
    { id: "users", label: "users", x: 80, y: 120, cols: ["id", "name", "email"] },
    { id: "orders", label: "orders", x: 380, y: 60, cols: ["id", "user_id", "total", "status"] },
    { id: "order_items", label: "order_items", x: 680, y: 60, cols: ["id", "order_id", "product_id", "qty"] },
    { id: "products", label: "products", x: 380, y: 240, cols: ["id", "name", "category_id", "price"] },
    { id: "categories", label: "categories", x: 80, y: 240, cols: ["id", "name"] },
  ];

  const edges = [
    { from: "users", fromCol: "id", to: "orders", toCol: "user_id" },
    { from: "orders", fromCol: "id", to: "order_items", toCol: "order_id" },
    { from: "products", fromCol: "category_id", to: "categories", toCol: "id" },
  ];

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Relationships</h1>
          <p className="text-sm text-muted mt-1">Define and visualize table joins across your data sources.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => {}}>
            <Sparkles className="w-4 h-4" /> Suggest Joins
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add Relationship
          </Button>
        </div>
      </div>

      {/* Canvas */}
      {view === "canvas" && (
        <div className="surface-card p-4 mb-6 overflow-hidden">
          <svg width="100%" height="380" viewBox="0 0 900 380" className="w-full">
            {/* Edges */}
            {edges.map((e, i) => {
              const fromNode = nodes.find((n) => n.id === e.from)!;
              const toNode = nodes.find((n) => n.id === e.to)!;
              const x1 = fromNode.x + 120;
              const y1 = fromNode.y + 20;
              const x2 = toNode.x;
              const y2 = toNode.y + 20;
              const mx = (x1 + x2) / 2;
              return (
                <g key={i}>
                  <path
                    d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                    fill="none"
                    stroke="rgb(99,102,241)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    opacity="0.5"
                  />
                  <circle cx={x2} cy={y2} r="4" fill="rgb(99,102,241)" />
                </g>
              );
            })}
            {/* Nodes */}
            {nodes.map((n) => (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width="240" height={40 + n.cols.length * 18} rx="8" fill="#111113" stroke="#222225" strokeWidth="1" />
                <rect x={n.x} y={n.y} width="240" height="28" rx="8" fill="#1a1a1d" />
                <rect x={n.x} y={n.y + 20} width="240" height="8" fill="#1a1a1d" />
                <text x={n.x + 12} y={n.y + 19} fill="#fff" fontSize="12" fontWeight="600" fontFamily="monospace">{n.label}</text>
                {n.cols.map((col, ci) => (
                  <text key={col} x={n.x + 12} y={n.y + 44 + ci * 18} fill="#888" fontSize="11" fontFamily="monospace">
                    {col}
                  </text>
                ))}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* List */}
      {view === "list" && (
        <div className="space-y-2 mb-6">
          {relationships.map((rel) => (
            <div key={rel.id} className="surface-card p-4 flex items-center justify-between hover:border-border-strong transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-muted" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{rel.name}</h3>
                  <div className="text-xs text-muted font-mono">
                    {rel.sourceTable}.{rel.sourceColumn} → {rel.targetTable}.{rel.targetColumn}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={TYPE_COLORS[rel.type]}>{rel.type}</span>
                <div className="text-right">
                  <div className="text-xs text-muted">Confidence</div>
                  <div className="text-sm font-semibold text-accent">{Math.round(rel.confidence * 100)}%</div>
                </div>
                <button className="p-1.5 text-surface-6 hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toggle */}
      <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-lg p-1 w-fit mx-auto">
        <button onClick={() => setView("canvas")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${view === "canvas" ? "bg-surface-3 text-white" : "text-muted hover:text-white"}`}>
          Canvas
        </button>
        <button onClick={() => setView("list")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${view === "list" ? "bg-surface-3 text-white" : "text-muted hover:text-white"}`}>
          List
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Relationship">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Source Table</label>
                <select className="input-dark"><option>users</option><option>orders</option><option>products</option><option>categories</option></select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Source Column</label>
                <select className="input-dark"><option>id</option><option>name</option><option>email</option></select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Target Table</label>
                <select className="input-dark"><option>orders</option><option>order_items</option><option>products</option></select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Target Column</label>
                <select className="input-dark"><option>user_id</option><option>order_id</option><option>product_id</option></select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Join Type</label>
              <select className="input-dark"><option value="one-to-many">One-to-Many</option><option value="many-to-one">Many-to-One</option><option value="one-to-one">One-to-One</option><option value="many-to-many">Many-to-Many</option></select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => setShowAddModal(false)}>Add Relationship</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
