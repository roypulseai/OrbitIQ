"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@orbitiq/design-system";
import { Database, Plus, Trash2, RefreshCw } from "lucide-react";

interface Connection {
  id: string;
  workspaceId: string;
  name: string;
  connectorType: string;
  status: string;
  config: string;
  lastTestedAt?: string;
  lastTestResult?: string;
  createdAt: string;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  duckdb: "DuckDB",
  snowflake: "Snowflake",
  bigquery: "BigQuery",
};

const TYPE_FIELDS: Record<string, { key: string; label: string; placeholder: string; type?: string }[]> = {
  postgresql: [
    { key: "host", label: "Host", placeholder: "db.example.com" },
    { key: "port", label: "Port", placeholder: "5432" },
    { key: "database", label: "Database", placeholder: "analytics" },
    { key: "user", label: "Username", placeholder: "admin" },
    { key: "password", label: "Password", placeholder: "••••••••", type: "password" },
  ],
  mysql: [
    { key: "host", label: "Host", placeholder: "db.example.com" },
    { key: "port", label: "Port", placeholder: "3306" },
    { key: "database", label: "Database", placeholder: "analytics" },
    { key: "user", label: "Username", placeholder: "root" },
    { key: "password", label: "Password", placeholder: "••••••••", type: "password" },
  ],
  duckdb: [
    { key: "databasePath", label: "Database Path", placeholder: "/path/to/local.duckdb" },
  ],
  snowflake: [
    { key: "account", label: "Account", placeholder: "org.snowflakecomputing.com" },
    { key: "warehouse", label: "Warehouse", placeholder: "COMPUTE_WH" },
    { key: "database", label: "Database", placeholder: "ANALYTICS" },
    { key: "schema", label: "Schema", placeholder: "PUBLIC" },
    { key: "user", label: "Username", placeholder: "admin" },
    { key: "password", label: "Password", placeholder: "••••••••", type: "password" },
  ],
  bigquery: [
    { key: "projectId", label: "Project ID", placeholder: "my-gcp-project" },
    { key: "dataset", label: "Dataset", placeholder: "analytics" },
    { key: "keyFilename", label: "Service Account Key", placeholder: "JSON key file path", type: "password" },
  ],
};

async function gqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch("http://localhost:4001/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  return json.data;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("postgresql");
  const [formName, setFormName] = useState("");
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gqlFetch<{ connections: Connection[] }>(
        `query { connections(workspaceId: "default") { id workspaceId name connectorType status config lastTestedAt lastTestResult createdAt updatedAt } }`
      );
      setConnections(data.connections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const handleCreate = async () => {
    try {
      setError(null);
      await gqlFetch(
        `mutation CreateConnection($input: CreateConnectionInput!) { createConnection(input: $input) { id } }`,
        { input: { workspaceId: "default", name: formName, connectorType: formType, config: JSON.stringify(formFields), createdBy: "admin" } }
      );
      setShowForm(false);
      setFormName("");
      setFormFields({});
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create connection");
    }
  };

  const handleTest = async (id: string) => {
    try {
      setTesting(id);
      setError(null);
      const data = await gqlFetch<{ testConnection: { success: boolean; message: string } }>(
        `mutation TestConnection($id: ID!) { testConnection(id: $id) { success message } }`,
        { id }
      );
      alert(data.testConnection.success ? `Connected: ${data.testConnection.message}` : `Failed: ${data.testConnection.message}`);
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this connection?")) return;
    try {
      setError(null);
      await gqlFetch(
        `mutation DeleteConnection($id: ID!) { deleteConnection(id: $id) }`,
        { id }
      );
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Connections</h1>
          <p className="text-sm text-muted mt-1">Connect to PostgreSQL, MySQL, DuckDB, Snowflake, or BigQuery.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Add Connection
        </Button>
      </div>

      {error && (
        <div className="surface-card p-3 mb-4 border border-danger/30 text-danger text-sm">{error}</div>
      )}

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
              <select className="input-dark" value={formType} onChange={(e) => { setFormType(e.target.value); setFormFields({}); }}>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="duckdb">DuckDB</option>
                <option value="snowflake">Snowflake</option>
                <option value="bigquery">BigQuery</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {(TYPE_FIELDS[formType] || []).map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-muted mb-1.5">{field.label}</label>
                <input
                  className="input-dark"
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  value={formFields[field.key] || ""}
                  onChange={(e) => setFormFields({ ...formFields, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formName}>Save Connection</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="surface-card p-10 text-center text-muted">Loading connections...</div>
      ) : connections.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <Database className="w-10 h-10 text-surface-6 mx-auto mb-3" />
          <p className="text-sm text-muted">No connections yet. Add one to get started.</p>
        </div>
      ) : (
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
                    <span className="badge-info">{TYPE_LABELS[conn.connectorType] || conn.connectorType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${conn.status === "active" ? "bg-success" : conn.status === "error" ? "bg-danger" : "bg-surface-6"}`} />
                  <span className="text-xs text-muted capitalize">{conn.status}</span>
                </div>
              </div>
              <div className="text-xs text-muted space-y-1 mb-4 font-mono">
                {(() => {
                  try {
                    const cfg = JSON.parse(conn.config);
                    const fields = TYPE_FIELDS[conn.connectorType] || [];
                    const primary = fields.slice(0, 2).map(f => cfg[f.key]).filter(Boolean);
                    return <div>{primary.join(": ")}</div>;
                  } catch { return <div className="text-surface-6">config encrypted</div>; }
                })()}
              </div>
              {conn.lastTestedAt && (
                <div className="text-[11px] text-surface-6 mb-1">
                  Last tested {new Date(conn.lastTestedAt).toLocaleString()}
                  {conn.lastTestResult && ` - ${conn.lastTestResult}`}
                </div>
              )}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1"
                  onClick={() => handleTest(conn.id)}
                  disabled={testing === conn.id}
                >
                  <RefreshCw className={`w-3 h-3 ${testing === conn.id ? "animate-spin" : ""}`} />
                  {testing === conn.id ? "Testing..." : "Test"}
                </button>
                <button
                  className="text-xs text-danger hover:text-red-400 transition-colors flex items-center gap-1"
                  onClick={() => handleDelete(conn.id)}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
