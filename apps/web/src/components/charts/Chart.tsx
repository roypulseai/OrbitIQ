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
      width,
      height,
    });

    const embedChart = async () => {
      try {
        await embed(containerRef.current!, spec as VisualizationSpec, {
          actions: false,
          renderer: "svg",
        });
      } catch (error) {
        console.error("Failed to render chart:", error);
      }
    };

    embedChart();
  }, [data, chartType, xField, yField, colorField, title, width, height]);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-lg ${className}`}
      style={{ width, height }}
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
  const {
    data,
    chartType,
    xField,
    yField,
    colorField,
    title,
    width,
    height,
  } = config;

  const baseSpec: Record<string, unknown> = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width,
    height,
    title,
    data: { values: data },
    config: {
      view: { stroke: "transparent" },
      axis: { grid: true, gridColor: "#e5e7eb" },
    },
  };

  switch (chartType) {
    case "bar":
      return {
        ...baseSpec,
        mark: { type: "bar", cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4 },
        encoding: {
          x: xField
            ? { field: xField, type: "nominal", axis: { labelAngle: -45 } }
            : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorField
            ? { field: colorField, type: "nominal" }
            : { value: "#6366f1" },
        },
      };

    case "line":
      return {
        ...baseSpec,
        mark: { type: "line", strokeWidth: 2, point: true },
        encoding: {
          x: xField
            ? { field: xField, type: "temporal", axis: { format: "%b %d" } }
            : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorField
            ? { field: colorField, type: "nominal" }
            : { value: "#6366f1" },
        },
      };

    case "area":
      return {
        ...baseSpec,
        mark: { type: "area", opacity: 0.3, line: true },
        encoding: {
          x: xField
            ? { field: xField, type: "temporal", axis: { format: "%b %d" } }
            : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorField
            ? { field: colorField, type: "nominal" }
            : { value: "#6366f1" },
        },
      };

    case "scatter":
      return {
        ...baseSpec,
        mark: { type: "circle", opacity: 0.7 },
        encoding: {
          x: xField ? { field: xField, type: "quantitative" } : undefined,
          y: yField ? { field: yField, type: "quantitative" } : undefined,
          color: colorField
            ? { field: colorField, type: "nominal" }
            : { value: "#6366f1" },
          size: { value: 100 },
        },
      };

    case "pie":
      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 0 },
        encoding: {
          theta: yField ? { field: yField, type: "quantitative" } : undefined,
          color: xField
            ? { field: xField, type: "nominal" }
            : { value: "#6366f1" },
        },
      };

    case "donut":
      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 60 },
        encoding: {
          theta: yField ? { field: yField, type: "quantitative" } : undefined,
          color: xField
            ? { field: xField, type: "nominal" }
            : { value: "#6366f1" },
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
