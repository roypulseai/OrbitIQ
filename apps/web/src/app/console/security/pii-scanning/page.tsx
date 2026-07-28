"use client";

import { useState } from "react";
import { ScanSearch, AlertTriangle, Play, Shield, Edit, Trash2 } from "lucide-react";

const MOCK_TAGS = [
  { id: "1", columnName: "email", table: "Customers", piiType: "email", confidence: 0.98, source: "regex", maskSuggestion: "Full Mask" },
  { id: "2", columnName: "phone", table: "Customers", piiType: "phone", confidence: 0.92, source: "regex", maskSuggestion: "Partial Mask" },
  { id: "3", columnName: "first_name", table: "Employees", piiType: "name", confidence: 0.85, source: "classifier", maskSuggestion: "Full Mask" },
  { id: "4", columnName: "ssn", table: "Employees", piiType: "ssn", confidence: 0.99, source: "regex", maskSuggestion: "Full Mask" },
  { id: "5", columnName: "ip_address", table: "Access Logs", piiType: "ip_address", confidence: 0.88, source: "regex", maskSuggestion: "Hash" },
  { id: "6", columnName: "credit_card", table: "Transactions", piiType: "credit_card", confidence: 0.97, source: "regex", maskSuggestion: "Full Mask" },
];

const PII_TYPE_COLORS: Record<string, string> = {
  email: "bg-red-500/15 text-red-400 border-red-500/20",
  phone: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  name: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  ssn: "bg-red-500/15 text-red-400 border-red-500/20",
  ip_address: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  credit_card: "bg-red-500/15 text-red-400 border-red-500/20",
  address: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  dob: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const PII_TYPES_INFO = [
  { type: "email", desc: "Email addresses", color: "bg-red-500/15 text-red-400" },
  { type: "phone", desc: "Phone numbers", color: "bg-orange-500/15 text-orange-400" },
  { type: "name", desc: "Personal names", color: "bg-purple-500/15 text-purple-400" },
  { type: "ssn", desc: "Social Security Numbers", color: "bg-red-500/15 text-red-400" },
  { type: "credit_card", desc: "Payment card numbers", color: "bg-red-500/15 text-red-400" },
  { type: "ip_address", desc: "IP addresses", color: "bg-orange-500/15 text-orange-400" },
  { type: "address", desc: "Physical addresses", color: "bg-yellow-500/15 text-yellow-400" },
  { type: "dob", desc: "Dates of birth", color: "bg-blue-500/15 text-blue-400" },
];

export default function PIIScanningPage() {
  const [tags, setTags] = useState(MOCK_TAGS);
  const [scanning, setScanning] = useState(false);

  const runScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const stats = [
    { label: "Columns Scanned", value: 42, color: "text-blue-400", icon: ScanSearch },
    { label: "PII Detected", value: tags.length, color: "text-red-400", icon: AlertTriangle },
    { label: "Avg Confidence", value: `${Math.round(tags.reduce((a, t) => a + t.confidence, 0) / tags.length * 100)}%`, color: "text-green-400", icon: Shield },
  ];

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">PII Detection & Tagging</h1>
          <p className="text-surface-6 text-sm mt-1">Auto-scan columns for personally identifiable information</p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-6">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* PII Type Legend */}
      <div className="bg-surface-2 border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">PII Types</h3>
        <div className="grid grid-cols-4 gap-2">
          {PII_TYPES_INFO.map((p) => (
            <div key={p.type} className={`${p.color} rounded-lg px-3 py-2 border border-white/5 text-xs font-medium`}>
              {p.desc}
            </div>
          ))}
        </div>
      </div>

      {/* PII Tags Table */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Column</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Table</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">PII Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Confidence</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Masking</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white font-mono">{tag.columnName}</td>
                <td className="px-4 py-3 text-sm text-white/70">{tag.table}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${PII_TYPE_COLORS[tag.piiType] ?? "bg-white/5 text-white/60 border-white/10"}`}>
                    {tag.piiType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-surface-4 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${tag.confidence * 100}%`,
                          backgroundColor: tag.confidence >= 0.9 ? "#22c55e" : tag.confidence >= 0.8 ? "#eab308" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{Math.round(tag.confidence * 100)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${tag.source === "regex" ? "bg-blue-500/15 text-blue-400" : tag.source === "classifier" ? "bg-purple-500/15 text-purple-400" : "bg-white/10 text-white/60"}`}>
                    {tag.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white/60">{tag.maskSuggestion}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-surface-4 text-white/40 hover:text-white transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteTag(tag.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scan Configuration */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Scan Configuration</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-surface-6 mb-1 block">Model</label>
            <select className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white">
              <option>Sales Analytics</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-6 mb-1 block">Table</label>
            <select className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white">
              <option>All Tables</option>
              <option>Customers</option>
              <option>Employees</option>
              <option>Transactions</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" className="rounded border-border" defaultChecked />
            Include sample values
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" className="rounded border-border" defaultChecked />
            Auto-create masking rules
          </label>
        </div>
      </div>
    </div>
  );
}
