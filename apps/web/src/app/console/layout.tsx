"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { cn } from "@orbitiq/design-system";
import { signOut } from "next-auth/react";
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
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";

const navigation = [
  {
    group: "Analytics",
    items: [
      { name: "Console", href: "/console", icon: LayoutDashboard },
      { name: "Explore", href: "/console/explore", icon: Search },
      { name: "Models", href: "/console/models", icon: Box },
      { name: "Dashboards", href: "/console/consoles", icon: LayoutDashboard },
      { name: "Forecasting", href: "/console/analytics/forecasting", icon: TrendingUp },
      { name: "Hypothesis Testing", href: "/console/analytics/hypothesis-testing", icon: FlaskConical },
      { name: "Experiments", href: "/console/analytics/experiments", icon: Beaker },
      { name: "ML Experiments", href: "/console/analytics/ml", icon: Brain },
      { name: "Federated Query", href: "/console/analytics/federation", icon: Network },
      { name: "Performance", href: "/console/analytics/performance", icon: Gauge },
    ],
  },
  {
    group: "Data",
    items: [
      { name: "Connections", href: "/console/connections", icon: Database },
      { name: "Ingestion", href: "/console/ingestion", icon: Upload },
      { name: "Relationships", href: "/console/relationships", icon: Link2 },
      { name: "Data Prep", href: "/console/data-prep", icon: Wrench },
    ],
  },
  {
    group: "Developer",
    items: [
      { name: "OQL Playground", href: "/console/oql", icon: FileCode },
    ],
  },
  {
    group: "Discovery",
    items: [
      { name: "Data Discovery", href: "/console/discovery", icon: Sparkles },
      { name: "Knowledge Graph", href: "/console/discovery/knowledge-graph", icon: Brain },
      { name: "Column Matching", href: "/console/discovery/knowledge-graph/matches", icon: Waypoints },
      { name: "Relationship Canvas", href: "/console/discovery/relationship-canvas", icon: GitBranch },
      { name: "Model Generation", href: "/console/discovery/model-generation", icon: Box },
      { name: "Cross-Language", href: "/console/discovery/cross-language", icon: Languages },
      { name: "Data Catalog", href: "/console/discovery/catalog", icon: BookOpen },
    ],
  },
  {
    group: "Workspace",
    items: [
      { name: "Sharing", href: "/console/sharing", icon: Users },
      { name: "Schedules", href: "/console/schedules", icon: Clock },
      { name: "Caching", href: "/console/caching", icon: Database },
      { name: "Embedding", href: "/console/embedding", icon: Code },
    ],
  },
  {
    group: "AI",
    items: [
      { name: "Model Gateway", href: "/console/ai/model-gateway", icon: Bot },
      { name: "Intent Parser", href: "/console/ai/intent-parser", icon: MessageSquare },
      { name: "AI Agent", href: "/console/ai/agent", icon: Cpu },
      { name: "Conversations", href: "/console/ai/conversations", icon: MessageCircle },
    ],
  },
  {
    group: "Admin",
    items: [
      { name: "Settings", href: "/console/settings", icon: Settings },
      { name: "API Keys", href: "/console/settings/api-keys", icon: Key },
      { name: "GA Launch", href: "/console/settings/ga-launch", icon: Rocket },
    ],
  },
  {
    group: "Security & Governance",
    items: [
      { name: "Row-Level Security", href: "/console/security", icon: Shield },
      { name: "Column Security", href: "/console/security/column-security", icon: Lock },
      { name: "PII Detection", href: "/console/security/pii-scanning", icon: ScanSearch },
      { name: "User Attributes", href: "/console/security/user-attributes", icon: Users },
      { name: "Compliance", href: "/console/security/compliance", icon: Shield },
      { name: "Audit Trail", href: "/console/security/compliance/audit-trail", icon: FileText },
      { name: "Audit Log", href: "/console/security/audit", icon: ScrollText },
    ],
  },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const mockNotifications = [
  { id: "1", title: "Dashboard shared with you", message: "Admin shared \"Sales Overview\" with your team", time: "2 min ago", read: false },
  { id: "2", title: "Ingestion complete", message: "orders.csv processed — 1.2M rows ingested", time: "15 min ago", read: false },
  { id: "3", title: "RLS policy updated", message: "Region filter applied to revenue table", time: "1 hour ago", read: true },
  { id: "4", title: "Scheduled refresh", message: "Executive Summary dashboard refreshed", time: "3 hours ago", read: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  useEffect(() => { setMounted(true); }, []);

  const activeMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const group of navigation) {
      for (const item of group.items) {
        const isActive =
          item.href === "/console"
            ? pathname === "/console"
            : pathname.startsWith(item.href);
        map.set(item.name, isActive);
      }
    }
    return map;
  }, [pathname]);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleThemeToggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

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
          <Link href="/console" className="flex items-center gap-2.5 overflow-hidden">
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
              <>
                <ChevronRight className="w-4 h-4" />
              </>
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
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg text-muted hover:bg-surface-3 hover:text-white transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-2 border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <span className="text-xs text-accent cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mockNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "px-4 py-3 border-b border-border/50 hover:bg-surface-3/50 transition-colors cursor-pointer",
                          !n.read && "bg-accent/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{n.title}</p>
                            <p className="text-xs text-muted mt-0.5 truncate">{n.message}</p>
                            <p className="text-[11px] text-surface-6 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-border text-center">
                    <span className="text-xs text-accent cursor-pointer hover:underline">View all notifications</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
              >
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
                <ChevronDown className="w-3 h-3 text-muted hidden lg:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-2 border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-white">Admin</p>
                    <p className="text-xs text-muted mt-0.5">admin@orbitiq.dev</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push("/console/settings"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-surface-3 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/auth/signin" }); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-surface-3 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
