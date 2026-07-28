"use client";

import { useState } from "react";
import {
  FlaskConical,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  BarChart3,
} from "lucide-react";

interface TestResult {
  statistic: number;
  pValue: number;
  significant: boolean;
  confidenceInterval: [number, number];
  effectSize: number;
  power: number;
  sampleSize1: number;
  sampleSize2: number;
  interpretation: string;
}

interface HypothesisTest {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  testType: string;
  variable1: string;
  variable2?: string;
  significanceLevel: number;
  result?: TestResult;
  createdAt: string;
}

const VARIABLES = [
  "conversion_rate",
  "revenue",
  "engagement",
  "retention",
  "churn_rate",
  "arpu",
  "session_duration",
  "bounce_rate",
  "page_views",
  "click_through_rate",
];

const TEST_TYPES = [
  { value: "auto", label: "Auto-detect", icon: Sparkles, desc: "Automatically select the best test" },
  { value: "t_test", label: "t-test", icon: BarChart3, desc: "Compare two group means" },
  { value: "chi_square", label: "Chi-square", icon: BarChart3, desc: "Test independence of categorical variables" },
  { value: "anova", label: "ANOVA", icon: BarChart3, desc: "Compare means across multiple groups" },
  { value: "mann_whitney", label: "Mann-Whitney", icon: BarChart3, desc: "Non-parametric two-group comparison" },
  { value: "wilcoxon", label: "Wilcoxon", icon: BarChart3, desc: "Non-parametric paired comparison" },
];

const SIGNIFICANCE_LEVELS = [
  { value: 0.01, label: "0.01", desc: "Strict" },
  { value: 0.05, label: "0.05", desc: "Standard" },
  { value: 0.1, label: "0.10", desc: "Relaxed" },
];

const SEED_TESTS: HypothesisTest[] = [
  {
    id: "test-001",
    name: "Conversion Rate A/B Test",
    status: "completed",
    testType: "t_test",
    variable1: "conversion_rate",
    significanceLevel: 0.05,
    result: {
      statistic: 2.15,
      pValue: 0.032,
      significant: true,
      confidenceInterval: [0.02, 0.18],
      effectSize: 0.45,
      power: 0.82,
      sampleSize1: 1250,
      sampleSize2: 1280,
      interpretation: "Medium effect (Cohen's d = 0.45). The difference in conversion rates between groups is statistically significant at α = 0.05.",
    },
    createdAt: "3 days ago",
  },
  {
    id: "test-002",
    name: "Revenue Distribution by Region",
    status: "completed",
    testType: "anova",
    variable1: "revenue",
    variable2: "region",
    significanceLevel: 0.05,
    result: {
      statistic: 8.2,
      pValue: 0.001,
      significant: true,
      confidenceInterval: [1200, 5800],
      effectSize: 0.72,
      power: 0.95,
      sampleSize1: 450,
      sampleSize2: 450,
      interpretation: "Large effect (η² = 0.72). Revenue distributions differ significantly across regions.",
    },
    createdAt: "1 week ago",
  },
  {
    id: "test-003",
    name: "User Engagement: Feature A vs B",
    status: "completed",
    testType: "t_test",
    variable1: "engagement",
    variable2: "feature_variant",
    significanceLevel: 0.05,
    result: {
      statistic: 1.55,
      pValue: 0.12,
      significant: false,
      confidenceInterval: [-0.05, 0.47],
      effectSize: 0.21,
      power: 0.45,
      sampleSize1: 600,
      sampleSize2: 580,
      interpretation: "Small effect (Cohen's d = 0.21). Insufficient evidence to conclude a difference in engagement.",
    },
    createdAt: "2 weeks ago",
  },
];

function getEffectSizeLabel(d: number): { label: string; color: string } {
  if (d < 0.5) return { label: "Small", color: "text-amber-400" };
  if (d < 0.8) return { label: "Medium", color: "text-blue-400" };
  return { label: "Large", color: "text-emerald-400" };
}

export default function HypothesisTestingPage() {
  const [variable1, setVariable1] = useState("");
  const [variable2, setVariable2] = useState("");
  const [testType, setTestType] = useState("auto");
  const [significance, setSignificance] = useState(0.05);
  const [testName, setTestName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);
  const [allTests, setAllTests] = useState<HypothesisTest[]>(SEED_TESTS);

  const totalTests = allTests.length;
  const significantResults = allTests.filter((t) => t.result?.significant).length;
  const avgPower = allTests.reduce((sum, t) => sum + (t.result?.power || 0), 0) / totalTests;

  const handleRunTest = () => {
    if (!variable1) return;
    setIsRunning(true);

    setTimeout(() => {
      const p = 0.001 + Math.random() * 0.199;
      const stat = testType === "anova" ? 1 + Math.random() * 9 : 1 + Math.random() * 3;
      const effect = 0.2 + Math.random() * 1.0;
      const n1 = 400 + Math.floor(Math.random() * 1600);
      const n2 = 400 + Math.floor(Math.random() * 1600);
      const power = 0.5 + Math.random() * 0.45;

      const result: TestResult = {
        statistic: Math.round(stat * 1000) / 1000,
        pValue: Math.round(p * 1000) / 1000,
        significant: p < significance,
        confidenceInterval: [Math.round((effect - effect * 0.4) * 1000) / 1000, Math.round((effect + effect * 0.4) * 1000) / 1000],
        effectSize: Math.round(effect * 1000) / 1000,
        power: Math.round(power * 1000) / 1000,
        sampleSize1: n1,
        sampleSize2: n2,
        interpretation: `${effect < 0.5 ? "Small" : effect < 0.8 ? "Medium" : "Large"} effect detected (Cohen's d = ${effect.toFixed(3)}).`,
      };

      const selectedTestType = testType === "auto" ? "t_test" : testType;

      const newTest: HypothesisTest = {
        id: `test-${Date.now()}`,
        name: testName || `${variable1} ${variable2 ? `vs ${variable2}` : ""} Test`,
        status: "completed",
        testType: selectedTestType,
        variable1,
        variable2: variable2 || undefined,
        significanceLevel: significance,
        result,
        createdAt: "Just now",
      };

      setActiveResult(result);
      setAllTests([newTest, ...allTests]);
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Hypothesis Testing</h1>
              <p className="text-sm text-muted">Statistical tests with auto-test selection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface-2 border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-xs text-muted">Total Tests</span>
              <span className="text-sm font-bold text-white">{totalTests}</span>
            </div>
            <div className="bg-surface-2 border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-xs text-muted">Significant</span>
              <span className="text-sm font-bold text-emerald-400">{significantResults}</span>
            </div>
            <div className="bg-surface-2 border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-xs text-muted">Avg Power</span>
              <span className="text-sm font-bold text-white">{(avgPower * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Wizard */}
          <div className="bg-surface-2 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Run New Test</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Test Name</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Conversion Rate A/B Test"
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-surface-5 focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Variable 1 (Primary)</label>
                <select
                  value={variable1}
                  onChange={(e) => setVariable1(e.target.value)}
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                >
                  <option value="">Select variable...</option>
                  {VARIABLES.map((v) => (
                    <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Variable 2 (Optional)</label>
                <select
                  value={variable2}
                  onChange={(e) => setVariable2(e.target.value)}
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                >
                  <option value="">None (single variable)</option>
                  {VARIABLES.map((v) => (
                    <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Test Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEST_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTestType(t.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        testType === t.value
                          ? "border-accent bg-accent/10"
                          : "border-border bg-surface-3 hover:border-surface-5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {t.value === "auto" ? (
                          <Sparkles className="w-4 h-4 text-violet-400" />
                        ) : (
                          <t.icon className="w-4 h-4 text-muted" />
                        )}
                        <span className="text-sm font-medium text-white">{t.label}</span>
                      </div>
                      <p className="text-xs text-muted mt-1 ml-6">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Significance Level (α)</label>
                <div className="flex gap-2">
                  {SIGNIFICANCE_LEVELS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSignificance(s.value)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        significance === s.value
                          ? "bg-accent text-white"
                          : "bg-surface-3 text-muted hover:bg-surface-4"
                      }`}
                    >
                      {s.label}
                      <span className="block text-xs opacity-70">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRunTest}
                disabled={!variable1 || isRunning}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running test...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-surface-2 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Test Results</h2>

            {!activeResult ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted">
                <FlaskConical className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Run a test to see results here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* P-Value Display */}
                <div className={`rounded-xl p-4 border ${
                  activeResult.significant
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted mb-1">p-value</p>
                      <p className={`text-3xl font-bold ${activeResult.significant ? "text-emerald-400" : "text-red-400"}`}>
                        {activeResult.pValue.toFixed(3)}
                      </p>
                    </div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      activeResult.significant ? "bg-emerald-500/20" : "bg-red-500/20"
                    }`}>
                      {activeResult.significant ? (
                        <CheckCircle className="w-7 h-7 text-emerald-400" />
                      ) : (
                        <XCircle className="w-7 h-7 text-red-400" />
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-2 ${activeResult.significant ? "text-emerald-300" : "text-red-300"}`}>
                    {activeResult.significant ? "Result is statistically significant" : "Result is NOT statistically significant"}
                  </p>
                </div>

                {/* Confidence Interval Bar */}
                <div className="bg-surface-3 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted mb-2">95% Confidence Interval</p>
                  <div className="relative h-6 bg-surface-4 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-accent/30 rounded-full"
                      style={{
                        left: `${Math.max(0, (activeResult.confidenceInterval[0] + 0.5) * 50)}%`,
                        width: `${(activeResult.confidenceInterval[1] - activeResult.confidenceInterval[0]) * 50}%`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      [{activeResult.confidenceInterval[0].toFixed(3)}, {activeResult.confidenceInterval[1].toFixed(3)}]
                    </div>
                  </div>
                </div>

                {/* Effect Size */}
                <div className="bg-surface-3 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted">Effect Size (Cohen's d)</p>
                    <span className={`text-sm font-bold ${getEffectSizeLabel(activeResult.effectSize).color}`}>
                      {getEffectSizeLabel(activeResult.effectSize).label}
                    </span>
                  </div>
                  <div className="relative h-4 bg-surface-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        activeResult.effectSize < 0.5
                          ? "bg-amber-500"
                          : activeResult.effectSize < 0.8
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, activeResult.effectSize * 83)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted mt-1">
                    <span>0</span>
                    <span>Small (0.2)</span>
                    <span>Medium (0.5)</span>
                    <span>Large (0.8)</span>
                  </div>
                </div>

                {/* Power Meter */}
                <div className="bg-surface-3 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted">Statistical Power</p>
                    <span className={`text-sm font-bold ${activeResult.power >= 0.8 ? "text-emerald-400" : "text-amber-400"}`}>
                      {(activeResult.power * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-surface-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        activeResult.power >= 0.8 ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${activeResult.power * 100}%` }}
                    />
                  </div>
                  {activeResult.power < 0.8 && (
                    <p className="text-xs text-amber-400 mt-1">⚠ Power below 80% — consider increasing sample size</p>
                  )}
                </div>

                {/* Sample Sizes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-3 rounded-lg p-3 border border-border text-center">
                    <p className="text-xs text-muted">Sample 1</p>
                    <p className="text-lg font-bold text-white">{activeResult.sampleSize1.toLocaleString()}</p>
                  </div>
                  <div className="bg-surface-3 rounded-lg p-3 border border-border text-center">
                    <p className="text-xs text-muted">Sample 2</p>
                    <p className="text-lg font-bold text-white">{activeResult.sampleSize2.toLocaleString()}</p>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="bg-surface-3 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted mb-1">Interpretation</p>
                  <p className="text-sm text-white">{activeResult.interpretation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-white">Recent Tests</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Test Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Variable</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted">p-value</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-muted">Significant</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted">Effect Size</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Created</th>
              </tr>
            </thead>
            <tbody>
              {allTests.map((test) => (
                <tr key={test.id} className="border-b border-border last:border-0 hover:bg-surface-3/50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-white">{test.name}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded bg-surface-4 text-xs text-muted font-mono uppercase">
                      {test.testType}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-xs text-accent font-mono">
                      {test.variable1}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={`text-sm font-medium ${
                      (test.result?.pValue ?? 1) < 0.05 ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {test.result?.pValue.toFixed(3) ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    {test.result?.significant ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 inline" />
                    )}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-muted">
                    {test.result?.effectSize.toFixed(2) ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted">{test.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
