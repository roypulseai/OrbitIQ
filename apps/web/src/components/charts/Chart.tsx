"use client";

import { useEffect, useRef } from "react";
import embed from "vega-embed";
import { VisualizationSpec } from "vega-embed";

export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "scatter"
  | "pie"
  | "donut"
  | "heatmap"
  | "treemap";

interface ChartProps {
  data: Record<string, unknown>[];
  chartType: ChartType;
  xField?: string;
  yField?: string;
  colorField?: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  onBarClick?: (field: string, value: unknown) => void;
}

export function Chart({
  data,
  chartType,
  xField,
  yField,
  colorField,
  title,
  width = 400,
  height = 300,
  className,
  onBarClick,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const spec = buildVegaLiteSpec({
      data,
      chartType,
      xField,
      yField,
      colorField,
      title,
      width: width - 16,
      height: height - 16,
    });

    const embedChart = async () => {
      try {
        const result = await embed(containerRef.current!, spec as VisualizationSpec, {
          actions: false,
          renderer: "svg",
        });

        if (onBarClick && xField) {
          result.view.addEventListener("click", (_event: any, item: any) => {
            if (item && item.datum && item.datum[xField] !== undefined) {
              onBarClick(xField, item.datum[xField]);
            }
          });
        }
      } catch (error) {
        console.error("Failed to render chart:", error);
      }
    };

    embedChart();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [data, chartType, xField, yField, colorField, title, width, height, onBarClick]);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-3 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-muted text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-lg ${className || ""}`}
      style={{ width: width - 16, height: height - 16 }}
    />
  );
}

interface VegaLiteSpecConfig {
  data: Record<string, unknown>[];
  chartType: ChartType;
  xField?: string;
  yField?: string;
  colorField?: string;
  title?: string;
  width: number;
  height: number;
}

function buildVegaLiteSpec(config: VegaLiteSpecConfig) {
  const { data, chartType, xField, yField, colorField, title, width, height } = config;

  const darkConfig = {
    view: { stroke: "transparent" },
    background: "transparent",
    axis: {
      grid: true,
      gridColor: "#222225",
      domainColor: "#333336",
      tickColor: "#333336",
      labelColor: "#888",
      titleColor: "#aaa",
      labelFont: "system-ui, sans-serif",
      titleFont: "system-ui, sans-serif",
      labelFontSize: 10,
      titleFontSize: 11,
    },
    legend: {
      labelColor: "#aaa",
      titleColor: "#ccc",
      labelFont: "system-ui, sans-serif",
      titleFont: "system-ui, sans-serif",
    },
    title: { color: "#fff", font: "system-ui, sans-serif" },
    mark: { color: "#6366f1" },
  };

  const palette = ["#6366f1", "#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  const baseSpec: Record<string, unknown> = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width,
    height,
    title,
    data: { values: data },
    config: darkConfig,
  };

  const colorEncoding = colorField
    ? { field: colorField, type: "nominal", scale: { scheme: "category10" } }
    : { value: "#6366f1" };

  switch (chartType) {
    case "bar":
      return {
        ...baseSpec,
        mark: { type: "bar", cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4, cursor: "pointer" },
        encoding: {
          x: xField
            ? { field: xField, type: "nominal", axis: { labelAngle: -45 } }
            : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorEncoding,
          opacity: { value: 0.85 },
          tooltip: [
            ...(xField ? [{ field: xField, type: "nominal" }] : []),
            ...(yField ? [{ field: yField, type: "quantitative", format: ",.0f" }] : []),
          ],
        },
        selection: {
          highlight: { type: "single", on: "pointerover", empty: "none" },
        },
      };

    case "line":
      return {
        ...baseSpec,
        mark: { type: "line", strokeWidth: 2.5, point: true, pointSize: 40 },
        encoding: {
          x: xField
            ? { field: xField, type: "temporal", axis: { format: "%b %d" } }
            : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorEncoding,
          tooltip: [
            ...(xField ? [{ field: xField, type: "temporal" }] : []),
            ...(yField ? [{ field: yField, type: "quantitative", format: ",.0f" }] : []),
          ],
        },
      };

    case "area":
      return {
        ...baseSpec,
        mark: { type: "area", opacity: 0.3, line: true, strokeWidth: 2 },
        encoding: {
          x: xField
            ? { field: xField, type: "temporal", axis: { format: "%b %d" } }
            : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorEncoding,
          tooltip: [
            ...(xField ? [{ field: xField, type: "temporal" }] : []),
            ...(yField ? [{ field: yField, type: "quantitative", format: ",.0f" }] : []),
          ],
        },
      };

    case "scatter":
      return {
        ...baseSpec,
        mark: { type: "circle", opacity: 0.7, cursor: "pointer" },
        encoding: {
          x: xField ? { field: xField, type: "quantitative" } : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorEncoding,
          size: { value: 120 },
          tooltip: [
            ...(xField ? [{ field: xField, type: "quantitative" }] : []),
            ...(yField ? [{ field: yField, type: "quantitative" }] : []),
          ],
        },
      };

    case "pie":
      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 0, cursor: "pointer", stroke: "#111113", strokeWidth: 2 },
        encoding: {
          theta: yField ? { field: yField, type: "quantitative" } : undefined,
          color: xField
            ? { field: xField, type: "nominal", scale: { range: palette } }
            : { value: "#6366f1" },
          tooltip: [
            ...(xField ? [{ field: xField, type: "nominal" }] : []),
            ...(yField ? [{ field: yField, type: "quantitative", format: ",.0f" }] : []),
          ],
        },
      };

    case "donut":
      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 60, cursor: "pointer", stroke: "#111113", strokeWidth: 2 },
        encoding: {
          theta: yField ? { field: yField, type: "quantitative" } : undefined,
          color: xField
            ? { field: xField, type: "nominal", scale: { range: palette } }
            : { value: "#6366f1" },
          tooltip: [
            ...(xField ? [{ field: xField, type: "nominal" }] : []),
            ...(yField ? [{ field: yField, type: "quantitative", format: ",.0f" }] : []),
          ],
        },
      };

    default:
      return {
        ...baseSpec,
        mark: { type: "bar" },
        encoding: {
          x: xField ? { field: xField, type: "nominal" } : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
        },
      };
  }
}
