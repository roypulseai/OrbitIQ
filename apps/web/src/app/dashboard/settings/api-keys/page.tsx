"use client";

import { useState } from "react";
import { Button, Badge, Modal } from "@orbitiq/design-system";
import { Plus, Trash2, Copy, CheckCircle } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

const DEMO_KEYS: ApiKey[] = [
  { id: "1", name: "Production API Key", key: "orb_live_••••••••••••••••", createdAt: "2025-01-15", lastUsed: "2 hours ago", status: "active" },
  { id: "2", name: "Staging API Key", key: "orb_test_••••••••••••••••", createdAt: "2025-02-01", lastUsed: "3 days ago", status: "active" },
  { id: "3", name: "Legacy Key", key: "orb_old_••••••••••••••••", createdAt: "2024-11-10", lastUsed: "Never", status: "revoked" },
];

export default function ApiKeysPage() {
  const [keys] = useState<ApiKey[]>(DEMO_KEYS);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const key = `orb_live_${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
    setNewKeyValue(key);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Keys</h1>
          <p className="text-sm text-muted mt-1">Manage programmatic access to your OrbitIQ workspace.</p>
        </div>
        <Button onClick={() => { setShowNewKeyModal(true); setNewKeyValue(null); setNewKeyName(""); }}>
          <Plus className="w-4 h-4" /> Generate Key
        </Button>
      </div>

      <div className="space-y-2">
        {keys.map((k) => (
          <div key={k.id} className="surface-card p-4 flex items-center justify-between hover:border-border-strong transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${k.status === "active" ? "bg-success" : "bg-surface-6"}`} />
              <div>
                <div className="text-sm font-medium text-white">{k.name}</div>
                <div className="text-xs text-muted font-mono">{k.key}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-[11px] text-muted">
                <div>Created: {k.createdAt}</div>
                <div>Last used: {k.lastUsed}</div>
              </div>
              <button className="p-1.5 text-surface-6 hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showNewKeyModal && (
        <Modal isOpen={showNewKeyModal} onClose={() => setShowNewKeyModal(false)} title={newKeyValue ? "Key Generated" : "Generate API Key"}>
          {!newKeyValue ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Key Name</label>
                <input className="input-dark" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Production Key" />
              </div>
              <div className="bg-surface-3 rounded-lg p-3">
                <div className="text-[11px] text-muted mb-1">Key will have the following permissions:</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="info">read:dashboards</Badge>
                  <Badge variant="info">execute:queries</Badge>
                  <Badge variant="info">read:connections</Badge>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowNewKeyModal(false)}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={!newKeyName.trim()}>Generate</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-surface-3 rounded-lg p-4">
                <div className="text-[11px] text-muted mb-2">Your API Key (copy it now — it won't be shown again):</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-accent flex-1 break-all">{newKeyValue}</code>
                  <button onClick={() => handleCopy(newKeyValue)} className="p-1.5 text-muted hover:text-accent transition-colors shrink-0">
                    {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowNewKeyModal(false)}>Done</Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
