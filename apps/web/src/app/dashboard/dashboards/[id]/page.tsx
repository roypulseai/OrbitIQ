"use client";

import { useState, useRef, useCallback } from "react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { GlobalFilterBar } from "@/components/dashboard/GlobalFilterBar";
import { DashboardCanvas, TileData } from "@/components/dashboard/DashboardCanvas";
import { DrillDownPanel } from "@/components/dashboard/DrillDownPanel";

const DEMO_TILES: TileData[] = [
  {
    id: "kpi-1",
    title: "Total Revenue",
    chartType: "kpi",
    data: [],
    kpiValue: "$3.4M",
    kpiLabel: "Total Revenue (YTD)",
    kpiTrend: 12.5,
    position: { i: "kpi-1", x: 0, y: 0, w: 3, h: 3 },
  },
  {
    id: "kpi-2",
    title: "Active Customers",
    chartType: "kpi",
    data: [],
    kpiValue: "1,350",
    kpiLabel: "Active Customers",
    kpiTrend: 8.2,
    position: { i: "kpi-2", x: 3, y: 0, w: 3, h: 3 },
  },
  {
    id: "kpi-3",
    title: "Avg Order Value",
    chartType: "kpi",
    data: [],
    kpiValue: "$248",
    kpiLabel: "Avg Order Value",
    kpiTrend: -2.1,
    position: { i: "kpi-3", x: 6, y: 0, w: 3, h: 3 },
  },
  {
    id: "kpi-4",
    title: "Conversion Rate",
    chartType: "kpi",
    data: [],
    kpiValue: "3.2%",
    kpiLabel: "Conversion Rate",
    kpiTrend: 0.4,
    position: { i: "kpi-4", x: 9, y: 0, w: 3, h: 3 },
  },
  {
    id: "bar-1",
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
    position: { i: "bar-1", x: 0, y: 3, w: 6, h: 8 },
  },
  {
    id: "line-1",
    title: "Revenue Trend (12 Months)",
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
    position: { i: "line-1", x: 6, y: 3, w: 6, h: 8 },
  },
  {
    id: "pie-1",
    title: "Revenue by Segment",
    chartType: "donut",
    xField: "segment",
    yField: "revenue",
    data: [
      { segment: "Enterprise", revenue: 1450000 },
      { segment: "Mid-Market", revenue: 1120000 },
      { segment: "SMB", revenue: 830000 },
    ],
    position: { i: "pie-1", x: 0, y: 11, w: 4, h: 8 },
  },
  {
    id: "bar-2",
    title: "Customers by Segment",
    chartType: "bar",
    xField: "segment",
    yField: "count",
    colorField: "segment",
    data: [
      { segment: "Enterprise", count: 120 },
      { segment: "Mid-Market", count: 340 },
      { segment: "SMB", count: 890 },
    ],
    position: { i: "bar-2", x: 4, y: 11, w: 4, h: 8 },
  },
  {
    id: "area-1",
    title: "Monthly Active Users",
    chartType: "area",
    xField: "month",
    yField: "users",
    data: [
      { month: "2025-01-01", users: 4200 },
      { month: "2025-02-01", users: 4500 },
      { month: "2025-03-01", users: 4800 },
      { month: "2025-04-01", users: 5100 },
      { month: "2025-05-01", users: 5400 },
      { month: "2025-06-01", users: 5800 },
      { month: "2025-07-01", users: 6100 },
    ],
    position: { i: "area-1", x: 8, y: 11, w: 4, h: 8 },
  },
];

export default function DashboardDetailPage() {
  const [tiles] = useState<TileData[]>(DEMO_TILES);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const el = dashboardRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: "#0a0a0b", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const ratio = canvas.width / canvas.height;
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdfW / ratio;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save("dashboard.pdf");
    } catch (e) {
      console.error("PDF export failed:", e);
    }
  }, []);

  const handleExportImage = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = dashboardRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: "#0a0a0b", scale: 2 });
      const link = document.createElement("a");
      link.download = "dashboard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Image export failed:", e);
    }
  }, []);

  return (
    <DashboardProvider>
      <div className="flex flex-col h-full bg-surface-1">
        <DashboardToolbar
          dashboardName="Sales Overview"
          dashboardDescription="Key sales metrics and trends across all regions"
          onExportPDF={handleExportPDF}
          onExportImage={handleExportImage}
        />
        <GlobalFilterBar />
        <div ref={dashboardRef} className="flex-1 overflow-y-auto">
          <DashboardCanvas tiles={tiles} />
        </div>
        <DrillDownPanel />
      </div>
    </DashboardProvider>
  );
}
