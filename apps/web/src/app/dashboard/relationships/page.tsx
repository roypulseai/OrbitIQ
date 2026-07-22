"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";

interface Relationship {
  id: string;
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: "1:1" | "1:N" | "N:1" | "N:N";
  joinType: "LEFT" | "INNER" | "RIGHT" | "FULL";
  isActive: boolean;
  description?: string;
}

interface RelationshipSuggestion {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  suggestedCardinality: string;
  confidence: number;
  reason: string;
}

const DEMO_RELATIONSHIPS: Relationship[] = [
  {
    id: "1",
    name: "Users to Orders",
    fromTable: "users",
    fromColumn: "id",
    toTable: "orders",
    toColumn: "user_id",
    cardinality: "1:N",
    joinType: "LEFT",
    isActive: true,
    description: "Each user can have many orders",
  },
  {
    id: "2",
    name: "Orders to Products",
    fromTable: "orders",
    fromColumn: "product_id",
    toTable: "products",
    toColumn: "id",
    cardinality: "N:1",
    joinType: "LEFT",
    isActive: true,
    description: "Each order references one product",
  },
  {
    id: "3",
    name: "Users to Profiles",
    fromTable: "users",
    fromColumn: "id",
    toTable: "profiles",
    toColumn: "user_id",
    cardinality: "1:1",
    joinType: "LEFT",
    isActive: true,
    description: "Each user has one profile",
  },
];

const DEMO_SUGGESTIONS: RelationshipSuggestion[] = [
  {
    fromTable: "orders",
    fromColumn: "region_id",
    toTable: "regions",
    toColumn: "id",
    suggestedCardinality: "N:1",
    confidence: 0.92,
    reason: "Column name pattern: foreign key references regions",
  },
  {
    fromTable: "products",
    fromColumn: "category_id",
    toTable: "categories",
    toColumn: "id",
    suggestedCardinality: "N:1",
    confidence: 0.88,
    reason: "Naming convention match for foreign key",
  },
  {
    fromTable: "order_items",
    fromColumn: "order_id",
    toTable: "orders",
    toColumn: "id",
    suggestedCardinality: "N:1",
    confidence: 0.85,
    reason: "Classic junction table pattern",
  },
];

const CARDINALITY_OPTIONS = ["1:1", "1:N", "N:1", "N:N"];
const JOIN_TYPE_OPTIONS = ["LEFT", "INNER", "RIGHT", "FULL"];

export default function RelationshipsPage() {
  const [relationships, setRelationships] = useState<Relationship[]>(DEMO_RELATIONSHIPS);
  const [suggestions] = useState<RelationshipSuggestion[]>(DEMO_SUGGESTIONS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RelationshipSuggestion | null>(null);
  const [view, setView] = useState<"list" | "canvas">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    fromTable: "",
    fromColumn: "",
    toTable: "",
    toColumn: "",
    cardinality: "1:N" as Relationship["cardinality"],
    joinType: "LEFT" as Relationship["joinType"],
    description: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      fromTable: "",
      fromColumn: "",
      toTable: "",
      toColumn: "",
      cardinality: "1:N",
      joinType: "LEFT",
      description: "",
    });
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!form.name || !form.fromTable || !form.toTable) return;
    const newRel: Relationship = {
      id: crypto.randomUUID(),
      ...form,
      isActive: true,
    };
    setRelationships((prev) => [...prev, newRel]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = (rel: Relationship) => {
    setEditingId(rel.id);
    setForm({
      name: rel.name,
      fromTable: rel.fromTable,
      fromColumn: rel.fromColumn,
      toTable: rel.toTable,
      toColumn: rel.toColumn,
      cardinality: rel.cardinality,
      joinType: rel.joinType,
      description: rel.description || "",
    });
    setShowCreateModal(true);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    setRelationships((prev) =>
      prev.map((r) =>
        r.id === editingId
          ? { ...r, ...form }
          : r
      )
    );
    setShowCreateModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAcceptSuggestion = (suggestion: RelationshipSuggestion) => {
    setSelectedSuggestion(suggestion);
    setForm({
      name: `${suggestion.fromTable} to ${suggestion.toTable}`,
      fromTable: suggestion.fromTable,
      fromColumn: suggestion.fromColumn,
      toTable: suggestion.toTable,
      toColumn: suggestion.toColumn,
      cardinality: suggestion.suggestedCardinality as Relationship["cardinality"],
      joinType: "LEFT",
      description: suggestion.reason,
    });
    setShowSuggestionModal(true);
  };

  const getCardinalityBadgeColor = (cardinality: string) => {
    switch (cardinality) {
      case "1:1": return "bg-blue-100 text-blue-800";
      case "1:N": return "bg-green-100 text-green-800";
      case "N:1": return "bg-yellow-100 text-yellow-800";
      case "N:N": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relationships</h1>
            <p className="mt-1 text-sm text-gray-500">
              Define joins between tables and discover relationship suggestions
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  view === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("canvas")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  view === "canvas"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Canvas
              </button>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              Add Relationship
            </Button>
          </div>
        </div>

        {/* Suggestions Banner */}
        {suggestions.length > 0 && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-600 text-lg">💡</span>
              <h3 className="font-medium text-indigo-900">
                {suggestions.length} Relationship Suggestion{suggestions.length !== 1 ? "s" : ""}
              </h3>
            </div>
            <p className="text-sm text-indigo-700 mb-3">
              AI-powered analysis found potential joins based on column naming patterns and data profiling.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAcceptSuggestion(s)}
                  className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs hover:bg-indigo-100 transition-colors text-left"
                >
                  <span className="font-medium text-indigo-900">
                    {s.fromTable}.{s.fromColumn} → {s.toTable}.{s.toColumn}
                  </span>
                  <span className="ml-2 text-indigo-600">
                    ({Math.round(s.confidence * 100)}% confidence)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Relationship Canvas View */}
        {view === "canvas" ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[500px]">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Visual Relationship Canvas</h3>
              <p className="text-sm text-gray-500">Drag and connect tables to define relationships</p>
            </div>
            
            {/* Simple canvas visualization */}
            <div className="relative">
              <div className="flex flex-wrap justify-center gap-8">
                {/* Get unique tables */}
                {Array.from(
                  new Set([
                    ...relationships.flatMap((r) => [r.fromTable, r.toTable]),
                  ])
                ).map((table) => (
                  <div
                    key={table}
                    className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 min-w-[160px]"
                  >
                    <div className="font-semibold text-gray-900 text-sm mb-2">{table}</div>
                    <div className="space-y-1">
                      {relationships
                        .filter((r) => r.fromTable === table || r.toTable === table)
                        .map((r) => {
                          const isFrom = r.fromTable === table;
                          const otherTable = isFrom ? r.toTable : r.fromTable;
                          const column = isFrom ? r.fromColumn : r.toColumn;
                          return (
                            <div
                              key={r.id}
                              className="flex items-center gap-1 text-xs text-gray-600"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isFrom ? "bg-green-500" : "bg-blue-500"
                                }`}
                              />
                              <span className="font-mono">{column}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-gray-500">{otherTable}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Relationship lines (simplified) */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {relationships.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-indigo-900">
                      {r.fromTable}.{r.fromColumn}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getCardinalityBadgeColor(
                        r.cardinality
                      )}`}
                    >
                      {r.cardinality}
                    </span>
                    <span className="text-indigo-400">→</span>
                    <span className="font-medium text-indigo-900">
                      {r.toTable}.{r.toColumn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {relationships.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{rel.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getCardinalityBadgeColor(
                          rel.cardinality
                        )}`}
                      >
                        {rel.cardinality}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          rel.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {rel.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {rel.description && (
                      <p className="mt-1 text-sm text-gray-500">{rel.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <div className="bg-gray-100 rounded-lg px-3 py-1.5 font-mono text-xs">
                        <span className="text-gray-700">{rel.fromTable}</span>
                        <span className="text-gray-400">.</span>
                        <span className="text-indigo-600 font-semibold">{rel.fromColumn}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getCardinalityBadgeColor(
                            rel.cardinality
                          )}`}
                        >
                          {rel.cardinality}
                        </span>
                        <span className="text-[10px] text-gray-400">{rel.joinType} JOIN</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-3 py-1.5 font-mono text-xs">
                        <span className="text-gray-700">{rel.toTable}</span>
                        <span className="text-gray-400">.</span>
                        <span className="text-indigo-600 font-semibold">{rel.toColumn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(rel)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rel.id)}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {relationships.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <span className="text-4xl">🔗</span>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No relationships defined</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Define joins between your semantic model tables.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>Add Relationship</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? "Edit Relationship" : "Create Relationship"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Users to Orders"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Table
                    </label>
                    <input
                      type="text"
                      value={form.fromTable}
                      onChange={(e) => setForm({ ...form, fromTable: e.target.value })}
                      placeholder="e.g., users"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Column
                    </label>
                    <input
                      type="text"
                      value={form.fromColumn}
                      onChange={(e) => setForm({ ...form, fromColumn: e.target.value })}
                      placeholder="e.g., id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Table</label>
                    <input
                      type="text"
                      value={form.toTable}
                      onChange={(e) => setForm({ ...form, toTable: e.target.value })}
                      placeholder="e.g., orders"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Column
                    </label>
                    <input
                      type="text"
                      value={form.toColumn}
                      onChange={(e) => setForm({ ...form, toColumn: e.target.value })}
                      placeholder="e.g., user_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardinality
                    </label>
                    <select
                      value={form.cardinality}
                      onChange={(e) =>
                        setForm({ ...form, cardinality: e.target.value as Relationship["cardinality"] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      {CARDINALITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Type</label>
                    <select
                      value={form.joinType}
                      onChange={(e) =>
                        setForm({ ...form, joinType: e.target.value as Relationship["joinType"] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      {JOIN_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt} JOIN</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe this relationship..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={!form.name || !form.fromTable || !form.toTable}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suggestion Accept Modal */}
        {showSuggestionModal && selectedSuggestion && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Accept Relationship Suggestion
              </h2>
              <p className="text-sm text-gray-500 mb-4">{selectedSuggestion.reason}</p>
              <div className="bg-indigo-50 rounded-lg p-3 text-sm font-mono text-indigo-800 mb-4">
                {selectedSuggestion.fromTable}.{selectedSuggestion.fromColumn} →{" "}
                {selectedSuggestion.toTable}.{selectedSuggestion.toColumn}
                <span className="ml-2 text-indigo-600">
                  ({Math.round(selectedSuggestion.confidence * 100)}% confidence)
                </span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSuggestionModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCreate();
                    setShowSuggestionModal(false);
                    setSelectedSuggestion(null);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                  Accept & Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
