"use client";

import { useState } from "react";
import {
  Shield,
  CheckCircle,
  Database,
  Users,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  X,
  Play,
  XCircle,
} from "lucide-react";

interface Policy {
  id: string;
  name: string;
  table: string;
  expression: string;
  roles: string[];
  active: boolean;
  priority: number;
  description: string;
}

const MOCK_TABLES = ["Sales", "Employee", "Financials", "Reports", "All tables"];
const ALL_ROLES = ["admin", "editor", "viewer", "data_steward", "security_admin"];

const INITIAL_POLICIES: Policy[] = [
  {
    id: "1",
    name: "Region Filter",
    table: "Sales",
    expression: 'USERATTRIBUTE("region") = "US"',
    roles: ["admin", "viewer"],
    active: true,
    priority: 10,
    description: "Filters sales data to only show US region records.",
  },
  {
    id: "2",
    name: "Department Restriction",
    table: "Employee",
    expression: 'USERATTRIBUTE("department") IN ("Engineering", "Data")',
    roles: ["editor"],
    active: true,
    priority: 20,
    description: "Restricts employee data to Engineering and Data departments.",
  },
  {
    id: "3",
    name: "Cost Center Guard",
    table: "Financials",
    expression: 'USERATTRIBUTE("cost_center") = "CC001"',
    roles: ["viewer"],
    active: false,
    priority: 30,
    description: "Guards financial data by cost center.",
  },
  {
    id: "4",
    name: "Manager Hierarchy",
    table: "Reports",
    expression: 'USERATTRIBUTE("role") = "admin" OR USERATTRIBUTE("reports_to") = CURRENT_USER()',
    roles: ["admin", "editor"],
    active: true,
    priority: 5,
    description: "Allows admins full access; others see only their reports.",
  },
  {
    id: "5",
    name: "Global Admin Bypass",
    table: "All tables",
    expression: 'USERATTRIBUTE("role") = "GlobalAdmin"',
    roles: ["admin"],
    active: true,
    priority: 1,
    description: "Grants GlobalAdmin users unrestricted access.",
  },
];

const EMPTY_POLICY: Policy = {
  id: "",
  name: "",
  table: "",
  expression: "",
  roles: [],
  active: true,
  priority: 10,
  description: "",
};

export default function SecurityPage() {
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [form, setForm] = useState<Policy>(EMPTY_POLICY);

  const [testExpr, setTestExpr] = useState('USERATTRIBUTE("region") = "US"');
  const [testAttrs, setTestAttrs] = useState<{ key: string; value: string }[]>([
    { key: "region", value: "US" },
    { key: "department", value: "Engineering" },
  ]);
  const [testResult, setTestResult] = useState<"pass" | "fail" | null>(null);

  const activeCount = policies.filter((p) => p.active).length;
  const tablesCovered = new Set(policies.map((p) => p.table)).size;

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setForm(EMPTY_POLICY);
    setShowModal(true);
  };

  const handleOpenEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setForm({ ...policy });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.table) return;
    if (editingPolicy) {
      setPolicies((prev) => prev.map((p) => (p.id === editingPolicy.id ? { ...form } : p)));
    } else {
      setPolicies((prev) => [...prev, { ...form, id: String(Date.now()) }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const handleEvaluate = () => {
    const attrs: Record<string, string> = {};
    testAttrs.forEach((a) => {
      if (a.key.trim()) attrs[a.key.trim()] = a.value;
    });
    const hasMatch = Object.entries(attrs).some(
      ([k, v]) => testExpr.includes(k) && testExpr.includes(v)
    );
    setTestResult(hasMatch ? "pass" : "fail");
  };

  const statCards = [
    { label: "Total Policies", value: policies.length, color: "text-blue-400", bg: "bg-blue-500/10", icon: Shield },
    { label: "Active Policies", value: activeCount, color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle },
    { label: "Tables Covered", value: tablesCovered, color: "text-purple-400", bg: "bg-purple-500/10", icon: Database },
    { label: "Users with Attributes", value: 4, color: "text-orange-400", bg: "bg-orange-500/10", icon: Users },
  ];

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent" />
            Row-Level Security
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage data access policies that filter rows based on user attributes
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          {activeCount} active policies
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="surface-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy List */}
      <div className="surface-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Policies
          </h2>
          <button onClick={handleOpenCreate} className="btn-primary text-xs py-1.5 px-3">
            <Plus className="w-4 h-4" /> Create Policy
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Policy Name</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Table</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Expression</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Applies To</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Status</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Priority</th>
                <th className="text-right text-[11px] font-medium text-muted uppercase tracking-wider pb-3 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr
                  key={policy.id}
                  className="border-b border-border/50 last:border-0 group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium text-white">{policy.name}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs font-medium">
                      <Database className="w-3 h-3" />
                      {policy.table}
                    </span>
                  </td>
                  <td className="py-3 pr-4 max-w-[260px]">
                    <code className="text-xs font-mono text-white/60 truncate block">{policy.expression}</code>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {policy.roles.map((r) => (
                        <span key={r} className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 text-[10px] font-medium">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => handleToggleActive(policy.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        policy.active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${policy.active ? "bg-green-400" : "bg-white/30"}`} />
                      {policy.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-white/60">{policy.priority}</span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(policy)}
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expression Tester */}
      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Play className="w-4 h-4 text-accent" />
          Expression Tester
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-muted mb-1.5">OQL Expression</label>
            <textarea
              value={testExpr}
              onChange={(e) => setTestExpr(e.target.value)}
              className="input-dark w-full h-24 font-mono text-sm resize-none"
              placeholder='USERATTRIBUTE("region") = "US"'
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">User Attributes</label>
            <div className="space-y-2">
              {testAttrs.map((attr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={attr.key}
                    onChange={(e) => {
                      const next = [...testAttrs];
                      next[i] = { ...next[i], key: e.target.value };
                      setTestAttrs(next);
                    }}
                    className="input-dark flex-1 text-sm"
                    placeholder="key"
                  />
                  <input
                    value={attr.value}
                    onChange={(e) => {
                      const next = [...testAttrs];
                      next[i] = { ...next[i], value: e.target.value };
                      setTestAttrs(next);
                    }}
                    className="input-dark flex-1 text-sm"
                    placeholder="value"
                  />
                  <button
                    onClick={() => setTestAttrs((prev) => prev.filter((_, j) => j !== i))}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setTestAttrs((prev) => [...prev, { key: "", value: "" }])}
                className="text-xs text-accent hover:text-accent/80 transition-colors"
              >
                + Add attribute
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleEvaluate} className="btn-primary text-sm py-2 px-4">
            <Play className="w-4 h-4" /> Evaluate
          </button>
          {testResult && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                testResult === "pass"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {testResult === "pass" ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Pass — User matches this policy expression
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" /> Fail — User does not match this policy expression
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111113] border border-white/10 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">
                {editingPolicy ? "Edit Policy" : "Create Policy"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Policy Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-dark w-full"
                  placeholder="e.g. Region Filter"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Table</label>
                  <div className="relative">
                    <select
                      value={form.table}
                      onChange={(e) => setForm({ ...form, table: e.target.value })}
                      className="input-dark w-full pr-8 appearance-none cursor-pointer"
                    >
                      <option value="">Select table...</option>
                      {MOCK_TABLES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Priority</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                    className="input-dark w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">OQL Expression</label>
                <textarea
                  value={form.expression}
                  onChange={(e) => setForm({ ...form, expression: e.target.value })}
                  className="input-dark w-full h-24 font-mono text-sm resize-none"
                  placeholder='USERATTRIBUTE("region") = "US"'
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Applies To Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_ROLES.map((role) => (
                    <label
                      key={role}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                        form.roles.includes(role)
                          ? "bg-accent/10 border-accent/30 text-accent"
                          : "bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, roles: [...form.roles, role] });
                          } else {
                            setForm({ ...form, roles: form.roles.filter((r) => r !== role) });
                          }
                        }}
                        className="sr-only"
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-dark w-full h-16 text-sm resize-none"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-5 border-t border-white/10">
              <button onClick={() => { setTestExpr(form.expression); setShowModal(false); }} className="btn-secondary text-sm">
                <Play className="w-4 h-4" /> Test Expression
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary text-sm">
                  {editingPolicy ? "Save Changes" : "Create Policy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
