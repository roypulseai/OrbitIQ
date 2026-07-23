"use client";

import { useState } from "react";
import { Button, Badge, Modal } from "@orbitiq/design-system";
import { Settings, Shield, Key, Plus, Trash2, Palette } from "lucide-react";

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "security", label: "Security", icon: Shield },
  { id: "api-keys", label: "API Keys", icon: Key },
];

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  return (
    <div className="page-content animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your account, security, and API access.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-lg p-1 w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.id ? "bg-surface-3 text-white" : "text-muted hover:text-white"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === "general" && (
        <div className="max-w-2xl space-y-4 animate-fade-in">
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Display Name</label>
                <input className="input-dark" defaultValue="Admin User" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Email</label>
                <input className="input-dark" defaultValue="admin@orbitiq.dev" disabled />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Organization</label>
                <input className="input-dark" defaultValue="OrbitIQ" disabled />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Role</label>
                <div className="flex items-center h-[38px]"><Badge variant="accent">Admin</Badge></div>
              </div>
            </div>
            <div className="flex justify-end mt-4"><Button>Save Changes</Button></div>
          </div>
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Theme</h3>
            <div className="flex items-center gap-4">
              {["Dark", "Light", "System"].map((theme) => (
                <button key={theme} className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${theme === "Dark" ? "border-accent bg-accent/5" : "border-border hover:border-border-strong"}`}>
                  <Palette className="w-5 h-5 text-muted" />
                  <span className="text-xs text-white">{theme}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === "security" && (
        <div className="max-w-2xl space-y-4 animate-fade-in">
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Password</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1.5">Current Password</label>
                <input className="input-dark" type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">New Password</label>
                  <input className="input-dark" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Confirm New Password</label>
                  <input className="input-dark" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end"><Button>Update Password</Button></div>
            </div>
          </div>
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Session Management</h3>
            <div className="space-y-2">
              {[
                { device: "Chrome on macOS", ip: "192.168.1.1", lastActive: "Current session" },
                { device: "Firefox on Windows", ip: "10.0.0.42", lastActive: "2 hours ago" },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-surface-3 rounded-lg">
                  <div>
                    <div className="text-xs font-medium text-white">{session.device}</div>
                    <div className="text-[11px] text-muted">IP: {session.ip} · Last active: {session.lastActive}</div>
                  </div>
                  {i > 0 && <button className="text-xs text-danger hover:text-red-400 transition-colors">Revoke</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === "api-keys" && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">API Keys</h3>
            <Button onClick={() => setShowNewKeyModal(true)}>
              <Plus className="w-4 h-4" /> Generate Key
            </Button>
          </div>
          <div className="space-y-2">
            {DEMO_KEYS.map((k) => (
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
            <Modal isOpen={showNewKeyModal} onClose={() => setShowNewKeyModal(false)} title="Generate API Key">
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
                  <Button onClick={() => setShowNewKeyModal(false)} disabled={!newKeyName.trim()}>Generate</Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}
