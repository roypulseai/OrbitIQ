"use client";

import { useState } from "react";
import { Users, Link2, Shield, Copy, Trash2, Plus, Globe, Lock, ChevronDown } from "lucide-react";

interface ShareEntry {
  id: string;
  name: string;
  email: string;
  avatar: string;
  permission: "view" | "edit" | "admin";
  addedAt: string;
}

interface PublicLink {
  id: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  views: number;
}

const MOCK_SHARES: ShareEntry[] = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@acme.com", avatar: "SC", permission: "edit", addedAt: "2 days ago" },
  { id: "2", name: "Marcus Johnson", email: "marcus.j@acme.com", avatar: "MJ", permission: "view", addedAt: "1 week ago" },
  { id: "3", name: "Priya Patel", email: "priya.p@acme.com", avatar: "PP", permission: "admin", addedAt: "3 days ago" },
  { id: "4", name: "Alex Rivera", email: "alex.r@acme.com", avatar: "AR", permission: "view", addedAt: "5 days ago" },
];

const MOCK_LINKS: PublicLink[] = [
  { id: "1", url: "https://app.orbitiq.dev/shared/dash/sales-q4-2025?token=xK9mP2", createdAt: "2 days ago", expiresAt: "Dec 31, 2025", views: 142 },
  { id: "2", url: "https://app.orbitiq.dev/shared/dash/exec-summary?token=aB3nQ7", createdAt: "1 week ago", expiresAt: "Jan 15, 2026", views: 58 },
];

const DASHBOARDS = ["Sales Overview", "Executive Summary", "Marketing Analytics", "Customer Insights", "Financial Dashboard"];

const PERMISSION_COLORS: Record<string, string> = {
  view: "bg-info-muted text-info",
  edit: "bg-success-muted text-success",
  admin: "bg-accent-muted text-accent",
};

const AVATAR_COLORS = ["from-accent to-purple-500", "from-cyan-500 to-blue-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"];

export default function SharingPage() {
  const [selectedDashboard, setSelectedDashboard] = useState("Sales Overview");
  const [shares, setShares] = useState<ShareEntry[]>(MOCK_SHARES);
  const [links, setLinks] = useState<PublicLink[]>(MOCK_LINKS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<"view" | "edit" | "admin">("view");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newShare: ShareEntry = {
      id: String(Date.now()),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      avatar: inviteEmail.substring(0, 2).toUpperCase(),
      permission: invitePermission,
      addedAt: "Just now",
    };
    setShares((prev) => [...prev, newShare]);
    setInviteEmail("");
  };

  const handleRemoveShare = (id: string) => {
    setShares((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRevokeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-accent" />
            Sharing & Permissions
          </h1>
          <p className="text-sm text-muted mt-1">Manage who can access your dashboards and control their permissions.</p>
        </div>
        <div className="relative">
          <select
            value={selectedDashboard}
            onChange={(e) => setSelectedDashboard(e.target.value)}
            className="input-dark pr-8 appearance-none cursor-pointer min-w-[200px]"
          >
            {DASHBOARDS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
      </div>

      {/* People with access */}
      <div className="surface-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            People with access
          </h2>
          <span className="text-xs text-muted">{shares.length} member{shares.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">User</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Email</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Permission</th>
                <th className="text-left text-[11px] font-medium text-muted uppercase tracking-wider pb-3 pr-4">Added</th>
                <th className="text-right text-[11px] font-medium text-muted uppercase tracking-wider pb-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share, i) => (
                <tr key={share.id} className="border-b border-border/50 last:border-0 group hover:bg-surface-3/30 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[11px] font-semibold text-white shrink-0`}>
                        {share.avatar}
                      </div>
                      <span className="text-sm font-medium text-white">{share.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted">{share.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PERMISSION_COLORS[share.permission]}`}>
                      {share.permission.charAt(0).toUpperCase() + share.permission.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted">{share.addedAt}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleRemoveShare(share.id)}
                      className="p-1.5 text-surface-6 hover:text-danger transition-colors opacity-0 group-hover:opacity-100 rounded"
                      title="Remove access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite people */}
      <div className="surface-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-accent" />
          Invite people
        </h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1.5">Email address</label>
            <input
              className="input-dark"
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs text-muted mb-1.5">Permission</label>
            <div className="relative">
              <select
                value={invitePermission}
                onChange={(e) => setInvitePermission(e.target.value as "view" | "edit" | "admin")}
                className="input-dark pr-8 appearance-none cursor-pointer"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          </div>
          <button onClick={handleInvite} className="btn-primary h-[38px]">
            <Plus className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Public Links */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            Public Links
          </h2>
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Lock className="w-3.5 h-3.5" /> Create public link
          </button>
        </div>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">No public links created yet.</div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-surface-3 rounded-lg group hover:border-border-strong transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="w-3.5 h-3.5 text-accent shrink-0" />
                    <code className="text-xs font-mono text-white/80 truncate">{link.url}</code>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span>Expires: {link.expiresAt}</span>
                    <span>·</span>
                    <span>{link.views} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(link.url, link.id)}
                    className="p-1.5 text-muted hover:text-white hover:bg-surface-4 rounded transition-colors"
                    title="Copy link"
                  >
                    {copiedId === link.id ? <Copy className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleRevokeLink(link.id)}
                    className="p-1.5 text-muted hover:text-danger hover:bg-danger-muted rounded transition-colors"
                    title="Revoke link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
