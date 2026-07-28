"use client";

import { useState } from "react";
import { Code, Eye, Settings, Copy, Check, ExternalLink, Monitor, Moon, Sun, MonitorSpeaker } from "lucide-react";

interface ActiveEmbed {
  id: string;
  dashboardName: string;
  views: number;
  lastViewed: string;
  status: "active" | "inactive";
}

const MOCK_EMBEDS: ActiveEmbed[] = [
  { id: "1", dashboardName: "Sales Overview", views: 1243, lastViewed: "2 min ago", status: "active" },
  { id: "2", dashboardName: "Executive Summary", views: 567, lastViewed: "1 hour ago", status: "active" },
  { id: "3", dashboardName: "Marketing Analytics", views: 89, lastViewed: "3 days ago", status: "inactive" },
];

const DASHBOARDS = ["Sales Overview", "Executive Summary", "Marketing Analytics", "Customer Insights"];

export default function EmbeddingPage() {
  const [selectedDashboard, setSelectedDashboard] = useState("Sales Overview");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("dark");
  const [showHeader, setShowHeader] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [allowedDomains, setAllowedDomains] = useState("*.orbitiq.dev\n*.acme.com");
  const [embedTab, setEmbedTab] = useState<"html" | "js">("html");
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe
  src="https://app.orbitiq.dev/embed/console/${selectedDashboard.toLowerCase().replace(/\s+/g, "-")}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: 1px solid #1f1f23; border-radius: 12px;"
  allow="clipboard-write"
></iframe>`;

  const jsCode = `<script src="https://cdn.orbitiq.dev/embed.js"></script>
<script>
  OrbitIQ.embed('#dashboard-container', {
    dashboard: '${selectedDashboard.toLowerCase().replace(/\s+/g, "-")}',
    theme: '${theme}',
    showHeader: ${showHeader},
    showFilters: ${showFilters},
    showSidebar: ${showSidebar},
    fontSize: ${fontSize},
  });
</script>
<div id="dashboard-container"></div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedTab === "html" ? embedCode : jsCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <Code className="w-6 h-6 text-accent" />
          Embedding & Integration
        </h1>
        <p className="text-sm text-muted mt-1">Embed dashboards into your applications and control the viewing experience.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Preview */}
        <div className="xl:col-span-2 space-y-6">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                Live Preview
              </h2>
              <div className="relative">
                <select
                  value={selectedDashboard}
                  onChange={(e) => setSelectedDashboard(e.target.value)}
                  className="input-dark text-xs py-1.5 pr-7 appearance-none cursor-pointer"
                >
                  {DASHBOARDS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border border-border rounded-xl bg-surface-3 overflow-hidden">
              {/* Simulated iframe header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-surface-5" />
                  <div className="w-3 h-3 rounded-full bg-surface-5" />
                  <div className="w-3 h-3 rounded-full bg-surface-5" />
                </div>
                <span className="text-[10px] text-muted font-mono">app.orbitiq.dev/embed/console/sales-overview</span>
                <ExternalLink className="w-3 h-3 text-muted" />
              </div>
              {/* Simulated dashboard content */}
              <div className="p-6 min-h-[300px] flex flex-col gap-4">
                {showHeader && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-5 w-48 bg-surface-4 rounded mb-1.5" />
                      <div className="h-3 w-32 bg-surface-4 rounded" />
                    </div>
                    {showFilters && (
                      <div className="flex gap-2">
                        <div className="h-7 w-24 bg-surface-4 rounded-lg" />
                        <div className="h-7 w-20 bg-surface-4 rounded-lg" />
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-surface-4 rounded-lg p-3">
                      <div className="h-2 w-16 bg-surface-5 rounded mb-2" />
                      <div className="h-6 w-20 bg-surface-5 rounded mb-1" />
                      <div className="h-2 w-12 bg-surface-6 rounded" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="bg-surface-4 rounded-lg p-4 flex items-end gap-2">
                    {[40, 60, 35, 70, 55, 80, 45, 65, 50, 75, 42, 88].map((h, i) => (
                      <div key={i} className="flex-1 bg-accent/40 rounded-t" style={{ height: `${h * 1.5}px` }} />
                    ))}
                  </div>
                  <div className="bg-surface-4 rounded-lg p-4 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-[8px] border-accent/40 border-t-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-accent" />
                Embed Code
              </h2>
              <div className="flex items-center gap-1 bg-surface-3 rounded-lg p-0.5">
                <button
                  onClick={() => setEmbedTab("html")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${embedTab === "html" ? "bg-surface-4 text-white" : "text-muted hover:text-white"}`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setEmbedTab("js")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${embedTab === "js" ? "bg-surface-4 text-white" : "text-muted hover:text-white"}`}
                >
                  JavaScript SDK
                </button>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-surface-3 rounded-xl p-4 text-xs font-mono text-white/80 overflow-x-auto border border-border leading-relaxed">
                <code>{embedTab === "html" ? embedCode : jsCode}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-surface-4 hover:bg-surface-5 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted" />}
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="space-y-6">
          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent" />
              Embed Configuration
            </h2>

            {/* Theme Toggle */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-1.5 bg-surface-3 rounded-lg p-1">
                {([
                  { value: "light" as const, icon: Sun, label: "Light" },
                  { value: "dark" as const, icon: Moon, label: "Dark" },
                  { value: "auto" as const, icon: Monitor, label: "Auto" },
                ]).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${theme === t.value ? "bg-surface-5 text-white" : "text-muted hover:text-white"}`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-3 mb-5">
              {[
                { label: "Show Header", value: showHeader, onChange: setShowHeader },
                { label: "Show Filters", value: showFilters, onChange: setShowFilters },
                { label: "Show Sidebar", value: showSidebar, onChange: setShowSidebar },
              ].map((opt) => (
                <div key={opt.label} className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{opt.label}</span>
                  <button
                    onClick={() => opt.onChange(!opt.value)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${opt.value ? "bg-accent" : "bg-surface-5"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${opt.value ? "translate-x-4" : ""}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Font Size */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted">Font Size</label>
                <span className="text-xs font-mono text-white/60">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-4 rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted">12px</span>
                <span className="text-[10px] text-muted">24px</span>
              </div>
            </div>

            {/* Allowed Domains */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Allowed Domains</label>
              <textarea
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                className="input-dark min-h-[80px] font-mono text-xs resize-none"
                placeholder="One domain per line"
              />
            </div>
          </div>

          {/* Active Embeds */}
          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <MonitorSpeaker className="w-4 h-4 text-accent" />
              Active Embeds
            </h2>
            <div className="space-y-2">
              {MOCK_EMBEDS.map((embed) => (
                <div key={embed.id} className="flex items-center justify-between p-3 bg-surface-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${embed.status === "active" ? "bg-success" : "bg-surface-6"}`} />
                    <div>
                      <div className="text-sm font-medium text-white">{embed.dashboardName}</div>
                      <div className="text-[11px] text-muted">{embed.views.toLocaleString()} views · {embed.lastViewed}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
