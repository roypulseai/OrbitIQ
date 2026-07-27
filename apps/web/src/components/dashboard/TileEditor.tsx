"use client";

import { useState } from "react";
import { X, Loader2, Play } from "lucide-react";
import { gqlFetch } from "@/lib/gql";

interface TileEditorProps {
  tileId: string;
  tileTitle: string;
  tileChartType: string;
  tileSql?: string;
  tileTableId?: string;
  onSave: (updates: { title: string; chartType: string; sql: string }) => void;
  onDelete: () => void;
  onClose: () => void;
}

const CHART_TYPES = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "scatter", label: "Scatter" },
  { value: "pie", label: "Pie" },
  { value: "donut", label: "Donut" },
  { value: "kpi", label: "KPI" },
  { value: "table", label: "Table" },
];

export function TileEditor({
  tileId: _tileId,
  tileTitle,
  tileChartType,
  tileSql = "",
  tileTableId,
  onSave,
  onDelete,
  onClose,
}: TileEditorProps) {
  const [title, setTitle] = useState(tileTitle);
  const [chartType, setChartType] = useState(tileChartType);
  const [sql, setSql] = useState(tileSql);
  const [preview, setPreview] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePreview = async () => {
    if (!sql.trim()) return;
    setPreviewing(true);
    setPreviewError(null);
    setPreview(null);
    try {
      const data = await gqlFetch<{ executeRawSQL: { columns: string[]; rows: string; rowCount: number } }>(
        `mutation Exec($sql: String!, $tableId: String) { executeRawSQL(sql: $sql, tableId: $tableId) { columns rows rowCount } }`,
        { sql, tableId: tileTableId || null }
      );
      const result = data.executeRawSQL;
      setPreview({
        columns: result.columns,
        rows: typeof result.rows === "string" ? JSON.parse(result.rows) : result.rows,
      });
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave({ title, chartType, sql });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div
        className="bg-surface-2 border border-border rounded-2xl shadow-elevated w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-bold text-white">Edit Tile</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-surface-3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Tile Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-dark w-full"
              placeholder="e.g. Revenue by Region"
            />
          </div>

          {/* Chart Type */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Chart Type</label>
            <div className="flex flex-wrap gap-2">
              {CHART_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() => setChartType(ct.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    chartType === ct.value
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-surface-3 border-border text-muted hover:border-border-strong hover:text-white"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* SQL Query */}
          <div>
            <label className="block text-xs text-muted mb-1.5">SQL / OQL Query</label>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="input-dark w-full h-32 font-mono text-sm resize-y"
              placeholder="SELECT region, SUM(revenue) as total FROM sales GROUP BY region ORDER BY total DESC"
            />
          </div>

          {/* Preview */}
          <div>
            <button
              onClick={handlePreview}
              disabled={previewing || !sql.trim()}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-surface-3 text-white rounded-lg hover:bg-surface-4 transition-colors disabled:opacity-50"
            >
              {previewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              Preview Results
            </button>

            {previewError && (
              <div className="mt-2 p-2 bg-danger/10 border border-danger/20 rounded-lg">
                <p className="text-xs text-danger">{previewError}</p>
              </div>
            )}

            {preview && (
              <div className="mt-2 overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface-3">
                      {preview.columns.map((col) => (
                        <th key={col} className="text-left py-2 px-3 text-muted font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {preview.columns.map((col) => (
                          <td key={col} className="py-1.5 px-3 text-white font-mono">{String(row[col] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 10 && (
                  <p className="text-[10px] text-surface-6 py-1 text-center">Showing 10 of {preview.rows.length} rows</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            Remove Tile
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-muted bg-surface-3 rounded-lg hover:bg-surface-4 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
