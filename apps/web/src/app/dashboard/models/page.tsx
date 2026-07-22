"use client";

import { useState } from "react";
import Link from "next/link";

interface SemanticModel {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "published";
  tableCount: number;
  lastModified: string;
}

const DEMO_MODELS: SemanticModel[] = [
  {
    id: "1",
    name: "Sales Analytics",
    description: "Core sales metrics and dimensions",
    status: "published",
    tableCount: 4,
    lastModified: "2 hours ago",
  },
  {
    id: "2",
    name: "Customer 360",
    description: "Unified customer view across all touchpoints",
    status: "draft",
    tableCount: 6,
    lastModified: "1 day ago",
  },
];

export default function ModelsPage() {
  const [models] = useState<SemanticModel[]>(DEMO_MODELS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelDescription, setNewModelDescription] = useState("");

  const handleCreateModel = () => {
    if (!newModelName.trim()) return;
    // In a real app, this would call the API
    console.log("Creating model:", { name: newModelName, description: newModelDescription });
    setShowCreateModal(false);
    setNewModelName("");
    setNewModelDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Semantic Models</h1>
            <p className="mt-1 text-sm text-gray-500">
              Define metrics, dimensions, and relationships for your data
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Create Model
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/dashboard/models/${model.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  {model.description && (
                    <p className="mt-1 text-sm text-gray-500">{model.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    model.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {model.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>{model.tableCount} tables</span>
                <span>Modified {model.lastModified}</span>
              </div>
            </Link>
          ))}
        </div>

        {models.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No models</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first semantic model to get started.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Create Model
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Semantic Model</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="Enter model name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  placeholder="Enter model description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateModel}
                disabled={!newModelName.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
