"use client";

import { useState } from "react";
import { Chart } from "@/components/charts/Chart";

interface Tile {
  id: string;
  type: string;
  title: string;
  data: Record<string, unknown>[];
  chartType: "bar" | "line" | "area" | "scatter" | "pie";
  xField: string;
  yField: string;
}

const DEMO_TILES: Tile[] = [
  {
    id: "1",
    type: "bar",
    title: "Revenue by Region",
    chartType: "bar",
    xField: "region",
    yField: "revenue",
    data: [
      { region: "North America", revenue: 1250000 },
      { region: "Europe", revenue: 980000 },
      { region: "Asia Pacific", revenue: 750000 },
      { region: "Latin America", revenue: 420000 },
    ],
  },
  {
    id: "2",
    type: "line",
    title: "Revenue Trend (Last 12 Months)",
    chartType: "line",
    xField: "month",
    yField: "revenue",
    data: [
      { month: "2025-01-01", revenue: 180000 },
      { month: "2025-02-01", revenue: 195000 },
      { month: "2025-03-01", revenue: 210000 },
      { month: "2025-04-01", revenue: 225000 },
      { month: "2025-05-01", revenue: 240000 },
      { month: "2025-06-01", revenue: 255000 },
      { month: "2025-07-01", revenue: 270000 },
      { month: "2025-08-01", revenue: 260000 },
      { month: "2025-09-01", revenue: 285000 },
      { month: "2025-10-01", revenue: 300000 },
      { month: "2025-11-01", revenue: 315000 },
      { month: "2025-12-01", revenue: 340000 },
    ],
  },
  {
    id: "3",
    type: "bar",
    title: "Customers by Segment",
    chartType: "bar",
    xField: "segment",
    yField: "count",
    data: [
      { segment: "Enterprise", count: 120 },
      { segment: "Mid-Market", count: 340 },
      { segment: "SMB", count: 890 },
    ],
  },
  {
    id: "4",
    type: "line",
    title: "Monthly Active Users",
    chartType: "line",
    xField: "month",
    yField: "users",
    data: [
      { month: "2025-01-01", users: 4200 },
      { month: "2025-02-01", users: 4500 },
      { month: "2025-03-01", users: 4800 },
      { month: "2025-04-01", users: 5100 },
      { month: "2025-05-01", users: 5400 },
      { month: "2025-06-01", users: 5800 },
    ],
  },
];

export default function DashboardDetailPage() {
  const [tiles] = useState<Tile[]>(DEMO_TILES);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sales Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Key sales metrics and trends
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
              Edit
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
              Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <h3 className="font-medium text-gray-900 mb-4">{tile.title}</h3>
              <Chart
                data={tile.data}
                chartType={tile.chartType}
                xField={tile.xField}
                yField={tile.yField}
                width={500}
                height={280}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
