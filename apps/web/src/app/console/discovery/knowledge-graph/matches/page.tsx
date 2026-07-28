"use client";

import { useState } from "react";
import { CheckCircle, Target, Gauge, AlertCircle, Play } from "lucide-react";

const MOCK_MATCHES = [
  { column: "customer_id", table: "Customers", entity: "Customer", vertical: "retail", confidence: 0.98, matchType: "name" },
  { column: "email", table: "Customers", entity: "Subscriber", vertical: "saas", confidence: 0.85, matchType: "pattern" },
  { column: "qty_sold", table: "Orders", entity: "Quantity", vertical: "retail", confidence: 0.95, matchType: "synonym" },
  { column: "mrr_amount", table: "Subscriptions", entity: "MRR", vertical: "saas", confidence: 0.99, matchType: "name" },
  { column: "order_date", table: "Orders", entity: "OrderDate", vertical: "retail", confidence: 0.92, matchType: "name" },
  { column: "churn_flag", table: "Subscriptions", entity: "Churn", vertical: "saas", confidence: 0.97, matchType: "name" },
  { column: "product_name", table: "Products", entity: "Product", vertical: "retail", confidence: 0.94, matchType: "name" },
  { column: "subscription_plan", table: "Subscriptions", entity: "PlanTier", vertical: "saas", confidence: 0.88, matchType: "synonym" },
  { column: "total_revenue", table: "Orders", entity: "Revenue", vertical: "retail", confidence: 0.91, matchType: "synonym" },
  { column: "user_engagement", table: "FeatureUsage", entity: "FeatureUsage", vertical: "saas", confidence: 0.83, matchType: "semantic" },
];

const UNMATCHED = [
  { column: "internal_notes", table: "Customers", reason: "No matching entity found" },
  { column: "legacy_code", table: "Products", reason: "Ambiguous match — 3 candidates" },
  { column: "temp_field", table: "Orders", reason: "Insufficient sample values" },
];

const MATCH_TYPE_COLORS: Record<string, string> = {
  name: "bg-green-500/15 text-green-400 border-green-500/20",
  synonym: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  pattern: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  semantic: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

const VERTICAL_COLORS: Record<string, string> = {
  retail: "bg-cyan-500/15 text-cyan-400",
  saas: "bg-purple-500/15 text-purple-400",
};

export default function MatchesPage() {
  const [matches] = useState(MOCK_MATCHES);

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Semantic Fingerprinting</h1>
          <p className="text-surface-6 text-sm mt-1">AI-powered column-to-ontology matching</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          <Play className="w-4 h-4" /> Run Matching
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Columns Matched", value: "42", color: "text-green-400", icon: CheckCircle },
          { label: "Match Rate", value: "78%", color: "text-blue-400", icon: Target },
          { label: "Avg Confidence", value: "0.87", color: "text-purple-400", icon: Gauge },
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

      {/* Match Results */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Match Results</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Source Column</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Table</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Matched Entity</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Confidence</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Match Type</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-medium text-white">{m.column}</td>
                <td className="px-4 py-3 text-sm text-white/60">{m.table}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{m.entity}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${VERTICAL_COLORS[m.vertical]}`}>{m.vertical}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-surface-4 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${m.confidence * 100}%`,
                          backgroundColor: m.confidence >= 0.9 ? "#22c55e" : m.confidence >= 0.8 ? "#eab308" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{Math.round(m.confidence * 100)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${MATCH_TYPE_COLORS[m.matchType]}`}>{m.matchType}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unmatched */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Unmatched Columns</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Column</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Table</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Reason</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-6 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {UNMATCHED.map((u, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-medium text-white">{u.column}</td>
                <td className="px-4 py-3 text-sm text-white/60">{u.table}</td>
                <td className="px-4 py-3 text-sm text-yellow-400/80">{u.reason}</td>
                <td className="px-4 py-3">
                  <button className="text-xs text-accent hover:text-accent/80 transition-colors">Suggest Entity</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
