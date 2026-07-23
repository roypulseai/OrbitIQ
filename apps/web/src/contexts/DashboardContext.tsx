"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface FilterState {
  dateRange?: { start: string; end: string };
  categories: Record<string, string>;
  crossFilters: Record<string, { field: string; value: unknown }>;
}

interface DashboardContextValue {
  filters: FilterState;
  setDateRange: (range: { start: string; end: string } | undefined) => void;
  setCategoryFilter: (field: string, value: string) => void;
  clearCategoryFilter: (field: string) => void;
  setCrossFilter: (sourceTileId: string, field: string, value: unknown) => void;
  clearCrossFilter: (sourceTileId: string) => void;
  clearAllFilters: () => void;
  isEditing: boolean;
  setEditing: (v: boolean) => void;
  selectedTileId: string | null;
  setSelectedTileId: (id: string | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardContext must be used within DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    categories: {},
    crossFilters: {},
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  const setDateRange = useCallback((range: { start: string; end: string } | undefined) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  }, []);

  const setCategoryFilter = useCallback((field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: { ...prev.categories, [field]: value },
    }));
  }, []);

  const clearCategoryFilter = useCallback((field: string) => {
    setFilters((prev) => {
      const next = { ...prev.categories };
      delete next[field];
      return { ...prev, categories: next };
    });
  }, []);

  const setCrossFilter = useCallback((sourceTileId: string, field: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      crossFilters: {
        ...prev.crossFilters,
        [sourceTileId]: { field, value },
      },
    }));
  }, []);

  const clearCrossFilter = useCallback((sourceTileId: string) => {
    setFilters((prev) => {
      const next = { ...prev.crossFilters };
      delete next[sourceTileId];
      return { ...prev, crossFilters: next };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ categories: {}, crossFilters: {} });
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        filters,
        setDateRange,
        setCategoryFilter,
        clearCategoryFilter,
        setCrossFilter,
        clearCrossFilter,
        clearAllFilters,
        isEditing,
        setEditing: setIsEditing,
        selectedTileId,
        setSelectedTileId,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
