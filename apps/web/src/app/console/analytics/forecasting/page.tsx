"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  TrendingUp,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Zap,
  BarChart3,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(m => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });

interface ForecastMetrics {
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
  backtestFolds: number;
}

interface ModelComparisonData {
  model: string;
  rmse: number;
  mape: number;
  r2: number;
  trainingTimeMs: number;
  recommended: boolean;
}

interface ForecastJob {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  model: string;
  dataSource: string;
  targetColumn: string;
  dateColumn: string;
  horizon: number;
  confidenceLevel: number;
  metrics?: ForecastMetrics;
  createdAt: string;
  completedAt?: string;
}

interface ChartDataPoint {
  date: string;
  actual?: number;
  predicted?: number;
  lower?: number;
  upper?: number;
}

const DATA_SOURCES = [
  { id: "sales_db", name: "Sales Database", columns: ["revenue", "order_count", "avg_order_value", "gross_margin"] },
  { id: "analytics_db", name: "Analytics Database", columns: ["users", "sessions", "page_views", "bounce_rate"] },
  { id: "subscriptions_db", name: "Subscriptions Database", columns: ["churn_rate", "mrr", "arpu", "ltv"] },
];

const HORIZON_OPTIONS = [3, 6, 12];
const CONFIDENCE_OPTIONS = [80, 90, 95];

const SEASONALITY_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const MODEL_OPTIONS = [
  { value: "auto", label: "Auto-select", icon: Sparkles, desc: "Best model chosen by backtest error" },
  { value: "arima", label: "ARIMA", icon: TrendingUp, desc: "AutoRegressive Integrated Moving Average" },
  { value: "exponential_smoothing", label: "Exp. Smoothing", icon: BarChart3, desc: "Holt-Winters Exponential Smoothing" },
  { value: "linear", label: "Linear Regression", icon: TrendingUp, desc: "Simple trend extrapolation" },
];

function generateChartData(targetColumn: string, horizon: number): ChartDataPoint[] {
  let baseValue: number;
  let trend: number;
  let amplitude: number;

  switch (targetColumn) {
    case "revenue":
      baseValue = 125000;
      trend = 4200;
      amplitude = 15000;
      break;
    case "users":
      baseValue = 8500;
      trend = 320;
      amplitude = 800;
      break;
    case "churn_rate":
      baseValue = 3.2;
      trend = -0.05;
      amplitude = 0.3;
      break;
    default:
      baseValue = 50000;
      trend = 2000;
      amplitude = 8000;
  }

  const data: ChartDataPoint[] = [];
  const startDate = new Date("2024-07-01");

  for (let i = 0; i < 24; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const seasonal = amplitude * Math.sin((2 * Math.PI * i) / 12);
    const noise = (Math.sin(i * 3.7) * 0.3 + Math.cos(i * 1.3) * 0.2) * amplitude * 0.3;
    const value = baseValue + trend * i + seasonal + noise;
    data.push({
      date: d.toISOString().slice(0, 7),
      actual: Math.round(value * 100) / 100,
    });
  }

  const lastActual = data[data.length - 1].actual!;
  for (let i = 0; i < horizon; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + 24 + i);
    const seasonal = amplitude * Math.sin((2 * Math.PI * (24 + i)) / 12);
    const predValue = lastActual + trend * (i + 1) * 0.8 + seasonal;
    const interval = (i + 1) * (targetColumn === "churn_rate" ? 0.08 : baseValue * 0.008);
    data.push({
      date: d.toISOString().slice(0, 7),
      predicted: Math.round(predValue * 100) / 100,
      lower: Math.round((predValue - interval * 1.96) * 100) / 100,
      upper: Math.round((predValue + interval * 1.96) * 100) / 100,
    });
  }

  return data;
}

function getModelComparison(targetColumn: string): ModelComparisonData[] {
  const base = targetColumn === "churn_rate" ? 0.3 : targetColumn === "users" ? 500 : 8000;
  return [
    {
      model: "ARIMA",
      rmse: Math.round(base * 0.065 * 100) / 100,
      mape: Math.round(4.2 * 100) / 100,
      r2: 0.934,
      trainingTimeMs: 1120,
      recommended: true,
    },
    {
      model: "Exponential Smoothing",
      rmse: Math.round(base * 0.082 * 100) / 100,
      mape: Math.round(5.1 * 100) / 100,
      r2: 0.891,
      trainingTimeMs: 540,
      recommended: false,
    },
    {
      model: "Linear Regression",
      rmse: Math.round(base * 0.105 * 100) / 100,
      mape: Math.round(6.8 * 100) / 100,
      r2: 0.847,
      trainingTimeMs: 75,
      recommended: false,
    },
  ];
}

const SEEDED_JOBS: ForecastJob[] = [
  {
    id: "forecast-001",
    name: "Revenue Forecast - Next 12 Months",
    status: "completed",
    model: "auto (ARIMA)",
    dataSource: "sales_db",
    targetColumn: "revenue",
    dateColumn: "order_date",
    horizon: 12,
    confidenceLevel: 0.95,
    metrics: { mae: 4821.3, rmse: 6234.7, mape: 4.2, r2: 0.934, backtestFolds: 5 },
    createdAt: "3 days ago",
    completedAt: "3 days ago",
  },
  {
    id: "forecast-002",
    name: "User Growth Projection",
    status: "completed",
    model: "linear",
    dataSource: "analytics_db",
    targetColumn: "users",
    dateColumn: "signup_date",
    horizon: 6,
    confidenceLevel: 0.90,
    metrics: { mae: 287.5, rmse: 342.1, mape: 3.8, r2: 0.912, backtestFolds: 5 },
    createdAt: "1 week ago",
    completedAt: "1 week ago",
  },
  {
    id: "forecast-003",
    name: "Churn Rate Forecast",
    status: "completed",
    model: "exponential_smoothing",
    dataSource: "subscriptions_db",
    targetColumn: "churn_rate",
    dateColumn: "period",
    horizon: 3,
    confidenceLevel: 0.80,
    metrics: { mae: 0.12, rmse: 0.18, mape: 5.4, r2: 0.887, backtestFolds: 5 },
    createdAt: "2 weeks ago",
    completedAt: "2 weeks ago",
  },
];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-emerald-400", label: "Completed" },
  running: { icon: Loader2, color: "text-blue-400", label: "Running" },
  pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
  failed: { icon: AlertCircle, color: "text-red-400", label: "Failed" },
};

export default function ForecastingPage() {
  const [step, setStep] = useState(1);
  const [dataSource, setDataSource] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [dateColumn, setDateColumn] = useState("");
  const [horizon, setHorizon] = useState<12 | 6 | 3>(12);
  const [confidence, setConfidence] = useState<95 | 90 | 80>(95);
  const [seasonality, setSeasonality] = useState("auto");
  const [model, setModel] = useState("auto");
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [modelComparison, setModelComparison] = useState<ModelComparisonData[]>([]);
  const [resultMetrics, setResultMetrics] = useState<ForecastMetrics | null>(null);

  const selectedSource = DATA_SOURCES.find((s) => s.id === dataSource);

  const handleRunForecast = () => {
    setIsRunning(true);
    setTimeout(() => {
      const data = generateChartData(targetColumn, horizon);
      const comparison = getModelComparison(targetColumn);
      setChartData(data);
      setModelComparison(comparison);
      setResultMetrics({
        mae: comparison[0].rmse * 0.78,
        rmse: comparison[0].rmse,
        mape: comparison[0].mape,
        r2: comparison[0].r2,
        backtestFolds: 5,
      });
      setIsRunning(false);
      setShowResults(true);
    }, 2000);
  };

  const resetWizard = () => {
    setStep(1);
    setDataSource("");
    setTargetColumn("");
    setDateColumn("");
    setHorizon(12);
    setConfidence(95);
    setSeasonality("auto");
    setModel("auto");
    setIsRunning(false);
    setShowResults(false);
    setChartData([]);
    setModelComparison([]);
    setResultMetrics(null);
  };

  return (
    <div className="min-h-screen bg-surface-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Time-Series Forecasting</h1>
                <p className="text-sm text-muted">AI-powered forecasting with auto model selection</p>
              </div>
            </div>
          </div>
          <button
            onClick={resetWizard}
            className="px-4 py-2 rounded-lg bg-surface-3 text-white hover:bg-surface-4 transition-colors text-sm font-medium"
          >
            New Forecast
          </button>
        </div>

        {/* Forecast Wizard */}
        {!showResults && (
          <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
            {/* Step Indicator */}
            <div className="flex items-center gap-1 px-6 py-4 border-b border-border">
              {[
                { num: 1, label: "Data Source" },
                { num: 2, label: "Configuration" },
                { num: 3, label: "Model Selection" },
                { num: 4, label: "Review & Run" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-1">
                  <button
                    onClick={() => s.num < step && setStep(s.num)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      step === s.num
                        ? "bg-accent/15 text-accent"
                        : step > s.num
                        ? "text-emerald-400"
                        : "text-muted"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step === s.num
                          ? "bg-accent text-white"
                          : step > s.num
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-surface-3 text-muted"
                      }`}
                    >
                      {step > s.num ? "✓" : s.num}
                    </span>
                    <span className="hidden md:inline">{s.label}</span>
                  </button>
                  {i < 3 && <ChevronRight className="w-4 h-4 text-surface-5" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Step 1: Data Source */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Select Data Source & Columns</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DATA_SOURCES.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => {
                          setDataSource(source.id);
                          setTargetColumn("");
                          setDateColumn("");
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          dataSource === source.id
                            ? "border-accent bg-accent/10"
                            : "border-border bg-surface-3 hover:border-surface-5"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Database className="w-5 h-5 text-accent" />
                          <span className="font-medium text-white">{source.name}</span>
                        </div>
                        <p className="text-xs text-muted">{source.columns.length} available columns</p>
                      </button>
                    ))}
                  </div>

                  {selectedSource && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Target Column (what to forecast)</label>
                        <select
                          value={targetColumn}
                          onChange={(e) => setTargetColumn(e.target.value)}
                          className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                        >
                          <option value="">Select column...</option>
                          {selectedSource.columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Date Column</label>
                        <select
                          value={dateColumn}
                          onChange={(e) => setDateColumn(e.target.value)}
                          className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                        >
                          <option value="">Select column...</option>
                          <option value="date">date</option>
                          <option value="created_at">created_at</option>
                          <option value="period">period</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!dataSource || !targetColumn || !dateColumn}
                      className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors flex items-center gap-2"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Configuration */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Forecast Configuration</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">Forecast Horizon</label>
                      <div className="flex gap-2">
                        {HORIZON_OPTIONS.map((h) => (
                          <button
                            key={h}
                            onClick={() => setHorizon(h as 3 | 6 | 12)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              horizon === h
                                ? "bg-accent text-white"
                                : "bg-surface-3 text-muted hover:bg-surface-4"
                            }`}
                          >
                            {h} months
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">Confidence Level</label>
                      <div className="flex gap-2">
                        {CONFIDENCE_OPTIONS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setConfidence(c as 95 | 90 | 80)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              confidence === c
                                ? "bg-accent text-white"
                                : "bg-surface-3 text-muted hover:bg-surface-4"
                            }`}
                          >
                            {c}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">Seasonality</label>
                      <select
                        value={seasonality}
                        onChange={(e) => setSeasonality(e.target.value)}
                        className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                      >
                        {SEASONALITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-surface-3/50 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted">
                      <span className="text-white font-medium">Configuration Summary:</span>{" "}
                      Forecasting <span className="text-accent font-medium">{targetColumn}</span> from{" "}
                      <span className="text-accent font-medium">{selectedSource?.name}</span> for{" "}
                      <span className="text-accent font-medium">{horizon} months</span> at{" "}
                      <span className="text-accent font-medium">{confidence}% confidence</span> with{" "}
                      <span className="text-accent font-medium">{seasonality}</span> seasonality.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 rounded-lg bg-surface-3 text-white font-medium text-sm hover:bg-surface-4 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors flex items-center gap-2"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Model Selection */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Model Selection</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODEL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setModel(opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          model === opt.value
                            ? "border-accent bg-accent/10"
                            : "border-border bg-surface-3 hover:border-surface-5"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <opt.icon className="w-5 h-5 text-accent" />
                          <span className="font-medium text-white">{opt.label}</span>
                          {opt.value === "auto" && (
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs font-medium border border-violet-500/30">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted ml-8">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {model === "auto" && (
                    <div className="bg-surface-3/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium text-white">Auto-Selection Preview</span>
                      </div>
                      <p className="text-xs text-muted">
                        The auto-selector will train ARIMA, Exponential Smoothing, and Linear Regression models,
                        then compare backtest RMSE across 5 folds to recommend the best performer.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-lg bg-surface-3 text-white font-medium text-sm hover:bg-surface-4 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors flex items-center gap-2"
                    >
                      Review & Run <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Run */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Review & Execute</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Data Source</p>
                      <p className="text-sm font-medium text-white">{selectedSource?.name}</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Target</p>
                      <p className="text-sm font-medium text-white">{targetColumn}</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Horizon</p>
                      <p className="text-sm font-medium text-white">{horizon} months</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Model</p>
                      <p className="text-sm font-medium text-white">
                        {MODEL_OPTIONS.find((m) => m.value === model)?.label}
                      </p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Confidence</p>
                      <p className="text-sm font-medium text-white">{confidence}%</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Seasonality</p>
                      <p className="text-sm font-medium text-white capitalize">{seasonality}</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Date Column</p>
                      <p className="text-sm font-medium text-white">{dateColumn}</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted mb-1">Frequency</p>
                      <p className="text-sm font-medium text-white">Monthly</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 rounded-lg bg-surface-3 text-white font-medium text-sm hover:bg-surface-4 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRunForecast}
                      disabled={isRunning}
                      className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm disabled:opacity-60 hover:from-violet-500 hover:to-purple-500 transition-all flex items-center gap-2"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running forecast...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Forecast
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            {/* Chart */}
            <div className="bg-surface-2 border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {targetColumn.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Forecast
                </h2>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-blue-400 rounded" />
                    <span className="text-muted">Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-purple-400 rounded border-dashed" style={{ borderTop: "2px dashed #a78bfa", height: 0, width: 12 }} />
                    <span className="text-muted">Predicted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500/20 rounded" />
                    <span className="text-muted">Confidence Band ({confidence}%)</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#confidenceGradient)"
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="white"
                      fillOpacity={0}
                      name="Lower Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="none"
                      dot={false}
                      name="Actual"
                      connectNulls={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="none"
                      dot={false}
                      name="Predicted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics + Model Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Metrics Cards */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Backtest Metrics</h3>
                {resultMetrics && (
                  <>
                    <div className="bg-surface-2 border border-border rounded-xl p-4">
                      <p className="text-xs text-muted mb-1">RMSE</p>
                      <p className="text-xl font-bold text-white">{resultMetrics.rmse.toLocaleString()}</p>
                      <p className="text-xs text-muted mt-1">Root Mean Square Error</p>
                    </div>
                    <div className="bg-surface-2 border border-border rounded-xl p-4">
                      <p className="text-xs text-muted mb-1">MAPE</p>
                      <p className="text-xl font-bold text-white">{resultMetrics.mape}%</p>
                      <p className="text-xs text-muted mt-1">Mean Absolute Percentage Error</p>
                    </div>
                    <div className="bg-surface-2 border border-border rounded-xl p-4">
                      <p className="text-xs text-muted mb-1">R² Score</p>
                      <p className="text-xl font-bold text-white">{resultMetrics.r2}</p>
                      <p className="text-xs text-muted mt-1">Coefficient of Determination</p>
                    </div>
                    <div className="bg-surface-2 border border-border rounded-xl p-4">
                      <p className="text-xs text-muted mb-1">MAE</p>
                      <p className="text-xl font-bold text-white">{resultMetrics.mae.toLocaleString()}</p>
                      <p className="text-xs text-muted mt-1">Mean Absolute Error</p>
                    </div>
                  </>
                )}
              </div>

              {/* Model Comparison Table */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-white mb-4">Model Comparison</h3>
                <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Model</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted">RMSE</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted">MAPE</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted">R²</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Train Time</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelComparison.map((m) => (
                        <tr key={m.model} className="border-b border-border last:border-0 hover:bg-surface-3/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-white">{m.model}</td>
                          <td className="px-4 py-3 text-sm text-right text-white">{m.rmse.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-white">{m.mape}%</td>
                          <td className="px-4 py-3 text-sm text-right text-white">{m.r2}</td>
                          <td className="px-4 py-3 text-sm text-right text-muted">{m.trainingTimeMs}ms</td>
                          <td className="px-4 py-3 text-center">
                            {m.recommended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 text-xs font-medium border border-violet-500/30">
                                <Sparkles className="w-3 h-3" />
                                Auto-selected
                              </span>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-white">Recent Forecast Jobs</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Model</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Target</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Horizon</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Created</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted">Metrics</th>
              </tr>
            </thead>
            <tbody>
              {SEEDED_JOBS.map((job) => {
                const statusConf = STATUS_CONFIG[job.status];
                return (
                  <tr key={job.id} className="border-b border-border last:border-0 hover:bg-surface-3/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-white">{job.name}</td>
                    <td className="px-6 py-3 text-sm text-muted">{job.model}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded bg-surface-4 text-xs text-muted font-mono">
                        {job.targetColumn}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted">{job.horizon}mo</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusConf.color}`}>
                        <statusConf.icon className="w-3.5 h-3.5" />
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted">{job.createdAt}</td>
                    <td className="px-6 py-3 text-right">
                      {job.metrics && (
                        <span className="text-xs text-muted">
                          R²={job.metrics.r2} | MAPE={job.metrics.mape}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Database(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
