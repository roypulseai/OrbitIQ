import Link from "next/link";
import {
  Database,
  Box,
  Shield,
  Zap,
  Brain,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-0 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-0/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-lg font-bold tracking-tight">OrbitIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="text-sm text-muted hover:text-white transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link href="/console" className="btn-primary text-sm">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent">
              AI-Native Business Intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Ask your data
            <br />
            <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              any question
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Describe what you want in plain language. OrbitIQ translates it into
            governed, production-grade dashboards — with a semantic layer that
            ensures every team sees the same numbers.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/console"
              className="btn-primary px-6 py-3 text-base"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="btn-secondary px-6 py-3 text-base"
            >
              Learn More
            </Link>
          </div>

          {/* Trust */}
          <div className="mt-16 flex items-center justify-center gap-8 text-xs text-surface-6">
            <span>SOC 2 Compliant</span>
            <span className="w-1 h-1 rounded-full bg-surface-6" />
            <span>GDPR Ready</span>
            <span className="w-1 h-1 rounded-full bg-surface-6" />
            <span>Enterprise SSO</span>
            <span className="w-1 h-1 rounded-full bg-surface-6" />
            <span>Self-Hosted Option</span>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-surface-2 p-2 shadow-elevated">
            <div className="rounded-xl bg-surface-1 p-6">
              {/* Mock dashboard header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <div className="ml-4 text-xs text-surface-6 font-mono">
                  orbitiq.dev/console
                </div>
              </div>
              {/* Mock KPI cards */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Revenue", value: "$2.4M", change: "+12.5%" },
                  { label: "Users", value: "48.2K", change: "+8.3%" },
                  { label: "Queries", value: "156K", change: "+23.1%" },
                  { label: "Uptime", value: "99.9%", change: "0%" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-surface-2 border border-border rounded-lg p-4"
                  >
                    <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
                      {kpi.label}
                    </div>
                    <div className="text-xl font-bold text-white">{kpi.value}</div>
                    <div className="text-[10px] text-success mt-1">{kpi.change}</div>
                  </div>
                ))}
              </div>
              {/* Mock chart area */}
              <div className="bg-surface-2 border border-border rounded-lg p-4 h-32 flex items-end gap-1">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-accent/30 rounded-t"
                    style={{
                      height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 30}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for enterprise data teams
            </h2>
            <p className="mt-3 text-muted max-w-lg mx-auto">
              Everything you need to go from raw data to governed insights —
              with AI at the core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Brain,
                title: "AI-Native Queries",
                desc: "Ask questions in natural language. Get instant dashboards with governed metrics.",
              },
              {
                icon: Database,
                title: "Multi-Source Connect",
                desc: "PostgreSQL, Snowflake, BigQuery, MySQL — connect in minutes, not weeks.",
              },
              {
                icon: Box,
                title: "Semantic Layer",
                desc: "Define metrics once. Every team, every dashboard, every export sees the same number.",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "RLS, CLS, data masking, audit trails, SOC 2 compliance built in from day one.",
              },
              {
                icon: BarChart3,
                title: "Rich Visualizations",
                desc: "Bar, line, area, scatter, pie, donut — plus custom charts via Vega-Lite.",
              },
              {
                icon: Zap,
                title: "Blazing Fast",
                desc: "Result caching, query optimization, and intelligent aggregate awareness.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="surface-card p-5 hover:border-accent/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center mb-3 group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to transform your data workflow?
          </h2>
          <p className="mt-3 text-muted">
            Connect your first data source in under 5 minutes.
          </p>
          <div className="mt-8">
            <Link href="/console" className="btn-primary px-6 py-3 text-base">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-surface-6">
          <span>&copy; 2026 OrbitIQ. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Documentation</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
