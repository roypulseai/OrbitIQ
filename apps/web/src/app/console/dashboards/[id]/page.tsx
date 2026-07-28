"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { GlobalFilterBar } from "@/components/dashboard/GlobalFilterBar";
import { DashboardCanvas, TileData } from "@/components/dashboard/DashboardCanvas";
import { DrillDownPanel } from "@/components/dashboard/DrillDownPanel";
import { TileEditor } from "@/components/dashboard/TileEditor";
import { gqlFetch } from "@/lib/gql";

interface DashboardTileRaw {
  id: string;
  chartSpec: string;
  oqlQuery: string;
  position: string;
}

interface FetchedDashboard {
  id: string;
  name: string;
  description?: string;
  tiles: DashboardTileRaw[];
}

export default function DashboardDetailPage() {
  const params = useParams();
  const dashboardId = params.id as string;
  const [dashboard, setDashboard] = useState<FetchedDashboard | null>(null);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingTile, setExecutingTile] = useState<string | null>(null);
  const [editingTileId, setEditingTileId] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchAndExecuteTiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gqlFetch<{ dashboard: FetchedDashboard }>(
        `query Dashboard($id: String!) {
          dashboard(id: $id) {
            id name description
            tiles { id chartSpec oqlQuery position }
          }
        }`,
        { id: dashboardId }
      );
      const fetched = data.dashboard;
      setDashboard(fetched);

      const tilePromises = fetched.tiles.map(async (tile) => {
        const spec = typeof tile.chartSpec === "string" ? JSON.parse(tile.chartSpec) : tile.chartSpec;
        const oql = typeof tile.oqlQuery === "string" ? JSON.parse(tile.oqlQuery) : tile.oqlQuery;
        const pos = typeof tile.position === "string" ? JSON.parse(tile.position) : tile.position;

        let tileData: TileData = {
          id: tile.id,
          title: spec.title || "Untitled",
          chartType: spec.chartType || "table",
          data: [],
          xField: spec.xField,
          yField: spec.yField,
          colorField: spec.colorField,
          position: {
            i: tile.id,
            x: pos.x ?? 0,
            y: pos.y ?? 0,
            w: pos.w ?? 4,
            h: pos.h ?? 4,
          },
          kpiValue: spec.kpiValue,
          kpiLabel: spec.kpiLabel,
          kpiTrend: spec.kpiTrend,
        };

        const sql = oql.sql || oql.query;
        if (sql) {
          try {
            const result = await gqlFetch<{ executeTileQuery: any }>(
              `mutation ExecuteTileQuery($tileId: String!, $tableId: String) {
                executeTileQuery(tileId: $tileId, tableId: $tableId) {
                  columns rows rowCount executionTimeMs sql
                }
              }`,
              { tileId: tile.id, tableId: oql.tableId || null }
            );
            const execResult = result.executeTileQuery;
            if (execResult && execResult.rows) {
              const rows = typeof execResult.rows === "string" ? JSON.parse(execResult.rows) : execResult.rows;
              tileData.data = rows;

              if (spec.chartType === "kpi" && rows.length > 0) {
                const firstRow = rows[0];
                const valueKey = spec.yField || Object.keys(firstRow)[0];
                const value = firstRow[valueKey];
                tileData.kpiValue = typeof value === "number" ? value.toLocaleString() : String(value);
              }
            }
          } catch (err) {
            console.error(`Failed to execute tile query for ${tile.id}:`, err);
          }
        }

        return tileData;
      });

      const tileDataList = await Promise.all(tilePromises);
      setTiles(tileDataList);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    }
    setExecutingTile(null);
    setLoading(false);
  }, [dashboardId]);

  useEffect(() => {
    if (dashboardId) fetchAndExecuteTiles();
  }, [dashboardId, fetchAndExecuteTiles]);

  const handleEditTile = useCallback((tileId: string) => {
    setEditingTileId(tileId);
  }, []);

  const handleDuplicateTile = useCallback(async (tileId: string) => {
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || !dashboard) return;
    try {
      await gqlFetch(
        `mutation AddTile($dashboardId: String!, $input: DashboardTileInput!) {
          addTileToDashboard(dashboardId: $dashboardId, input: $input) { id }
        }`,
        {
          dashboardId: dashboard.id,
          input: {
            title: `${tile.title} (Copy)`,
            chartType: tile.chartType,
            oqlQuery: JSON.stringify({ sql: `SELECT * FROM data LIMIT 10` }),
            chartSpec: JSON.stringify({ title: `${tile.title} (Copy)`, chartType: tile.chartType, xField: tile.xField, yField: tile.yField }),
            position: JSON.stringify({ x: tile.position.x + tile.position.w, y: tile.position.y, w: tile.position.w, h: tile.position.h }),
          },
        }
      );
      fetchAndExecuteTiles();
    } catch (err) {
      console.error("Failed to duplicate tile:", err);
    }
  }, [tiles, dashboard, fetchAndExecuteTiles]);

  const handleRemoveTile = useCallback(async (tileId: string) => {
    if (!confirm("Remove this tile?")) return;
    try {
      await gqlFetch(
        `mutation RemoveTile($dashboardId: String!, $tileId: String!) {
          removeTileFromDashboard(dashboardId: $dashboardId, tileId: $tileId)
        }`,
        { dashboardId, tileId }
      );
      setTiles(prev => prev.filter(t => t.id !== tileId));
    } catch (err) {
      console.error("Failed to remove tile:", err);
    }
  }, [dashboardId]);

  const handleSaveTile = useCallback(async (updates: { title: string; chartType: string; sql: string }) => {
    if (!editingTileId) return;
    try {
      await gqlFetch(
        `mutation UpdateTile($tileId: String!, $input: DashboardTileInput!) {
          updateDashboardTile(tileId: $tileId, input: $input) { id }
        }`,
        {
          tileId: editingTileId,
          input: {
            title: updates.title,
            chartType: updates.chartType,
            oqlQuery: JSON.stringify({ sql: updates.sql }),
          },
        }
      );
      setEditingTileId(null);
      fetchAndExecuteTiles();
    } catch (err) {
      console.error("Failed to save tile:", err);
    }
  }, [editingTileId, fetchAndExecuteTiles]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const el = dashboardRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: "#0a0a0b", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const ratio = canvas.width / canvas.height;
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdfW / ratio;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save("dashboard.pdf");
    } catch (e) {
      console.error("PDF export failed:", e);
    }
  }, []);

  const handleExportImage = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = dashboardRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: "#0a0a0b", scale: 2 });
      const link = document.createElement("a");
      link.download = "dashboard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Image export failed:", e);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-1">
        <div className="text-slate-400">
          {executingTile ? `Executing query for tile...` : "Loading dashboard..."}
        </div>
      </div>
    );
  }

  const editingTile = editingTileId ? tiles.find(t => t.id === editingTileId) : null;
  const editingTileRaw = editingTileId && dashboard ? dashboard.tiles.find(t => t.id === editingTileId) : null;
  const editingTileSql = editingTileRaw ? (() => { try { const o = typeof editingTileRaw.oqlQuery === "string" ? JSON.parse(editingTileRaw.oqlQuery) : editingTileRaw.oqlQuery; return o.sql || o.query || ""; } catch { return ""; } })() : "";

  return (
    <DashboardProvider>
      <div className="flex flex-col h-full bg-surface-1">
        <DashboardToolbar
          dashboardName={dashboard?.name || "Dashboard"}
          dashboardDescription={dashboard?.description}
          onExportPDF={handleExportPDF}
          onExportImage={handleExportImage}
        />
        <GlobalFilterBar />
        <div ref={dashboardRef} className="flex-1 overflow-y-auto">
          {tiles.length > 0 ? (
            <DashboardCanvas
              tiles={tiles}
              onEditTile={handleEditTile}
              onDuplicateTile={handleDuplicateTile}
              onRemoveTile={handleRemoveTile}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              No tiles — add tiles from the Explore page or OQL editor
            </div>
          )}
        </div>
        <DrillDownPanel />
      </div>

      {editingTile && (
        <TileEditor
          tileId={editingTile.id}
          tileTitle={editingTile.title}
          tileChartType={editingTile.chartType}
          tileSql={editingTileSql}
          onSave={handleSaveTile}
          onDelete={() => { handleRemoveTile(editingTile.id); setEditingTileId(null); }}
          onClose={() => setEditingTileId(null)}
        />
      )}
    </DashboardProvider>
  );
}
