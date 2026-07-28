"use client";

import { useState } from "react";
import {
  GitPullRequest,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  GitBranch,
} from "lucide-react";

interface InferredRelationship {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  confidence: number;
  method: string;
  cardinality: string;
  status: "approved" | "proposed" | "needs_review" | "rejected";
}

const INITIAL_RELATIONSHIPS: InferredRelationship[] = [
  { id: "1", sourceTable: "Orders", sourceColumn: "customer_id", targetTable: "Customers", targetColumn: "id", confidence: 98, method: "FK Declaration", cardinality: "N:1", status: "approved" },
  { id: "2", sourceTable: "Orders", sourceColumn: "product_id", targetTable: "Products", targetColumn: "id", confidence: 97, method: "FK Declaration", cardinality: "N:N", status: "approved" },
  { id: "3", sourceTable: "OrderItems", sourceColumn: "order_id", targetTable: "Orders", targetColumn: "id", confidence: 99, method: "FK Declaration", cardinality: "N:1", status: "approved" },
  { id: "4", sourceTable: "OrderItems", sourceColumn: "product_id", targetTable: "Products", targetColumn: "id", confidence: 96, method: "Name Similarity", cardinality: "N:1", status: "proposed" },
  { id: "5", sourceTable: "Subscriptions", sourceColumn: "user_id", targetTable: "Customers", targetColumn: "id", confidence: 85, method: "Name Similarity", cardinality: "N:1", status: "proposed" },
  { id: "6", sourceTable: "Payments", sourceColumn: "order_id", targetTable: "Orders", targetColumn: "id", confidence: 92, method: "Value Overlap", cardinality: "1:1", status: "needs_review" },
  { id: "7", sourceTable: "Reviews", sourceColumn: "product_id", targetTable: "Products", targetColumn: "id", confidence: 88, method: "Value Overlap", cardinality: "N:N", status: "proposed" },
  { id: "8", sourceTable: "Reviews", sourceColumn: "customer_id", targetTable: "Customers", targetColumn: "id", confidence: 82, method: "Knowledge Graph", cardinality: "N:1", status: "proposed" },
  { id: "9", sourceTable: "Inventory", sourceColumn: "product_id", targetTable: "Products", targetColumn: "id", confidence: 94, method: "Cardinality Match", cardinality: "1:1", status: "approved" },
  { id: "10", sourceTable: "Subscriptions", sourceColumn: "plan_id", targetTable: "Plans", targetColumn: "id", confidence: 90, method: "Knowledge Graph", cardinality: "N:1", status: "rejected" },
];

const TABLE_NODES = [
  { id: "Customers", label: "Customers", cols: ["id", "name", "email", "created_at"], x: 80, y: 100 },
  { id: "Orders", label: "Orders", cols: ["id", "customer_id", "product_id", "total", "status"], x: 360, y: 40 },
  { id: "Products", label: "Products", cols: ["id", "name", "price", "category"], x: 640, y: 100 },
  { id: "OrderItems", label: "OrderItems", cols: ["id", "order_id", "product_id", "quantity"], x: 360, y: 230 },
  { id: "Subscriptions", label: "Subscriptions", cols: ["id", "user_id", "plan_id", "status"], x: 80, y: 300 },
  { id: "Payments", label: "Payments", cols: ["id", "order_id", "amount", "method"], x: 360, y: 420 },
  { id: "Reviews", label: "Reviews", cols: ["id", "product_id", "customer_id", "rating"], x: 640, y: 300 },
  { id: "Inventory", label: "Inventory", cols: ["id", "product_id", "stock", "warehouse"], x: 640, y: 450 },
];

const METHOD_COLORS: Record<string, string> = {
  "FK Declaration": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Name Similarity": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Value Overlap": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Cardinality Match": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Knowledge Graph": "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  proposed: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  needs_review: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const EDGE_STATUS_COLORS: Record<string, string> = {
  approved: "#22c55e",
  proposed: "#eab308",
  needs_review: "#f97316",
  rejected: "#ef4444",
};

function getTableEdge(tableId: string, targetId: string) {
  const table = TABLE_NODES.find((t) => t.id === tableId);
  if (!table) return { x: 0, y: 0 };
  const cx = table.x + 120;
  const cy = table.y + 14 + table.cols.length * 18;
  const target = TABLE_NODES.find((t) => t.id === targetId);
  if (!target) return { x: cx, y: cy };
  const tx = target.x + 120;
  const ty = target.y + 14 + target.cols.length * 18;
  const dx = tx - cx;
  const dy = ty - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x: cx, y: cy };
  return { x: cx + (dx / dist) * 80, y: cy + (dy / dist) * 80 };
}

export default function RelationshipCanvasPage() {
  const [relationships, setRelationships] = useState<InferredRelationship[]>(INITIAL_RELATIONSHIPS);

  const stats = {
    proposed: relationships.filter((r) => r.status === "proposed").length,
    approved: relationships.filter((r) => r.status === "approved").length,
    rejected: relationships.filter((r) => r.status === "rejected").length,
    needsReview: relationships.filter((r) => r.status === "needs_review").length,
  };

  const handleApprove = (id: string) => {
    setRelationships((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r))
    );
  };

  const handleReject = (id: string) => {
    setRelationships((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Relationship Inference</h1>
          <p className="text-sm text-surface-6 mt-1">
            AI-proposed joins from FK detection, name similarity, and value-overlap analysis
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/80 transition-colors">
          <Play className="w-4 h-4" />
          Run Inference
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.proposed}</div>
              <div className="text-xs text-surface-6">Proposed</div>
            </div>
          </div>
        </div>
        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.approved}</div>
              <div className="text-xs text-surface-6">Approved</div>
            </div>
          </div>
        </div>
        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.rejected}</div>
              <div className="text-xs text-surface-6">Rejected</div>
            </div>
          </div>
        </div>
        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.needsReview}</div>
              <div className="text-xs text-surface-6">Needs Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-surface-2 border border-border rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-4 h-4 text-surface-6" />
          <span className="text-sm font-semibold text-white">Inferred Relationships</span>
          <span className="text-xs text-surface-6 ml-1">({relationships.length} total)</span>
        </div>
        <svg width="100%" height="560" viewBox="0 0 880 560" className="w-full min-w-[700px]">
          {/* Edges */}
          {relationships.map((rel) => {
            const source = TABLE_NODES.find((t) => t.id === rel.sourceTable);
            const target = TABLE_NODES.find((t) => t.id === rel.targetTable);
            if (!source || !target) return null;
            const from = getTableEdge(rel.sourceTable, rel.targetTable);
            const to = getTableEdge(rel.targetTable, rel.sourceTable);
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const color = EDGE_STATUS_COLORS[rel.status];
            const strokeWidth = rel.confidence >= 95 ? 2.5 : rel.confidence >= 85 ? 1.8 : 1.2;
            const opacity = rel.status === "rejected" ? 0.3 : 0.7;
            return (
              <g key={rel.id}>
                <path
                  d={`M${from.x},${from.y} Q${mx},${my - 20} ${to.x},${to.y}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={rel.status === "rejected" ? "6 4" : undefined}
                  opacity={opacity}
                />
                <circle cx={to.x} cy={to.y} r={3} fill={color} opacity={opacity} />
                <rect x={mx - 32} y={my - 22} width={64} height={16} rx={4} fill="#0d0d10" stroke={color} strokeWidth={0.5} opacity={0.9} />
                <text x={mx} y={my - 11} textAnchor="middle" fill={color} fontSize={8} fontFamily="monospace" opacity={0.9}>
                  {rel.confidence}%
                </text>
              </g>
            );
          })}

          {/* Table Nodes */}
          {TABLE_NODES.map((table) => {
            const nodeHeight = 28 + table.cols.length * 18;
            return (
              <g key={table.id}>
                <rect x={table.x} y={table.y} width={240} height={nodeHeight} rx={8} fill="#111113" stroke="#222225" strokeWidth={1} />
                <rect x={table.x} y={table.y} width={240} height={28} rx={8} fill="#1a1a1d" />
                <rect x={table.x} y={table.y + 20} width={240} height={8} fill="#1a1a1d" />
                <text x={table.x + 12} y={table.y + 19} fill="#fff" fontSize={12} fontWeight={600} fontFamily="monospace">
                  {table.label}
                </text>
                {table.cols.map((col, ci) => (
                  <text key={col} x={table.x + 12} y={table.y + 44 + ci * 18} fill="#888" fontSize={11} fontFamily="monospace">
                    {col}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Details Table */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Relationship Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-6">Source → Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-6">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-6">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-6">Cardinality</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-6">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((rel) => (
                <tr key={rel.id} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <span className="font-mono">{rel.sourceTable}.{rel.sourceColumn}</span>
                      <GitBranch className="w-3 h-3 text-surface-6" />
                      <span className="font-mono">{rel.targetTable}.{rel.targetColumn}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-surface-4 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${rel.confidence}%`,
                            backgroundColor:
                              rel.confidence >= 95 ? "#22c55e" : rel.confidence >= 85 ? "#eab308" : "#f97316",
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/90 font-mono">{rel.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded border ${METHOD_COLORS[rel.method]}`}>
                      {rel.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-white/70">{rel.cardinality}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded border ${STATUS_COLORS[rel.status]}`}>
                      {rel.status === "needs_review" ? "Needs Review" : rel.status.charAt(0).toUpperCase() + rel.status.slice(1)}
                      {rel.status === "approved" ? " ✓" : rel.status === "rejected" ? " ✗" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {(rel.status === "proposed" || rel.status === "needs_review") && (
                        <>
                          <button
                            onClick={() => handleApprove(rel.id)}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(rel.id)}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button className="px-2 py-1 text-[11px] font-medium rounded bg-surface-3 text-surface-6 border border-border hover:text-white hover:bg-surface-4 transition-colors">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
