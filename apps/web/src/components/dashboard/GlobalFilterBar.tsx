"use client";

import { useState } from "react";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { Calendar, X, ChevronDown } from "lucide-react";

interface FilterConfig {
  field: string;
  label: string;
  type: "date" | "select";
  options?: string[];
}

const DEMO_FILTERS: FilterConfig[] = [
  { field: "date_range", label: "Date Range", type: "date" },
  { field: "region", label: "Region", type: "select", options: ["All Regions", "North America", "Europe", "Asia Pacific", "Latin America"] },
  { field: "segment", label: "Segment", type: "select", options: ["All Segments", "Enterprise", "Mid-Market", "SMB"] },
];

export function GlobalFilterBar() {
  const { filters, setDateRange, setCategoryFilter, clearCategoryFilter, clearAllFilters } = useDashboardContext();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStart, setTempStart] = useState(filters.dateRange?.start || "");
  const [tempEnd, setTempEnd] = useState(filters.dateRange?.end || "");

  const activeCount =
    Object.keys(filters.categories).length + (filters.dateRange ? 1 : 0);

  const handleDateApply = () => {
    if (tempStart && tempEnd) {
      setDateRange({ start: tempStart, end: tempEnd });
    }
    setShowDatePicker(false);
  };

  const presets = [
    { label: "Last 7 days", start: "2025-07-16", end: "2025-07-23" },
    { label: "Last 30 days", start: "2025-06-23", end: "2025-07-23" },
    { label: "Last 90 days", start: "2025-04-24", end: "2025-07-23" },
    { label: "This year", start: "2025-01-01", end: "2025-12-31" },
  ];

  return (
    <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-surface-1/50">
      <span className="text-[11px] text-muted uppercase tracking-wider font-medium shrink-0">Filters</span>

      {/* Date Range */}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            filters.dateRange
              ? "border-accent/30 bg-accent/5 text-accent"
              : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-white"
          }`}
        >
          <Calendar className="w-3 h-3" />
          {filters.dateRange
            ? `${filters.dateRange.start} — ${filters.dateRange.end}`
            : "Date Range"}
          <ChevronDown className="w-3 h-3" />
        </button>

        {showDatePicker && (
          <div className="absolute left-0 top-full mt-1 w-72 bg-surface-2 border border-border rounded-xl shadow-elevated z-50 p-4 animate-slide-down">
            <div className="text-xs font-medium text-white mb-3">Select Date Range</div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setTempStart(p.start); setTempEnd(p.end); }}
                  className="px-2 py-1 text-[10px] text-muted bg-surface-3 rounded-md hover:text-white transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-[10px] text-muted mb-1">Start</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="input-dark text-xs py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted mb-1">End</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="input-dark text-xs py-1.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDateRange(undefined); setShowDatePicker(false); }}
                className="px-3 py-1.5 text-xs text-muted hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleDateApply}
                className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filters */}
      {DEMO_FILTERS.filter((f) => f.type === "select").map((filter) => (
        <div key={filter.field} className="relative">
          <select
            value={filters.categories[filter.field] || ""}
            onChange={(e) =>
              e.target.value
                ? setCategoryFilter(filter.field, e.target.value)
                : clearCategoryFilter(filter.field)
            }
            className={`text-xs px-3 py-1.5 pr-7 rounded-lg border transition-colors appearance-none bg-surface-2 focus:outline-none ${
              filters.categories[filter.field]
                ? "border-accent/30 bg-accent/5 text-accent"
                : "border-border text-muted hover:border-border-strong hover:text-white"
            }`}
          >
            <option value="">{filter.label}</option>
            {filter.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
        </div>
      ))}

      {/* Clear all */}
      {activeCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-danger hover:text-red-400 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear all
        </button>
      )}
    </div>
  );
}
