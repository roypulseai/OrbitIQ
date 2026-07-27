"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { ArrowRight, Database, Shield, Zap } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await signIn("credentials", { email: email.trim(), callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-surface-0 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-surface-1 via-surface-2 to-accent/5 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${20 + Math.random() * 60}%`,
                top: `${Math.random() * 40}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">OrbitIQ</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">
            AI-Native Enterprise
            <br />
            Business Intelligence
          </h1>
          <p className="text-muted text-base leading-relaxed mb-10">
            Ask questions in plain language. Get governed, production-grade
            dashboards with a semantic layer that ensures consistency across your
            entire organization.
          </p>
          <div className="space-y-4">
            {[
              { icon: Database, text: "Connect to any data source in minutes" },
              { icon: Zap, text: "AI-powered natural language queries" },
              { icon: Shield, text: "Enterprise security with RLS and audit trails" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-3/50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-muted">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Sign In */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-xl font-bold tracking-tight">OrbitIQ</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted mt-2">
              Sign in to your workspace to continue.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
              className="w-full btn-primary py-3 text-sm justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              Sign in with SSO
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-1 px-3 text-surface-6">or</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                placeholder="Work email address"
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full btn-secondary py-3 text-sm justify-center disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Continue with Email"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-surface-6">
            Don&apos;t have an account?{" "}
            <span className="text-accent hover:text-accent-hover cursor-pointer transition-colors">
              Request access
            </span>
          </p>

          <p className="mt-4 text-center text-[11px] text-surface-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
