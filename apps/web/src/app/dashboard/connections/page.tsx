"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";
import { Database, Plus, TestTube } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  type: "postgresql" | "snowflake" | "bigquery" | "mysql";
  status: "active" | "inactive" | "error";
  host: string;
  port: string;
  database: string;
  lastTested?: string;
}

const DEMO_CONNECTIONS: Connection[] = [
  { id: "1", name: "Production PostgreSQL", type: "postgresql", status: "active", host: "db.orbitiq.dev", port: "5432", database: "analytics", lastTested: "2 min ago" },
  { id: "2", name: "Analytics Snowflake", type: "snowflake", status: "active", host: "org.snowflakecomputing.com", port: "443", database: "ANALYTICS", lastTested: "15 min ago" },
  { id: "3", name: "Marketing BigQuery", type: "bigquery", status: "inactive", host: "bigquery.googleapis.com", port: "443", database: "marketing_ds" },
];

const TYPE_COLORS: Record<string, string> = {
  postgresql: "badge-info",
  snowflake: "badge-accent",
  bigquery: "badge-success",
  mysql: "badge-warning",
};

const TYPE_FIELDS: Record<string, { label: string; placeholder: string }[]> = {
  postgresql: [
    { label: "Host", placeholder: "db.example.com" },
    { label: "Port", placeholder: "5432" },
    { label: "Database", placeholder: "analytics" },
    { label: "Username", placeholder: "admin" },
    { label: "Password", placeholder: "••••••••" },
  ],
  snowflake: [
    { label: "Account", placeholder: "org.snowflakecomputing.com" },
    { label: "Warehouse", placeholder: "COMPUTE_WH" },
    { label: "Database", placeholder: "ANALYTICS" },
    { label: "Schema", placeholder: "PUBLIC" },
    { label: "Username", placeholder: "admin" },
    { label: "Password", placeholder: "••••••••" },
  ],
  bigquery: [
    { label: "Project ID", placeholder: "my-gcp-project" },
    { label: "Dataset", placeholder: "analytics" },
    { label: "Service Account Key", placeholder: "JSON key file path" },
  ],
  mysql: [
    { label: "Host", placeholder: "db.example.com" },
    { label: "Port", placeholder: "3306" },
    { label: "Database", placeholder: "analytics" },
    { label: "Username", placeholder: "root" },
    { label: "Password", placeholder: "••••••••" },
  ],
};

export default function ConnectionsPage() {
  const [connections] = useState<Connection[]>(DEMO_CONNECTIONS);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<string>("postgresql");
  const [formName, setFormName] = useState("");
  const [testing, setTesting] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 1500);
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Connections</h1>
          <p className="text-sm text-muted mt-1">Manage your database and data source connections.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Add Connection
        </Button>
      </div>

      {showForm && (
        <div className="surface-card p-5 mb-6 animate-slide-down">
          <h3 className="text-sm font-semibold text-white mb-4">New Connection</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Connection Name</label>
              <input className="input-dark" placeholder="My Database" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Type</label>
              <select className="input-dark" value={formType} onChange={(e) => setFormType(e.target.value)}>
                <option value="postgresql">PostgreSQL</option>
                <option value="snowflake">Snowflake</option>
                <option value="bigquery">BigQuery</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {(TYPE_FIELDS[formType] || []).map((field) => (
              <div key={field.label}>
                <label className="block text-xs text-muted mb-1.5">{field.label}</label>
                <input className="input-dark" placeholder={field.placeholder} type={field.label === "Password" || field.label === "Service Account Key" ? "password" : "text"} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleTest} isLoading={testing}>
              <TestTube className="w-4 h-4" /> Test Connection
            </Button>
            <Button onClick={() => setShowForm(false)}>Save Connection</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((conn) => (
          <div key={conn.id} className="surface-card p-5 hover:border-border-strong transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center">
                  <Database className="w-5 h-5 text-muted" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{conn.name}</h3>
                  <span className={TYPE_COLORS[conn.type]}>{conn.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${conn.status === "active" ? "bg-success" : conn.status === "error" ? "bg-danger" : "bg-surface-6"}`} />
                <span className="text-xs text-muted capitalize">{conn.status}</span>
              </div>
            </div>
            <div className="text-xs text-muted space-y-1 mb-4 font-mono">
              <div>{conn.host}:{conn.port}</div>
              <div>{conn.database}</div>
            </div>
            {conn.lastTested && (
              <div className="text-[11px] text-surface-6">Last tested {conn.lastTested}</div>
            )}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs text-muted hover:text-white transition-colors">Edit</button>
              <button className="text-xs text-danger hover:text-red-400 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
