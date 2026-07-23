"use client";

import { useDashboardContext } from "@/contexts/DashboardContext";
import {
  Pencil,
  Save,
  X,
  Download,
  Filter,
  Share2,
  FileImage,
  FileText,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DashboardToolbarProps {
  dashboardName: string;
  dashboardDescription?: string;
  onExportPDF?: () => void;
  onExportImage?: () => void;
}

export function DashboardToolbar({
  dashboardName,
  dashboardDescription,
  onExportPDF,
  onExportImage,
}: DashboardToolbarProps) {
  const { isEditing, setEditing, filters, clearAllFilters } = useDashboardContext();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterInfo, setShowFilterInfo] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const activeFilterCount =
    Object.keys(filters.categories).length +
    Object.keys(filters.crossFilters).length +
    (filters.dateRange ? 1 : 0);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterInfo(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-2/50 backdrop-blur-sm">
      {/* Left: Title */}
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-white tracking-tight truncate">{dashboardName}</h1>
        {dashboardDescription && (
          <p className="text-xs text-muted truncate">{dashboardDescription}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {/* Active filters badge */}
        {activeFilterCount > 0 && (
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterInfo(!showFilterInfo)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
            >
              <Filter className="w-3 h-3" />
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </button>
            {showFilterInfo && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-surface-2 border border-border rounded-xl shadow-elevated z-50 p-3 animate-slide-down">
                <div className="text-xs text-muted mb-2">Active Filters</div>
                {filters.dateRange && (
                  <div className="text-xs text-white mb-1">
                    Date: {filters.dateRange.start} — {filters.dateRange.end}
                  </div>
                )}
                {Object.entries(filters.categories).map(([field, value]) => (
                  <div key={field} className="text-xs text-white mb-1">
                    {field}: {String(value)}
                  </div>
                ))}
                {Object.entries(filters.crossFilters).map(([tileId, cf]) => (
                  <div key={tileId} className="text-xs text-white mb-1">
                    Cross: {cf.field} = {String(cf.value)}
                  </div>
                ))}
                <button
                  onClick={() => { clearAllFilters(); setShowFilterInfo(false); }}
                  className="mt-2 text-xs text-danger hover:text-red-400 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Export */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-2 border border-border rounded-xl shadow-elevated z-50 py-1 animate-slide-down">
              <button
                onClick={() => { onExportPDF?.(); setShowExportMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-surface-3 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-muted" />
                Export as PDF
              </button>
              <button
                onClick={() => { onExportImage?.(); setShowExportMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-surface-3 transition-colors"
              >
                <FileImage className="w-3.5 h-3.5 text-muted" />
                Export as PNG
              </button>
            </div>
          )}
        </div>

        {/* Share */}
        <button className="p-2 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors" title="Share">
          <Share2 className="w-4 h-4" />
        </button>

        {/* Edit / Save */}
        {isEditing ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-1.5 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-3 text-white rounded-lg hover:bg-surface-4 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
