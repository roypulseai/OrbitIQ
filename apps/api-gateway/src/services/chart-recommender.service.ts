import { Injectable } from "@nestjs/common";

export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "scatter"
  | "pie"
  | "donut"
  | "heatmap"
  | "treemap"
  | "kpi"
  | "table";

interface ChartRecommendation {
  chartType: ChartType;
  confidence: number;
  reason: string;
}

interface DataProfile {
  columns: {
    name: string;
    dataType: string;
    cardinality?: number;
    isTime?: boolean;
    isNumeric?: boolean;
  }[];
  rowCount: number;
}

@Injectable()
export class ChartRecommenderService {
  recommend(dataProfile: DataProfile): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = [];

    const timeColumns = dataProfile.columns.filter((c) => c.isTime);
    const numericColumns = dataProfile.columns.filter((c) => c.isNumeric);
    const categoricalColumns = dataProfile.columns.filter(
      (c) => !c.isTime && !c.isNumeric
    );

    // Time series → Line chart
    if (timeColumns.length > 0 && numericColumns.length > 0) {
      recommendations.push({
        chartType: "line",
        confidence: 0.9,
        reason: "Time column detected with numeric values - line chart shows trends over time",
      });

      recommendations.push({
        chartType: "area",
        confidence: 0.7,
        reason: "Area chart for visualizing volume over time",
      });
    }

    // Categorical + Numeric → Bar chart
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      recommendations.push({
        chartType: "bar",
        confidence: 0.85,
        reason: "Categorical data with numeric values - bar chart compares categories",
      });
    }

    // Low cardinality categorical → Pie/Donut
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const lowCardinality = categoricalColumns.some(
        (c) => c.cardinality && c.cardinality <= 8
      );
      if (lowCardinality) {
        recommendations.push({
          chartType: "pie",
          confidence: 0.6,
          reason: "Low cardinality categories - pie chart shows composition",
        });

        recommendations.push({
          chartType: "donut",
          confidence: 0.65,
          reason: "Donut chart for modern composition visualization",
        });
      }
    }

    // Two numeric columns → Scatter
    if (numericColumns.length >= 2) {
      recommendations.push({
        chartType: "scatter",
        confidence: 0.75,
        reason: "Two numeric columns - scatter plot shows correlation",
      });
    }

    // Single KPI
    if (numericColumns.length === 1 && dataProfile.rowCount === 1) {
      recommendations.push({
        chartType: "kpi",
        confidence: 0.95,
        reason: "Single value - KPI card for at-a-glance metric",
      });
    }

    // Table fallback
    if (dataProfile.columns.length > 5 || dataProfile.rowCount > 100) {
      recommendations.push({
        chartType: "table",
        confidence: 0.5,
        reason: "Complex data structure - table for detailed view",
      });
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations;
  }

  getChartConfig(
    chartType: ChartType,
    dataProfile: DataProfile
  ): Record<string, unknown> {
    const timeColumns = dataProfile.columns.filter((c) => c.isTime);
    const numericColumns = dataProfile.columns.filter((c) => c.isNumeric);
    const categoricalColumns = dataProfile.columns.filter(
      (c) => !c.isTime && !c.isNumeric
    );

    switch (chartType) {
      case "bar":
        return {
          type: "bar",
          xField: categoricalColumns[0]?.name,
          yField: numericColumns[0]?.name,
          colorField: categoricalColumns[1]?.name,
        };

      case "line":
        return {
          type: "line",
          xField: timeColumns[0]?.name,
          yField: numericColumns[0]?.name,
          colorField: categoricalColumns[0]?.name,
        };

      case "area":
        return {
          type: "area",
          xField: timeColumns[0]?.name,
          yField: numericColumns[0]?.name,
          colorField: categoricalColumns[0]?.name,
        };

      case "scatter":
        return {
          type: "scatter",
          xField: numericColumns[0]?.name,
          yField: numericColumns[1]?.name,
          colorField: categoricalColumns[0]?.name,
        };

      case "pie":
      case "donut":
        return {
          type: chartType,
          xField: categoricalColumns[0]?.name,
          yField: numericColumns[0]?.name,
        };

      case "kpi":
        return {
          type: "kpi",
          valueField: numericColumns[0]?.name,
        };

      case "table":
        return {
          type: "table",
          columns: dataProfile.columns.map((c) => c.name),
        };

      default:
        return {
          type: "bar",
          xField: categoricalColumns[0]?.name,
          yField: numericColumns[0]?.name,
        };
    }
  }
}
