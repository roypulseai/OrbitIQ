"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { gqlFetch } from "@/lib/gql";

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  tileCount: number;
  createdAt: string;
}

const WORKSPACE_ID = "default-workspace";

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const data = await gqlFetch<{ dashboards: any[] }>(
        `query Dashboards($workspaceId: String!) {
          dashboards(workspaceId: $workspaceId) {
            id name description createdAt
            tiles { id }
          }
        }`,
        { workspaceId: WORKSPACE_ID }
      );
      setDashboards(
        data.dashboards.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          tileCount: d.tiles?.length || 0,
          createdAt: d.createdAt,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch dashboards:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await gqlFetch(
        `mutation CreateDashboard($input: CreateDashboardInput!) {
          createDashboard(input: $input) { id }
        }`,
        { input: { workspaceId: WORKSPACE_ID, name: newName, description: newDesc || undefined } }
      );
      setNewName("");
      setNewDesc("");
      fetchDashboards();
    } catch (err) {
      console.error("Failed to create dashboard:", err);
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await gqlFetch(`mutation DeleteDashboard($id: String!) { deleteDashboard(id: $id) }`, { id });
      fetchDashboards();
    } catch (err) {
      console.error("Failed to delete dashboard:", err);
    }
  };

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboards</h1>
            <p className="mt-1 text-sm text-slate-400">Create and manage your dashboards</p>
          </div>
          <button
            onClick={() => setCreating(!creating)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus size={16} />
            Create Dashboard
          </button>
        </div>

        {creating && (
          <div className="mb-6 bg-surface-2 border border-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-3">New Dashboard</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Dashboard name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-surface-1 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="flex-1 bg-surface-1 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-slate-400">Loading dashboards...</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.id}
              href={`/console/dashboards/${dashboard.id}`}
              className="bg-surface-2 rounded-xl border border-border p-6 hover:border-indigo-500/50 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    <LayoutDashboard size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{dashboard.name}</h3>
                    {dashboard.description && (
                      <p className="mt-1 text-sm text-slate-400">{dashboard.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(dashboard.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{dashboard.tileCount} tiles</span>
                <span>{new Date(dashboard.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>

        {!loading && dashboards.length === 0 && (
          <div className="text-center py-12 bg-surface-2 rounded-xl border border-border">
            <LayoutDashboard className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-2 text-sm font-medium text-white">No dashboards</h3>
            <p className="mt-1 text-sm text-slate-400">Create your first dashboard to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
