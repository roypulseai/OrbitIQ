"use client";

import { useState } from "react";
import {
  Users,
  Upload,
  Pencil,
  Trash2,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";

interface UserAttribute {
  id: string;
  email: string;
  attributes: Record<string, string>;
}

const ATTR_KEYS = ["region", "department", "role", "cost_center", "reports_to", "clearance_level"];

const INITIAL_USERS: UserAttribute[] = [
  {
    id: "1",
    email: "alice@acme.com",
    attributes: { region: "US", department: "Engineering", role: "admin", cost_center: "CC001" },
  },
  {
    id: "2",
    email: "bob@acme.com",
    attributes: { region: "EU", department: "Sales", role: "viewer", cost_center: "CC002" },
  },
  {
    id: "3",
    email: "carol@acme.com",
    attributes: { region: "US", department: "Data", role: "editor", cost_center: "CC001" },
  },
  {
    id: "4",
    email: "dave@acme.com",
    attributes: { region: "APAC", department: "Engineering", role: "viewer", cost_center: "CC003" },
  },
];

interface UserForm {
  email: string;
  pairs: { key: string; value: string }[];
}

const EMPTY_FORM: UserForm = { email: "", pairs: [{ key: "", value: "" }] };

export default function UserAttributesPage() {
  const [users, setUsers] = useState<UserAttribute[]>(INITIAL_USERS);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineAttrs, setInlineAttrs] = useState<Record<string, string>>({});
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);

  const getKeyCount = (key: string) =>
    users.filter((u) => u.attributes[key] !== undefined).length;

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (user: UserAttribute) => {
    setEditingId(user.id);
    const pairs = Object.entries(user.attributes).map(([key, value]) => ({ key, value }));
    setForm({ email: user.email, pairs: pairs.length > 0 ? pairs : [{ key: "", value: "" }] });
    setShowModal(true);
  };

  const handleInlineEdit = (user: UserAttribute) => {
    setInlineEditId(user.id);
    setInlineAttrs({ ...user.attributes });
  };

  const handleSaveInline = () => {
    if (!inlineEditId) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === inlineEditId ? { ...u, attributes: { ...inlineAttrs } } : u))
    );
    setInlineEditId(null);
  };

  const handleSave = () => {
    if (!form.email.trim()) return;
    const attrs: Record<string, string> = {};
    form.pairs.forEach((p) => {
      if (p.key.trim()) attrs[p.key.trim()] = p.value;
    });

    if (editingId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, email: form.email, attributes: attrs } : u))
      );
    } else {
      setUsers((prev) => [
        ...prev,
        { id: String(Date.now()), email: form.email, attributes: attrs },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addPair = () => setForm((prev) => ({ ...prev, pairs: [...prev.pairs, { key: "", value: "" }] }));
  const removePair = (idx: number) => setForm((prev) => ({ ...prev, pairs: prev.pairs.filter((_, i) => i !== idx) }));
  const updatePair = (idx: number, field: "key" | "value", val: string) => {
    setForm((prev) => {
      const next = [...prev.pairs];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, pairs: next };
    });
  };

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-accent" />
            User Attributes
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage user attributes used for dynamic RLS policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button onClick={handleOpenCreate} className="btn-primary text-xs py-1.5 px-3">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — Attribute Keys */}
        <div className="w-56 shrink-0">
          <div className="surface-card p-4">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Attribute Keys</h3>
            <div className="space-y-1">
              {ATTR_KEYS.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-sm text-white/80 font-mono">{key}</span>
                  <span className="text-xs text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                    {getKeyCount(key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="flex-1 min-w-0">
          <div className="surface-card p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">User</th>
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Region</th>
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Department</th>
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Role</th>
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Cost Center</th>
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 pr-4">Reports To</th>
                    <th className="text-right text-[11px] font-medium text-white/40 uppercase tracking-wider pb-3 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isEditing = inlineEditId === user.id;
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
                              {user.email.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-white">{user.email}</span>
                          </div>
                        </td>
                        {["region", "department", "role", "cost_center", "reports_to"].map((key) => (
                          <td key={key} className="py-3 pr-4">
                            {isEditing ? (
                              <input
                                value={inlineAttrs[key] ?? ""}
                                onChange={(e) => setInlineAttrs((prev) => ({ ...prev, [key]: e.target.value }))}
                                className="input-dark w-full text-xs py-1 px-2"
                              />
                            ) : (
                              <span className="text-sm text-white/70">
                                {user.attributes[key] ?? "—"}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleSaveInline}
                                  className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                                  title="Save"
                                >
                                  <CheckIcon />
                                </button>
                                <button
                                  onClick={() => setInlineEditId(null)}
                                  className="p-1.5 text-white/40 hover:bg-white/5 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleInlineEdit(user)}
                                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                                  title="Quick edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(user)}
                                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                                  title="Full edit"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111113] border border-white/10 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">
                {editingId ? "Edit User Attributes" : "Add User"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-dark w-full"
                  placeholder="user@acme.com"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Attributes</label>
                <div className="space-y-2">
                  {form.pairs.map((pair, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={pair.key}
                          onChange={(e) => updatePair(i, "key", e.target.value)}
                          className="input-dark w-full pr-8 appearance-none cursor-pointer text-sm"
                        >
                          <option value="">Key...</option>
                          {ATTR_KEYS.map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                      </div>
                      <input
                        value={pair.value}
                        onChange={(e) => updatePair(i, "value", e.target.value)}
                        className="input-dark flex-1 text-sm"
                        placeholder="Value"
                      />
                      <button
                        onClick={() => removePair(i)}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addPair} className="text-xs text-accent hover:text-accent/80 transition-colors">
                    + Add attribute
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-sm">
                {editingId ? "Save Changes" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
