"use client";

import { useState } from "react";
import { Lock, EyeOff, Eye, Hash, Key, Layers, Plus, Trash2, Edit, ToggleLeft, ToggleRight, FlaskConical } from "lucide-react";

const MASK_TYPES = [
  { key: "NONE", label: "None", icon: Eye, color: "text-white/40", bg: "bg-white/5", desc: "No masking applied" },
  { key: "FULL", label: "Full Mask", icon: EyeOff, color: "text-red-400", bg: "bg-red-500/10", desc: "Replaces all characters with ***" },
  { key: "PARTIAL", label: "Partial Mask", icon: Eye, color: "text-yellow-400", bg: "bg-yellow-500/10", desc: "Shows last N characters" },
  { key: "HASH", label: "Hash", icon: Hash, color: "text-blue-400", bg: "bg-blue-500/10", desc: "SHA-256 hash of value" },
  { key: "TOKENIZE", label: "Tokenize", icon: Key, color: "text-purple-400", bg: "bg-purple-500/10", desc: "Deterministic token replacement" },
  { key: "GENERALIZE", label: "Generalize", icon: Layers, color: "text-green-400", bg: "bg-green-500/10", desc: "Replaces with bucket/range" },
];

const MOCK_RULES = [
  { id: "1", columnName: "email", table: "Customers", maskType: "FULL", roles: ["admin", "viewer"], enabled: true },
  { id: "2", columnName: "phone", table: "Customers", maskType: "PARTIAL", roles: ["admin"], enabled: true, config: { showLastN: 4 } },
  { id: "3", columnName: "credit_card", table: "Transactions", maskType: "FULL", roles: ["admin", "viewer", "editor"], enabled: true },
  { id: "4", columnName: "salary", table: "Employees", maskType: "TOKENIZE", roles: ["admin", "data_steward"], enabled: true },
  { id: "5", columnName: "age", table: "Employees", maskType: "GENERALIZE", roles: ["viewer"], enabled: true, config: { buckets: ["0-20", "20-30", "30-40", "40-50", "50+"] } },
  { id: "6", columnName: "ssn", table: "Employees", maskType: "FULL", roles: ["admin"], enabled: true },
  { id: "7", columnName: "ip_address", table: "Access Logs", maskType: "HASH", roles: ["admin"], enabled: false },
  { id: "8", columnName: "address", table: "Customers", maskType: "PARTIAL", roles: ["viewer"], enabled: true, config: { showLastN: 8 } },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/15 text-red-400 border-red-500/20",
  editor: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  viewer: "bg-green-500/15 text-green-400 border-green-500/20",
  data_steward: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  security_admin: "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

export default function ColumnSecurityPage() {
  const [rules, setRules] = useState(MOCK_RULES);
  const [showModal, setShowModal] = useState(false);
  const [previewValue, setPreviewValue] = useState("john.doe@example.com");
  const [selectedPreviewRule, setSelectedPreviewRule] = useState("1");
  const [maskedResult, setMaskedResult] = useState("");

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const applyMask = () => {
    const rule = rules.find((r) => r.id === selectedPreviewRule);
    if (!rule) return;
    const val = previewValue;
    switch (rule.maskType) {
      case "FULL":
        if (val.includes("@")) { const [, d] = val.split("@"); setMaskedResult(`***@***.${d.split(".").pop()}`); }
        else setMaskedResult("*".repeat(val.length));
        break;
      case "PARTIAL":
        const n = rule.config?.showLastN ?? 4;
        setMaskedResult("*".repeat(Math.max(0, val.length - n)) + val.slice(-n));
        break;
      case "HASH":
        setMaskedResult("a3f8b2c1d4e5f6a7");
        break;
      case "TOKENIZE":
        setMaskedResult("TOK-A3F8-B2C1");
        break;
      case "GENERALIZE":
        setMaskedResult("30-40");
        break;
      default:
        setMaskedResult(val);
    }
  };

  const stats = [
    { label: "Total Rules", value: rules.length, color: "text-blue-400", icon: Lock },
    { label: "Active Rules", value: rules.filter((r) => r.enabled).length, color: "text-green-400", icon: Lock },
    { label: "Columns Protected", value: rules.length, color: "text-purple-400", icon: Lock },
    { label: "Mask Types Used", value: new Set(rules.map((r) => r.maskType)).size, color: "text-orange-400", icon: Lock },
  ];

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Column-Level Security</h1>
          <p className="text-surface-6 text-sm mt-1">Configure per-column visibility and masking rules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
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

      {/* Mask Types Legend */}
      <div className="bg-surface-2 border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Masking Types</h3>
        <div className="grid grid-cols-6 gap-3">
          {MASK_TYPES.filter((m) => m.key !== "NONE").map((m) => (
            <div key={m.key} className={`${m.bg} rounded-lg p-3 border border-white/5`}>
              <m.icon className={`w-4 h-4 ${m.color} mb-1`} />
              <div className="text-xs font-medium text-white">{m.label}</div>
              <div className="text-[10px] text-white/50 mt-0.5">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Column</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Table</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Mask Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Applies To</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => {
              const maskInfo = MASK_TYPES.find((m) => m.key === rule.maskType);
              return (
                <tr key={rule.id} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white font-mono">{rule.columnName}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{rule.table}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${maskInfo?.bg} ${maskInfo?.color} border border-white/5`}>
                      {maskInfo && <maskInfo.icon className="w-3 h-3" />}
                      {rule.maskType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.roles.map((role) => (
                        <span key={role} className={`px-2 py-0.5 rounded text-[10px] font-medium border ${ROLE_COLORS[role] ?? "bg-white/5 text-white/60 border-white/10"}`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleRule(rule.id)} className="flex items-center">
                      {rule.enabled ? (
                        <ToggleRight className="w-6 h-6 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-white/30" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-surface-4 text-white/40 hover:text-white transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Preview Section */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-accent" /> Masking Preview
        </h3>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-surface-6 mb-1 block">Input Value</label>
            <input
              value={previewValue}
              onChange={(e) => setPreviewValue(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-surface-6 mb-1 block">Select Rule</label>
            <select
              value={selectedPreviewRule}
              onChange={(e) => setSelectedPreviewRule(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/30"
            >
              {rules.map((r) => (
                <option key={r.id} value={r.id}>{r.columnName} ({r.maskType})</option>
              ))}
            </select>
          </div>
          <button
            onClick={applyMask}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Apply Mask
          </button>
          {maskedResult && (
            <div className="flex-1">
              <label className="text-xs text-surface-6 mb-1 block">Result</label>
              <div className="bg-surface-1 border border-border rounded-lg px-3 py-2 text-sm text-green-400 font-mono">
                {maskedResult}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-2 border border-border rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Create Column Security Rule</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-surface-6 mb-1 block">Model</label>
                <select className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white">
                  <option>Sales Analytics</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-surface-6 mb-1 block">Table</label>
                <select className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white">
                  <option>Customers</option>
                  <option>Employees</option>
                  <option>Transactions</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-surface-6 mb-1 block">Column Name</label>
              <input className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white font-mono" placeholder="e.g. email" />
            </div>
            <div>
              <label className="text-xs text-surface-6 mb-2 block">Mask Type</label>
              <div className="grid grid-cols-3 gap-2">
                {MASK_TYPES.map((m) => (
                  <label key={m.key} className={`${m.bg} border border-white/5 rounded-lg p-2.5 cursor-pointer hover:border-accent/30 transition-colors`}>
                    <input type="radio" name="maskType" value={m.key} className="sr-only" />
                    <m.icon className={`w-4 h-4 ${m.color} mb-1`} />
                    <div className="text-xs font-medium text-white">{m.label}</div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-surface-6 mb-2 block">Applies To Roles</label>
              <div className="flex flex-wrap gap-2">
                {["admin", "editor", "viewer", "data_steward", "security_admin"].map((role) => (
                  <label key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-sm text-white/70 cursor-pointer hover:border-accent/30">
                    <input type="checkbox" className="rounded" />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-white/70 hover:bg-surface-3 transition-colors">
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
