"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Responsive } from "react-grid-layout";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { DashboardTile } from "./DashboardTile";
import "react-grid-layout/css/styles.css";

export interface TileData {
  id: string;
  title: string;
  chartType: "bar" | "line" | "area" | "scatter" | "pie" | "donut" | "kpi" | "table";
  data: Record<string, unknown>[];
  xField?: string;
  yField?: string;
  colorField?: string;
  position: { i: string; x: number; y: number; w: number; h: number };
  kpiValue?: string;
  kpiLabel?: string;
  kpiTrend?: number;
}

const RESPONSIVE_COLS = { lg: 12, md: 10, sm: 6, xs: 4 };

interface DashboardCanvasProps {
  tiles: TileData[];
  onLayoutChange?: (layout: ReactGridLayout.Layout[]) => void;
}

export function DashboardCanvas({ tiles, onLayoutChange }: DashboardCanvasProps) {
  const { isEditing } = useDashboardContext();
  const [layout, setLayout] = useState<ReactGridLayout.Layout[]>(
    tiles.map((t) => t.position)
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleLayoutChange = useCallback(
    (currentLayout: readonly ReactGridLayout.Layout[]) => {
      setLayout([...currentLayout]);
      onLayoutChange?.([...currentLayout]);
    },
    [onLayoutChange]
  );

  const layoutMap = new Map(layout.map((l) => [l.i, l]));

  return (
    <div ref={containerRef} className="p-4">
      {containerWidth > 0 && (
        <Responsive
          className="layout"
          width={containerWidth}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
          cols={RESPONSIVE_COLS}
          rowHeight={40}
          draggableHandle=".tile-drag-handle"
          margin={[12, 12]}
          useCSSTransforms
          layouts={{ lg: layout, md: layout, sm: layout, xs: layout }}
          {...({ isDraggable: isEditing, isResizable: isEditing, onLayoutChange: handleLayoutChange } as any)}
        >
          {tiles.map((tile) => {
            const l = layoutMap.get(tile.id);
            return (
              <div key={tile.id} className="grid-tile">
                <DashboardTile
                  tile={tile}
                  isEditing={isEditing}
                  width={l ? l.w * 100 : undefined}
                  height={l ? l.h * 40 : undefined}
                />
              </div>
            );
          })}
        </Responsive>
      )}

      <style jsx global>{`
        .grid-tile {
          transition: box-shadow 200ms ease;
        }
        .react-grid-item {
          transition: all 200ms ease;
        }
        .react-grid-item.react-draggable-dragging {
          z-index: 100;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          opacity: 0.95;
        }
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          cursor: se-resize;
        }
        .react-grid-item > .react-resizable-handle::after {
          content: "";
          position: absolute;
          right: 4px;
          bottom: 4px;
          width: 8px;
          height: 8px;
          border-right: 2px solid rgba(99, 102, 241, 0.4);
          border-bottom: 2px solid rgba(99, 102, 241, 0.4);
        }
        .react-grid-placeholder {
          background: rgba(99, 102, 241, 0.1) !important;
          border: 2px dashed rgba(99, 102, 241, 0.3) !important;
          border-radius: 12px !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
