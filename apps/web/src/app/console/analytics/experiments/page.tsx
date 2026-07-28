"use client";

import { useState } from "react";
import {
  Beaker,
  Play,
  CheckCircle,
  Plus,
  BarChart3,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Variant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  metricValue: number;
  conversions: number;
  sampleSize: number;
}

interface ExperimentResult {
  winner?: string;
  pValue: number;
  power: number;
  confidenceInterval: [number, number];
  recommendations: string[];
}

interface Experiment {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "paused";
  hypothesis: string;
  experimentType: "ab_test" | "multi_variant" | "sequential";
  variants: Variant[];
  targetMetric: string;
  sampleSize: number;
  duration: number;
  startDate?: string;
  endDate?: string;
  results?: ExperimentResult;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: "text-surface-5", bg: "bg-surface-4", label: "Draft" },
  running: { color: "text-blue-400", bg: "bg-blue-500/15", label: "Running" },
  completed: { color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Completed" },
  paused: { color: "text-amber-400", bg: "bg-amber-500/15", label: "Paused" },
};

const SEED_EXPERIMENTS: Experiment[] = [
  {
    id: "exp-001",
    name: "Homepage CTA Color Test",
    status: "running",
    hypothesis: "Changing the CTA button color from blue to green will increase click-through rate by at least 5%",
    experimentType: "ab_test",
    variants: [
      {
        id: "var-a",
        name: "Blue CTA (Control)",
        description: "Original blue CTA button on homepage",
        trafficPercentage: 50,
        metricValue: 3.2,
        conversions: 640,
        sampleSize: 20000,
      },
      {
        id: "var-b",
        name: "Green CTA (Variant)",
        description: "New green CTA button on homepage",
        trafficPercentage: 50,
        metricValue: 3.8,
        conversions: 760,
        sampleSize: 20000,
      },
    ],
    targetMetric: "click_through_rate",
    sampleSize: 40000,
    duration: 14,
    startDate: "7 days ago",
    results: {
      pValue: 0.045,
      power: 0.78,
      confidenceInterval: [0.1, 1.1],
      recommendations: [
        "The green CTA shows a statistically significant improvement in CTR",
        "Consider extending the experiment 3-5 more days for higher power",
        "Monitor for novelty effect over the coming days",
      ],
    },
    createdAt: "10 days ago",
  },
  {
    id: "exp-002",
    name: "Pricing Page Layout",
    status: "completed",
    hypothesis: "A three-column pricing layout will outperform the current two-column layout in conversion rate",
    experimentType: "multi_variant",
    variants: [
      {
        id: "var-ctrl",
        name: "Two-Column (Control)",
        description: "Current two-column pricing layout",
        trafficPercentage: 33,
        metricValue: 2.1,
        conversions: 315,
        sampleSize: 15000,
      },
      {
        id: "var-3col",
        name: "Three-Column",
        description: "Three-column layout with highlighted middle tier",
        trafficPercentage: 34,
        metricValue: 2.8,
        conversions: 476,
        sampleSize: 17000,
      },
      {
        id: "var-card",
        name: "Card Grid",
        description: "Card-based grid layout with comparison table",
        trafficPercentage: 33,
        metricValue: 2.5,
        conversions: 375,
        sampleSize: 15000,
      },
    ],
    targetMetric: "conversion_rate",
    sampleSize: 47000,
    duration: 21,
    startDate: "30 days ago",
    endDate: "9 days ago",
    results: {
      winner: "var-3col",
      pValue: 0.008,
      power: 0.92,
      confidenceInterval: [0.3, 1.1],
      recommendations: [
        "Three-column layout is the clear winner with p = 0.008",
        "Deploy the three-column layout to 100% of traffic",
        "The card grid showed modest improvement but was not significant",
        "Follow up with a pricing copy A/B test on the three-column layout",
      ],
    },
    createdAt: "35 days ago",
  },
];

export default function ExperimentsPage() {
  const [experiments] = useState<Experiment[]>(SEED_EXPERIMENTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: "",
    hypothesis: "",
    experimentType: "ab_test" as "ab_test" | "multi_variant",
    targetMetric: "conversion_rate",
    sampleSize: 10000,
    duration: 14,
    variants: [
      { name: "Control", description: "Original version", trafficPercentage: 50 },
      { name: "Variant", description: "New version", trafficPercentage: 50 },
    ],
  });

  const totalExperiments = experiments.length;
  const runningExperiments = experiments.filter((e) => e.status === "running").length;
  const completedExperiments = experiments.filter((e) => e.status === "completed").length;

  return (
    <div className="min-h-screen bg-surface-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Experiments</h1>
              <p className="text-sm text-muted">A/B testing and multi-variant experiments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface-2 border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-xs text-muted">Total</span>
              <span className="text-sm font-bold text-white">{totalExperiments}</span>
            </div>
            <div className="bg-surface-2 border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm font-bold text-blue-400">{runningExperiments}</span>
            </div>
            <div className="bg-surface-2 border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">{completedExperiments}</span>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Experiment
            </button>
          </div>
        </div>

        {/* Create Experiment Form */}
        {showCreateForm && (
          <div className="bg-surface-2 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create Experiment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Name</label>
                <input
                  type="text"
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                  placeholder="e.g., Homepage CTA Test"
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-surface-5 focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Target Metric</label>
                <select
                  value={newExperiment.targetMetric}
                  onChange={(e) => setNewExperiment({ ...newExperiment, targetMetric: e.target.value })}
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                >
                  <option value="conversion_rate">Conversion Rate</option>
                  <option value="click_through_rate">Click-Through Rate</option>
                  <option value="revenue">Revenue</option>
                  <option value="engagement">Engagement</option>
                  <option value="retention">Retention</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-1.5">Hypothesis</label>
                <input
                  type="text"
                  value={newExperiment.hypothesis}
                  onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                  placeholder="e.g., Variant B will improve conversion by at least 10%"
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-surface-5 focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Experiment Type</label>
                <div className="flex gap-2">
                  {[
                    { value: "ab_test", label: "A/B Test" },
                    { value: "multi_variant", label: "Multi-variant" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() =>
                        setNewExperiment({
                          ...newExperiment,
                          experimentType: t.value as "ab_test" | "multi_variant",
                          variants:
                            t.value === "ab_test"
                              ? [
                                  { name: "Control", description: "Original", trafficPercentage: 50 },
                                  { name: "Variant", description: "New version", trafficPercentage: 50 },
                                ]
                              : [
                                  { name: "Control", description: "Original", trafficPercentage: 33 },
                                  { name: "Variant A", description: "Version A", trafficPercentage: 34 },
                                  { name: "Variant B", description: "Version B", trafficPercentage: 33 },
                                ],
                        })
                      }
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        newExperiment.experimentType === t.value
                          ? "bg-accent text-white"
                          : "bg-surface-3 text-muted hover:bg-surface-4"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Sample Size</label>
                <input
                  type="number"
                  value={newExperiment.sampleSize}
                  onChange={(e) => setNewExperiment({ ...newExperiment, sampleSize: parseInt(e.target.value) })}
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Duration (days)</label>
                <input
                  type="number"
                  value={newExperiment.duration}
                  onChange={(e) => setNewExperiment({ ...newExperiment, duration: parseInt(e.target.value) })}
                  className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Variants ({newExperiment.variants.length})</label>
                <div className="space-y-2">
                  {newExperiment.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => {
                          const variants = [...newExperiment.variants];
                          variants[i] = { ...variants[i], name: e.target.value };
                          setNewExperiment({ ...newExperiment, variants });
                        }}
                        className="flex-1 bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                      />
                      <input
                        type="number"
                        value={v.trafficPercentage}
                        onChange={(e) => {
                          const variants = [...newExperiment.variants];
                          variants[i] = { ...variants[i], trafficPercentage: parseInt(e.target.value) || 0 };
                          setNewExperiment({ ...newExperiment, variants });
                        }}
                        className="w-20 bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent/50"
                      />
                      <span className="text-xs text-muted">%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
                >
                  Create Experiment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Experiment Cards */}
        <div className="space-y-4">
          {experiments.map((exp) => {
            const statusConf = STATUS_CONFIG[exp.status];
            const isExpanded = expandedId === exp.id;

            return (
              <div key={exp.id} className="bg-surface-2 border border-border rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{exp.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-surface-4 text-xs text-muted font-mono">
                          {exp.experimentType === "ab_test" ? "A/B Test" : "Multi-variant"}
                        </span>
                      </div>
                      <p className="text-sm text-muted">{exp.hypothesis}</p>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                      className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-muted"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" />
                      {exp.targetMetric.replace(/_/g, " ")}
                    </span>
                    <span>{exp.variants.length} variants</span>
                    <span>{exp.sampleSize.toLocaleString()} sample size</span>
                    <span>{exp.duration} days</span>
                    {exp.startDate && <span>Started {exp.startDate}</span>}
                  </div>

                  {/* Variant Summary */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {exp.variants.map((v) => (
                      <div
                        key={v.id}
                        className={`bg-surface-3 rounded-lg p-3 border border-border ${
                          exp.results?.winner === v.id ? "ring-2 ring-emerald-500/50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{v.name}</span>
                          {exp.results?.winner === v.id && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                              Winner
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted">Traffic</p>
                            <p className="text-white font-medium">{v.trafficPercentage}%</p>
                          </div>
                          <div>
                            <p className="text-muted">Metric</p>
                            <p className="text-white font-medium">{v.metricValue.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted">Conversions</p>
                            <p className="text-white font-medium">{v.conversions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted">Sample</p>
                            <p className="text-white font-medium">{v.sampleSize.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expanded Results */}
                {isExpanded && exp.results && (
                  <div className="border-t border-border p-6 bg-surface-3/30">
                    <h4 className="text-sm font-semibold text-white mb-3">Experiment Results</h4>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-surface-2 rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted">p-value</p>
                        <p className={`text-lg font-bold ${exp.results.pValue < 0.05 ? "text-emerald-400" : "text-red-400"}`}>
                          {exp.results.pValue.toFixed(3)}
                        </p>
                      </div>
                      <div className="bg-surface-2 rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted">Power</p>
                        <p className={`text-lg font-bold ${exp.results.power >= 0.8 ? "text-emerald-400" : "text-amber-400"}`}>
                          {(exp.results.power * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="bg-surface-2 rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted">Confidence Interval</p>
                        <p className="text-sm font-bold text-white">
                          [{exp.results.confidenceInterval[0].toFixed(2)}, {exp.results.confidenceInterval[1].toFixed(2)}]
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-2">Recommendations</p>
                      <ul className="space-y-1.5">
                        {exp.results.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white">
                            <TrendingUp className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
