"use client";

import { useState } from "react";
import {
  Shield,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";

interface CompliancePack {
  id: string;
  name: string;
  region: string;
  version: string;
  active: boolean;
  color: string;
  rules: string[];
}

interface ResidencyRule {
  id: string;
  connection: string;
  allowedRegions: string[];
  defaultRegion: string;
  enforcement: "strict" | "advisory";
}

interface ConsentRecord {
  id: string;
  user: string;
  purpose: string;
  status: "granted" | "denied";
  grantedAt: string;
  expires: string;
}

interface DSARRequest {
  id: string;
  requestId: string;
  user: string;
  type: "export" | "deletion" | "portability";
  status: "completed" | "in_progress" | "pending";
  requested: string;
  completed: string;
}

const INITIAL_PACKS: CompliancePack[] = [
  {
    id: "1",
    name: "GDPR",
    region: "European Union",
    version: "v1.0",
    active: true,
    color: "blue",
    rules: ["Data Residency (EU-only)", "Consent Required", "RTBF Workflow", "Purpose Limitation"],
  },
  {
    id: "2",
    name: "CCPA",
    region: "California, US",
    version: "v1.0",
    active: true,
    color: "purple",
    rules: ["Do Not Sell Flag", "DSAR Export", "Data Minimization"],
  },
];

const INITIAL_RESIDENCY: ResidencyRule[] = [
  { id: "1", connection: "PostgreSQL Primary", allowedRegions: ["EU", "US"], defaultRegion: "EU", enforcement: "strict" },
  { id: "2", connection: "Snowflake Analytics", allowedRegions: ["US", "EU"], defaultRegion: "US", enforcement: "strict" },
  { id: "3", connection: "BigQuery Data Lake", allowedRegions: ["US"], defaultRegion: "US", enforcement: "advisory" },
];

const INITIAL_CONSENTS: ConsentRecord[] = [
  { id: "1", user: "alice@acme.com", purpose: "Analytics", status: "granted", grantedAt: "2026-01-15", expires: "2027-01-15" },
  { id: "2", user: "bob@acme.com", purpose: "Marketing", status: "denied", grantedAt: "2026-03-20", expires: "-" },
  { id: "3", user: "carol@acme.com", purpose: "Analytics", status: "granted", grantedAt: "2026-02-10", expires: "2027-02-10" },
  { id: "4", user: "dave@acme.com", purpose: "Third Party Sharing", status: "denied", grantedAt: "2026-04-01", expires: "-" },
  { id: "5", user: "eve@acme.com", purpose: "Analytics", status: "granted", grantedAt: "2026-05-15", expires: "2027-05-15" },
];

const INITIAL_DSAR: DSARRequest[] = [
  { id: "1", requestId: "DSAR-001", user: "alice@acme.com", type: "export", status: "completed", requested: "2026-06-01", completed: "2026-06-03" },
  { id: "2", requestId: "DSAR-002", user: "bob@acme.com", type: "deletion", status: "in_progress", requested: "2026-07-10", completed: "-" },
  { id: "3", requestId: "DSAR-003", user: "carol@acme.com", type: "portability", status: "pending", requested: "2026-07-15", completed: "-" },
];

export default function CompliancePage() {
  const [packs, setPacks] = useState(INITIAL_PACKS);
  const [residency, setResidency] = useState(INITIAL_RESIDENCY);
  const [consents] = useState(INITIAL_CONSENTS);
  const [dsars] = useState(INITIAL_DSAR);
  const [showResidencyModal, setShowResidencyModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const togglePack = (id: string) => {
    setPacks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const activePacks = packs.filter((p) => p.active).length;

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent" />
            Compliance Policy Engine
          </h1>
          <p className="text-surface-6 text-sm mt-1">
            Manage compliance packs and data governance policies
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          {activePacks} active packs
        </span>
      </div>

      {/* Compliance Packs */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          Compliance Packs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="bg-surface-1 border border-border rounded-xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    pack.color === "blue" ? "bg-blue-500/10" : "bg-purple-500/10"
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      pack.color === "blue" ? "text-blue-400" : "text-purple-400"
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{pack.name}</div>
                    <div className="text-xs text-surface-6">{pack.region}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    pack.color === "blue" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                  }`}>
                    {pack.version}
                  </span>
                  <button
                    onClick={() => togglePack(pack.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      pack.active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${pack.active ? "bg-green-400" : "bg-white/30"}`} />
                    {pack.active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)}
                className="flex items-center gap-2 text-xs text-surface-6 hover:text-white transition-colors mb-3"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedPack === pack.id ? "rotate-180" : ""}`} />
                {expandedPack === pack.id ? "Hide" : "Show"} Rules ({pack.rules.length})
              </button>
              {expandedPack === pack.id && (
                <div className="space-y-1.5">
                  {pack.rules.map((rule) => (
                    <div key={rule} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-white/70">{rule}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Residency */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Data Residency
          </h2>
          <button
            onClick={() => setShowResidencyModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Connection</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Allowed Regions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Default Region</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Enforcement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {residency.map((rule) => (
                <tr key={rule.id} className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{rule.connection}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.allowedRegions.map((region) => (
                        <span key={region} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          region === "EU" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                        }`}>
                          {region}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      rule.defaultRegion === "EU" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    }`}>
                      {rule.defaultRegion}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      rule.enforcement === "strict"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {rule.enforcement === "strict" ? "Strict" : "Advisory"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-surface-3 text-white/40 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setResidency((prev) => prev.filter((r) => r.id !== rule.id))}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consent Management */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Consent Management
          </h2>
          <button
            onClick={() => setShowConsentModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Record Consent
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Purpose</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Granted At</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Expires</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {consents.map((consent) => (
                <tr key={consent.id} className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{consent.user}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{consent.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      consent.status === "granted"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {consent.status === "granted" ? "Granted" : "Denied"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">{consent.grantedAt}</td>
                  <td className="px-4 py-3 text-sm text-white/60">{consent.expires}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-surface-3 text-white/40 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DSAR Requests */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            DSAR Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Request ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Requested</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Completed</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-6 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dsars.map((dsar) => (
                <tr key={dsar.id} className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-white/70 bg-surface-3 px-2 py-0.5 rounded">{dsar.requestId}</code>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{dsar.user}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      dsar.type === "export"
                        ? "bg-blue-500/10 text-blue-400"
                        : dsar.type === "deletion"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}>
                      {dsar.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      dsar.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : dsar.status === "in_progress"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-white/5 text-white/40"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        dsar.status === "completed"
                          ? "bg-green-400"
                          : dsar.status === "in_progress"
                          ? "bg-yellow-400"
                          : "bg-white/30"
                      }`} />
                      {dsar.status === "in_progress" ? "In Progress" : dsar.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">{dsar.requested}</td>
                  <td className="px-4 py-3 text-sm text-white/60">{dsar.completed}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-surface-3 text-white/40 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Residency Modal */}
      {showResidencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111113] border border-white/10 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Add Residency Rule</h3>
              <button onClick={() => setShowResidencyModal(false)} className="p-1 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Connection</label>
                <select className="input-dark w-full pr-8 appearance-none cursor-pointer">
                  <option>Select connection...</option>
                  <option>PostgreSQL Primary</option>
                  <option>Snowflake Analytics</option>
                  <option>BigQuery Data Lake</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Allowed Regions</label>
                <div className="flex gap-2">
                  {["EU", "US", "APAC"].map((region) => (
                    <label key={region} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs font-medium text-white/60 cursor-pointer">
                      <input type="checkbox" className="sr-only" />
                      {region}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Default Region</label>
                  <select className="input-dark w-full pr-8 appearance-none cursor-pointer">
                    <option>EU</option>
                    <option>US</option>
                    <option>APAC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Enforcement</label>
                  <select className="input-dark w-full pr-8 appearance-none cursor-pointer">
                    <option>Strict</option>
                    <option>Advisory</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-white/10">
              <button onClick={() => setShowResidencyModal(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={() => setShowResidencyModal(false)} className="btn-primary text-sm">
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111113] border border-white/10 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Record Consent</h3>
              <button onClick={() => setShowConsentModal(false)} className="p-1 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">User Email</label>
                <input type="email" className="input-dark w-full" placeholder="user@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Purpose</label>
                  <select className="input-dark w-full pr-8 appearance-none cursor-pointer">
                    <option>Analytics</option>
                    <option>Marketing</option>
                    <option>Third Party Sharing</option>
                    <option>Personalization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Status</label>
                  <select className="input-dark w-full pr-8 appearance-none cursor-pointer">
                    <option>Granted</option>
                    <option>Denied</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Expires</label>
                <input type="date" className="input-dark w-full" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-white/10">
              <button onClick={() => setShowConsentModal(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={() => setShowConsentModal(false)} className="btn-primary text-sm">
                Record Consent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
