"use client";

import { useDashboardContext } from "@/contexts/DashboardContext";
import { X, ArrowRight, Filter } from "lucide-react";

interface DrillDownData {
  dimension: string;
  values: { label: string; value: number; percent?: number }[];
}

const DEMO_DRILL_DOWN: Record<string, DrillDownData> = {
  "tile-1": {
    dimension: "region",
    values: [
      { label: "North America", value: 1250000, percent: 38.5 },
      { label: "Europe", value: 980000, percent: 30.2 },
      { label: "Asia Pacific", value: 750000, percent: 23.1 },
      { label: "Latin America", value: 420000, percent: 12.9 },
    ],
  },
  "tile-2": {
    dimension: "month",
    values: [
      { label: "Jan 2025", value: 180000 },
      { label: "Feb 2025", value: 195000 },
      { label: "Mar 2025", value: 210000 },
      { label: "Apr 2025", value: 225000 },
      { label: "May 2025", value: 240000 },
      { label: "Jun 2025", value: 255000 },
    ],
  },
};

export function DrillDownPanel() {
  const { selectedTileId, setSelectedTileId } = useDashboardContext();
  if (!selectedTileId) return null;

  const drillData = DEMO_DRILL_DOWN[selectedTileId] || DEMO_DRILL_DOWN["tile-1"];
  const maxValue = Math.max(...drillData.values.map((v) => v.value));

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 flex justify-end animate-fade-in"
      onClick={() => setSelectedTileId(null)}
    >
      <div
        className="w-full max-w-md h-full bg-surface-2 border-l border-border shadow-elevated flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">Drill Down</h2>
            <p className="text-[11px] text-muted mt-0.5">
              Dimension: <span className="text-accent">{drillData.dimension}</span>
            </p>
          </div>
          <button
            onClick={() => setSelectedTileId(null)}
            className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-surface-3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drill-down list */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-2">
            {drillData.values.map((item) => {
              const barWidth = (item.value / maxValue) * 100;
              return (
                <button
                  key={item.label}
                  className="w-full text-left p-3 bg-surface-3 rounded-lg hover:bg-surface-4 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-accent">
                        ${item.value >= 1000000 ? `${(item.value / 1000000).toFixed(2)}M` : `${(item.value / 1000).toFixed(0)}K`}
                      </span>
                      <ArrowRight className="w-3 h-3 text-surface-6 group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                  <div className="w-full bg-surface-1 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {item.percent !== undefined && (
                    <div className="text-[10px] text-muted mt-1">{item.percent}% of total</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <button
            onClick={() => setSelectedTileId(null)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter dashboard by selection
          </button>
        </div>
      </div>
    </div>
  );
}
