"use client";

import { useState } from "react";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { Chart, ChartType } from "@/components/charts/Chart";
import { GripVertical, MoreHorizontal, Expand, X } from "lucide-react";

interface TileProps {
  tile: {
    id: string;
    title: string;
    chartType: string;
    data: Record<string, unknown>[];
    xField?: string;
    yField?: string;
    colorField?: string;
    kpiValue?: string;
    kpiLabel?: string;
    kpiTrend?: number;
  };
  isEditing: boolean;
  width?: number;
  height?: number;
}

export function DashboardTile({ tile, isEditing }: TileProps) {
  const { setCrossFilter, clearCrossFilter, filters, setSelectedTileId } = useDashboardContext();
  const [showMenu, setShowMenu] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const crossFilter = filters.crossFilters[tile.id];
  const isFiltered = !!crossFilter;

  const handleChartClick = (field: string, value: unknown) => {
    if (isEditing) return;
    if (crossFilter && crossFilter.field === field && crossFilter.value === value) {
      clearCrossFilter(tile.id);
    } else {
      setCrossFilter(tile.id, field, value);
    }
  };

  const renderContent = () => {
    if (tile.chartType === "kpi") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="text-3xl font-bold text-white">{tile.kpiValue}</div>
          <div className="text-xs text-muted mt-1">{tile.kpiLabel}</div>
          {tile.kpiTrend !== undefined && (
            <div className={`text-xs mt-2 font-medium ${tile.kpiTrend >= 0 ? "text-success" : "text-danger"}`}>
              {tile.kpiTrend >= 0 ? "+" : ""}{tile.kpiTrend}%
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Chart
          data={tile.data}
          chartType={tile.chartType as ChartType}
          xField={tile.xField}
          yField={tile.yField}
          colorField={tile.colorField}
          width={isMaximized ? 800 : 500}
          height={isMaximized ? 400 : 250}
          onBarClick={handleChartClick}
          className="dark-chart"
        />
      </div>
    );
  };

  const tileContent = (
    <div
      className={`h-full flex flex-col bg-surface-2 border rounded-xl overflow-hidden transition-all group ${
        isFiltered
          ? "border-accent/40 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
          : "border-border hover:border-border-strong"
      } ${isEditing ? "ring-1 ring-accent/10" : ""}`}
      onClick={() => {
        if (!isEditing && tile.chartType !== "kpi") {
          setSelectedTileId(tile.id);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isEditing && (
            <div className="tile-drag-handle cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-surface-6 hover:text-white transition-colors">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          <h3 className="text-xs font-semibold text-white truncate">{tile.title}</h3>
          {isFiltered && (
            <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-full shrink-0">
              Filtered
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMaximized(true); }}
            className="p-1 text-surface-6 hover:text-white transition-colors"
            title="Expand"
          >
            <Expand className="w-3 h-3" />
          </button>
          {isEditing && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 text-surface-6 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-surface-3 border border-border rounded-lg shadow-elevated z-50 py-1">
                  <button className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-surface-4 transition-colors">Edit tile</button>
                  <button className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-surface-4 transition-colors">Duplicate</button>
                  <button className="w-full text-left px-3 py-1.5 text-xs text-danger hover:bg-surface-4 transition-colors">Remove</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-2">
        {renderContent()}
      </div>
    </div>
  );

  if (isMaximized) {
    return (
      <>
        {tileContent}
        {/* Maximized overlay */}
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 animate-fade-in"
          onClick={() => setIsMaximized(false)}
        >
          <div
            className="bg-surface-2 border border-border rounded-2xl shadow-elevated max-w-5xl w-full max-h-[90vh] overflow-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-white">{tile.title}</h3>
              <button
                onClick={() => setIsMaximized(false)}
                className="p-1.5 text-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <Chart
                data={tile.data}
                chartType={tile.chartType as ChartType}
                xField={tile.xField}
                yField={tile.yField}
                colorField={tile.colorField}
                width={800}
                height={450}
                className="dark-chart"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return tileContent;
}
