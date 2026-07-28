"use client";

import { useState } from "react";
import { Button, Modal } from "@orbitiq/design-system";
import { Box, Plus, Table2, Clock } from "lucide-react";

interface SemanticModel {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "published";
  tableCount: number;
  lastModified: string;
}

const DEMO_MODELS: SemanticModel[] = [
  { id: "1", name: "Sales Analytics", description: "Core sales metrics and dimensions for revenue analysis", status: "published", tableCount: 4, lastModified: "2 hours ago" },
  { id: "2", name: "Customer 360", description: "Unified customer view across all touchpoints", status: "draft", tableCount: 6, lastModified: "1 day ago" },
];

export default function ModelsPage() {
  const [models] = useState<SemanticModel[]>(DEMO_MODELS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelDescription, setNewModelDescription] = useState("");

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Semantic Models</h1>
          <p className="text-sm text-muted mt-1">Define metrics, dimensions, and relationships for your data.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" /> Create Model
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div key={model.id} className="surface-card p-5 hover:border-border-strong transition-colors group cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <Box className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              </div>
              <span className={model.status === "published" ? "badge-success" : "badge-warning"}>
                {model.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-accent transition-colors">{model.name}</h3>
            {model.description && <p className="text-xs text-muted mb-3 line-clamp-2">{model.description}</p>}
            <div className="flex items-center justify-between text-[11px] text-surface-6 pt-3 border-t border-border">
              <span className="flex items-center gap-1"><Table2 className="w-3 h-3" /> {model.tableCount} tables</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {model.lastModified}</span>
            </div>
          </div>
        ))}

        {models.length === 0 && (
          <div className="col-span-full surface-card p-12 text-center">
            <Box className="w-10 h-10 text-surface-6 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">No models yet</h3>
            <p className="text-xs text-muted mb-4">Create your first semantic model to get started.</p>
            <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4" /> Create Model</Button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Semantic Model">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Name</label>
              <input className="input-dark" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="e.g., Sales Analytics" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Description</label>
              <textarea className="input-dark resize-none" rows={3} value={newModelDescription} onChange={(e) => setNewModelDescription(e.target.value)} placeholder="Describe your model..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={() => setShowCreateModal(false)} disabled={!newModelName.trim()}>Create</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
