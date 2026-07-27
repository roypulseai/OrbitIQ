"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@orbitiq/design-system";
import {
  LayoutDashboard,
  Database,
  Search,
  Box,
  Link2,
  Wrench,
  FileCode,
  Settings,
  Key,
  ChevronLeft,
  ChevronRight,
  Bell,
  Moon,
  Sun,
  Users,
  Clock,
  Code,
  Shield,
  FileText,
  ScrollText,
  Lock,
  ScanSearch,
  Sparkles,
  Brain,
  Waypoints,
  GitBranch,
  Languages,
  BookOpen,
  Bot,
  MessageSquare,
  MessageCircle,
  Cpu,
  TrendingUp,
  FlaskConical,
  Beaker,
  Network,
  Gauge,
  Rocket,
  Upload,
} from "lucide-react";
import { useTheme } from "next-themes";

const navigation = [
  {
    group: "Analytics",
    items: [
      { name: "Console", href: "/dashboard", icon: LayoutDashboard },
      { name: "Explore", href: "/dashboard/explore", icon: Search },
      { name: "Models", href: "/dashboard/models", icon: Box },
      { name: "Dashboards", href: "/dashboard/dashboards", icon: LayoutDashboard },
      { name: "Forecasting", href: "/dashboard/analytics/forecasting", icon: TrendingUp },
      { name: "Hypothesis Testing", href: "/dashboard/analytics/hypothesis-testing", icon: FlaskConical },
      { name: "Experiments", href: "/dashboard/analytics/experiments", icon: Beaker },
      { name: "ML Experiments", href: "/dashboard/analytics/ml", icon: Brain },
      { name: "Federated Query", href: "/dashboard/analytics/federation", icon: Network },
      { name: "Performance", href: "/dashboard/analytics/performance", icon: Gauge },
    ],
  },
  {
    group: "Data",
    items: [
      { name: "Connections", href: "/dashboard/connections", icon: Database },
      { name: "Ingestion", href: "/dashboard/ingestion", icon: Upload },
      { name: "Relationships", href: "/dashboard/relationships", icon: Link2 },
      { name: "Data Prep", href: "/dashboard/data-prep", icon: Wrench },
    ],
  },
  {
    group: "Developer",
    items: [
      { name: "OQL Playground", href: "/dashboard/oql", icon: FileCode },
    ],
  },
  {
    group: "Discovery",
    items: [
      { name: "Data Discovery", href: "/dashboard/discovery", icon: Sparkles },
      { name: "Knowledge Graph", href: "/dashboard/discovery/knowledge-graph", icon: Brain },
      { name: "Column Matching", href: "/dashboard/discovery/knowledge-graph/matches", icon: Waypoints },
      { name: "Relationship Canvas", href: "/dashboard/discovery/relationship-canvas", icon: GitBranch },
      { name: "Model Generation", href: "/dashboard/discovery/model-generation", icon: Box },
      { name: "Cross-Language", href: "/dashboard/discovery/cross-language", icon: Languages },
      { name: "Data Catalog", href: "/dashboard/discovery/catalog", icon: BookOpen },
    ],
  },
  {
    group: "Workspace",
    items: [
      { name: "Sharing", href: "/dashboard/sharing", icon: Users },
      { name: "Schedules", href: "/dashboard/schedules", icon: Clock },
      { name: "Caching", href: "/dashboard/caching", icon: Database },
      { name: "Embedding", href: "/dashboard/embedding", icon: Code },
    ],
  },
  {
    group: "AI",
    items: [
      { name: "Model Gateway", href: "/dashboard/ai/model-gateway", icon: Bot },
      { name: "Intent Parser", href: "/dashboard/ai/intent-parser", icon: MessageSquare },
      { name: "AI Agent", href: "/dashboard/ai/agent", icon: Cpu },
      { name: "Conversations", href: "/dashboard/ai/conversations", icon: MessageCircle },
    ],
  },
  {
    group: "Admin",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "API Keys", href: "/dashboard/settings/api-keys", icon: Key },
      { name: "GA Launch", href: "/dashboard/settings/ga-launch", icon: Rocket },
    ],
  },
  {
    group: "Security & Governance",
    items: [
      { name: "Row-Level Security", href: "/dashboard/security", icon: Shield },
      { name: "Column Security", href: "/dashboard/security/column-security", icon: Lock },
      { name: "PII Detection", href: "/dashboard/security/pii-scanning", icon: ScanSearch },
      { name: "User Attributes", href: "/dashboard/security/user-attributes", icon: Users },
      { name: "Compliance", href: "/dashboard/security/compliance", icon: Shield },
      { name: "Audit Trail", href: "/dashboard/security/compliance/audit-trail", icon: FileText },
      { name: "Audit Log", href: "/dashboard/security/audit", icon: ScrollText },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  const activeMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const group of navigation) {
      for (const item of group.items) {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        map.set(item.name, isActive);
      }
    }
    return map;
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-1">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-surface-2 border-r border-border transition-all duration-300 ease-in-out shrink-0",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
                OrbitIQ
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navigation.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <div className="px-3 py-1 text-[11px] font-semibold text-surface-6 uppercase tracking-wider">
                  {group.group}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeMap.get(item.name) ?? false;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                        collapsed
                          ? "justify-center px-2 py-2.5"
                          : "px-3 py-2",
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-muted hover:bg-surface-3 hover:text-white"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-accent" : ""
                        )}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border px-3 py-3 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors text-sm"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-surface-2/50 backdrop-blur-sm shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search dashboards, models, connections..."
                className="w-full bg-surface-3/50 border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm text-white placeholder-surface-6 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/30 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-6 bg-surface-4 px-1.5 py-0.5 rounded border border-border font-mono">
                /
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors"
              title="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button className="p-2 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-3 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                A
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-medium text-white leading-none">
                  Admin
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  admin@orbitiq.dev
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
