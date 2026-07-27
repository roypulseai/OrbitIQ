"use client";

import Link from "next/link";
import { KpiCard, Card } from "@orbitiq/design-system";
import {
  Database,
  Search,
  Box,
  ArrowUpRight,
  Zap,
  Users,
  Activity,
  Clock,
  ArrowRight,
} from "lucide-react";
import dynamic from "next/dynamic";

const AreaChartLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.AreaChart })),
  { ssr: false }
);
const AreaLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Area })),
  { ssr: false }
);
const BarChartLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  { ssr: false }
);
const BarLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);
const XAxisLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
);
const YAxisLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
);
const CartesianGridLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);
const TooltipLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);
const ResponsiveContainerLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);

const revenueData = [
  { month: "Jan", revenue: 4200, queries: 240 },
  { month: "Feb", revenue: 4800, queries: 310 },
  { month: "Mar", revenue: 5100, queries: 280 },
  { month: "Apr", revenue: 5800, queries: 350 },
  { month: "May", revenue: 6200, queries: 420 },
  { month: "Jun", revenue: 7100, queries: 380 },
  { month: "Jul", revenue: 7800, queries: 450 },
  { month: "Aug", revenue: 8400, queries: 520 },
  { month: "Sep", revenue: 9200, queries: 480 },
  { month: "Oct", revenue: 9800, queries: 560 },
  { month: "Nov", revenue: 10500, queries: 620 },
  { month: "Dec", revenue: 11200, queries: 680 },
];

const topModels = [
  { name: "Sales Analytics", queries: 1247, status: "active" },
  { name: "Customer 360", queries: 892, status: "active" },
  { name: "Marketing Funnel", queries: 634, status: "active" },
  { name: "Product Metrics", queries: 421, status: "draft" },
];

const recentActivity = [
  { user: "Sarah K.", action: "ran a query on Sales Analytics", time: "2 min ago", type: "query" },
  { user: "Mike R.", action: "created dashboard Revenue Overview", time: "15 min ago", type: "dashboard" },
  { user: "Admin", action: "connected Snowflake warehouse", time: "1 hour ago", type: "connection" },
  { user: "Lisa M.", action: "updated model Customer 360", time: "3 hours ago", type: "model" },
  { user: "Tom B.", action: "exported Q4 revenue report", time: "5 hours ago", type: "export" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-3 border border-border-strong rounded-lg px-3 py-2 shadow-elevated">
        <p className="text-xs text-muted mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium text-white">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <div className="page-content space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Queries"
          value="12,847"
          change={12.5}
          changeLabel="vs last month"
          icon={<Search className="w-4 h-4" />}
        />
        <KpiCard
          title="Active Models"
          value="24"
          change={8.3}
          changeLabel="vs last month"
          icon={<Box className="w-4 h-4" />}
        />
        <KpiCard
          title="Connections"
          value="8"
          change={0}
          changeLabel="no change"
          icon={<Database className="w-4 h-4" />}
        />
        <KpiCard
          title="Active Users"
          value="156"
          change={23.1}
          changeLabel="vs last month"
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart - Takes 2 columns */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Query Volume</h3>
              <p className="text-xs text-muted mt-0.5">Queries per month over the last year</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Queries
              </span>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainerLazy width="100%" height="100%">
              <AreaChartLazy data={revenueData}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGridLazy strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxisLazy
                  dataKey="month"
                  tick={{ fill: "#88888d", fontSize: 11 }}
                  axisLine={{ stroke: "#1f1f23" }}
                  tickLine={false}
                />
                <YAxisLazy
                  tick={{ fill: "#88888d", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <TooltipLazy content={<CustomTooltip />} />
                <AreaLazy
                  type="monotone"
                  dataKey="queries"
                  name="Queries"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorQueries)"
                />
              </AreaChartLazy>
            </ResponsiveContainerLazy>
          </div>
        </Card>

        {/* Top Models */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Models</h3>
            <Link
              href="/dashboard/models"
              className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topModels.map((model, i) => (
              <div
                key={model.name}
                className="flex items-center gap-3 group"
              >
                <span className="text-xs text-surface-6 font-mono w-4">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate group-hover:text-accent transition-colors">
                    {model.name}
                  </div>
                  <div className="text-xs text-muted">
                    {model.queries.toLocaleString()} queries
                  </div>
                </div>
                <span
                  className={
                    model.status === "active" ? "badge-success" : "badge-warning"
                  }
                >
                  {model.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <Card className="lg:col-span-1 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Queries by Source
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainerLazy width="100%" height="100%">
              <BarChartLazy
                data={[
                  { source: "PostgreSQL", count: 4200 },
                  { source: "Snowflake", count: 3100 },
                  { source: "BigQuery", count: 2800 },
                  { source: "MySQL", count: 1900 },
                ]}
              >
                <CartesianGridLazy strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxisLazy
                  dataKey="source"
                  tick={{ fill: "#88888d", fontSize: 10 }}
                  axisLine={{ stroke: "#1f1f23" }}
                  tickLine={false}
                />
                <YAxisLazy
                  tick={{ fill: "#88888d", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <TooltipLazy content={<CustomTooltip />} />
                <BarLazy
                  dataKey="count"
                  name="Queries"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChartLazy>
            </ResponsiveContainerLazy>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            <span className="text-xs text-muted flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Live
            </span>
          </div>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-surface-4 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-muted">
                    {item.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-medium">{item.user}</span>{" "}
                    <span className="text-muted">{item.action}</span>
                  </p>
                </div>
                <span className="text-xs text-surface-6 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "New Connection", href: "/dashboard/connections", icon: Database, desc: "Connect to a data source" },
            { label: "Explore Data", href: "/dashboard/explore", icon: Search, desc: "Ask a question in natural language" },
            { label: "Create Model", href: "/dashboard/models", icon: Box, desc: "Define metrics and dimensions" },
            { label: "OQL Playground", href: "/dashboard/oql", icon: Zap, desc: "Write and compile queries" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-3/50 border border-border hover:border-accent/30 hover:bg-accent/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-4 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <action.icon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              </div>
              <div>
                <div className="text-sm font-medium text-white group-hover:text-accent transition-colors flex items-center gap-1">
                  {action.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-muted">{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
