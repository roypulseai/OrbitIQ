"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Target,
  Award,
  Timer,
  ArrowUpCircle,
  Archive,
  Sparkles,
  BarChart3,
} from "lucide-react";

const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const ScatterChart = dynamic(() => import("recharts").then(m => m.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import("recharts").then(m => m.Scatter), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });

interface FeatureImp {
  feature: string;
  importance: number;
  direction?: string;
}

interface MLModelData {
  id: string;
  name: string;
  algorithm: string;
  metrics: Record<string, number>;
  trainingTimeMs: number;
  featuresImportance: FeatureImp[];
}

interface ExperimentData {
  id: string;
  name: string;
  status: string;
  taskType: string;
  models: MLModelData[];
  targetColumn?: string;
  features: string[];
  createdAt: string;
  completedAt?: string;
}

interface ClusteringData {
  id: string;
  name: string;
  nClusters: number;
  silhouetteScore: number;
  daviesBouldinIndex: number;
  totalPoints: number;
  clusterDistribution: Record<number, number>;
  labels: number[];
}

interface RegistryEntry {
  id: string;
  modelId: string;
  name: string;
  version: string;
  stage: string;
  accuracy: number;
  f1Score: number;
  registeredAt: string;
  description?: string;
}

const CLUSTER_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

const SEEDED_EXPERIMENTS: ExperimentData[] = [
  {
    id: "ml-exp-001",
    name: "Customer Churn Classification",
    status: "completed",
    taskType: "classification",
    targetColumn: "churned",
    features: ["tenure", "monthly_charges", "total_charges", "contract_type"],
    createdAt: "5 days ago",
    completedAt: "5 days ago",
    models: [
      {
        id: "model-clf-0",
        name: "Logistic Regression",
        algorithm: "logistic_regression",
        metrics: { accuracy: 0.818, precision: 0.792, recall: 0.756, f1: 0.784, auc_roc: 0.857 },
        trainingTimeMs: 287,
        featuresImportance: [
          { feature: "contract_type", importance: 0.352, direction: "negative" },
          { feature: "tenure", importance: 0.281, direction: "negative" },
          { feature: "monthly_charges", importance: 0.218, direction: "positive" },
          { feature: "total_charges", importance: 0.149, direction: "positive" },
        ],
      },
      {
        id: "model-clf-1",
        name: "Random Forest",
        algorithm: "random_forest",
        metrics: { accuracy: 0.878, precision: 0.861, recall: 0.842, f1: 0.851, auc_roc: 0.913 },
        trainingTimeMs: 1842,
        featuresImportance: [
          { feature: "total_charges", importance: 0.318, direction: "positive" },
          { feature: "tenure", importance: 0.274, direction: "negative" },
          { feature: "monthly_charges", importance: 0.231, direction: "positive" },
          { feature: "contract_type", importance: 0.177, direction: "negative" },
        ],
      },
      {
        id: "model-clf-2",
        name: "XGBoost",
        algorithm: "xgboost",
        metrics: { accuracy: 0.912, precision: 0.894, recall: 0.871, f1: 0.882, auc_roc: 0.951 },
        trainingTimeMs: 2356,
        featuresImportance: [
          { feature: "contract_type", importance: 0.338, direction: "negative" },
          { feature: "tenure", importance: 0.267, direction: "negative" },
          { feature: "total_charges", importance: 0.221, direction: "positive" },
          { feature: "monthly_charges", importance: 0.174, direction: "positive" },
        ],
      },
      {
        id: "model-clf-3",
        name: "Gradient Boosting",
        algorithm: "gradient_boosting",
        metrics: { accuracy: 0.891, precision: 0.873, recall: 0.854, f1: 0.863, auc_roc: 0.932 },
        trainingTimeMs: 2078,
        featuresImportance: [
          { feature: "contract_type", importance: 0.341, direction: "negative" },
          { feature: "monthly_charges", importance: 0.263, direction: "positive" },
          { feature: "tenure", importance: 0.228, direction: "negative" },
          { feature: "total_charges", importance: 0.168, direction: "positive" },
        ],
      },
    ],
  },
  {
    id: "ml-exp-002",
    name: "Revenue Prediction",
    status: "completed",
    taskType: "regression",
    targetColumn: "revenue",
    features: ["marketing_spend", "num_sales", "avg_order_value"],
    createdAt: "10 days ago",
    completedAt: "10 days ago",
    models: [
      {
        id: "model-reg-0",
        name: "Linear Regression",
        algorithm: "linear_regression",
        metrics: { rmse: 7.62, mae: 5.31, r2: 0.782, mape: 8.14 },
        trainingTimeMs: 98,
        featuresImportance: [
          { feature: "num_sales", importance: 0.412, direction: "positive" },
          { feature: "avg_order_value", importance: 0.354, direction: "positive" },
          { feature: "marketing_spend", importance: 0.234, direction: "positive" },
        ],
      },
      {
        id: "model-reg-1",
        name: "Random Forest",
        algorithm: "random_forest",
        metrics: { rmse: 3.81, mae: 2.64, r2: 0.942, mape: 3.87 },
        trainingTimeMs: 1587,
        featuresImportance: [
          { feature: "marketing_spend", importance: 0.398, direction: "positive" },
          { feature: "num_sales", importance: 0.341, direction: "positive" },
          { feature: "avg_order_value", importance: 0.261, direction: "positive" },
        ],
      },
      {
        id: "model-reg-2",
        name: "XGBoost",
        algorithm: "xgboost",
        metrics: { rmse: 4.18, mae: 2.93, r2: 0.921, mape: 4.52 },
        trainingTimeMs: 2198,
        featuresImportance: [
          { feature: "marketing_spend", importance: 0.405, direction: "positive" },
          { feature: "avg_order_value", importance: 0.328, direction: "positive" },
          { feature: "num_sales", importance: 0.267, direction: "positive" },
        ],
      },
    ],
  },
];

const CLUSTERING_LABELS: number[] = [];
const CLUSTER_DIST: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
for (let i = 0; i < 100; i++) {
  const c = Math.floor(Math.sin(i * 0.8) * 2 + 2) % 4;
  CLUSTERING_LABELS.push(c);
  CLUSTER_DIST[c]++;
}
const CLUSTER_SCATTER = CLUSTERING_LABELS.map((label, i) => ({
  x: Math.sin(i * 0.3 + label * 2) * 30 + label * 25 + 50,
  y: Math.cos(i * 0.25 + label * 1.5) * 25 + label * 20 + 40,
  z: 8,
  cluster: label,
}));

const SEEDED_CLUSTERING: ClusteringData[] = [
  {
    id: "cluster-001",
    name: "Customer Segmentation",
    nClusters: 4,
    silhouetteScore: 0.62,
    daviesBouldinIndex: 1.35,
    totalPoints: 100,
    clusterDistribution: CLUSTER_DIST,
    labels: CLUSTERING_LABELS,
  },
];

const SEEDED_REGISTRY: RegistryEntry[] = [
  {
    id: "reg-001",
    modelId: "model-clf-2",
    name: "Churn Predictor v2.1",
    version: "2.1.0",
    stage: "production",
    accuracy: 0.91,
    f1Score: 0.88,
    registeredAt: "3 days ago",
    description: "XGBoost classifier for customer churn prediction. Trained on 50k records with 4 features.",
  },
  {
    id: "reg-002",
    modelId: "model-reg-1",
    name: "Revenue Forecaster v1.0",
    version: "1.0.0",
    stage: "staging",
    accuracy: 0.94,
    f1Score: 0.92,
    registeredAt: "7 days ago",
    description: "Random Forest regressor for revenue prediction. 3 features, 100k training records.",
  },
  {
    id: "reg-003",
    modelId: "cluster-001",
    name: "Customer Segments v1.0",
    version: "1.0.0",
    stage: "production",
    accuracy: 0.62,
    f1Score: 0,
    registeredAt: "14 days ago",
    description: "K-Means clustering model for customer segmentation. Auto-selected K=4.",
  },
];

type Tab = "experiments" | "clustering" | "registry";

const STATUS_ICON: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-emerald-400", label: "Completed" },
  training: { icon: Loader2, color: "text-blue-400", label: "Training" },
  pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
  failed: { icon: AlertCircle, color: "text-red-400", label: "Failed" },
};

const STAGE_STYLE: Record<string, string> = {
  production: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  staging: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  archived: "bg-surface-4 text-muted border-border",
};

export default function MLPage() {
  const [activeTab, setActiveTab] = useState<Tab>("experiments");
  const [expandedExperiment, setExpandedExperiment] = useState<string | null>(null);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [registry, setRegistry] = useState<RegistryEntry[]>(SEEDED_REGISTRY);

  const totalModels = SEEDED_EXPERIMENTS.reduce((sum, e) => sum + e.models.length, 0);
  const productionModels = registry.filter((r) => r.stage === "production").length;
  const bestAccuracy = registry.reduce((max, r) => Math.max(max, r.accuracy), 0);
  const avgTrainingTime = Math.round(
    SEEDED_EXPERIMENTS.reduce(
      (sum, e) => sum + e.models.reduce((s, m) => s + m.trainingTimeMs, 0) / e.models.length,
      0,
    ) / SEEDED_EXPERIMENTS.length,
  );

  const handlePromote = (id: string) => {
    setRegistry((prev) =>
      prev.map((r) => (r.id === id ? { ...r, stage: "production" } : r)),
    );
  };

  const handleArchive = (id: string) => {
    setRegistry((prev) =>
      prev.map((r) => (r.id === id ? { ...r, stage: "archived" } : r)),
    );
  };

  return (
    <div className="min-h-screen bg-surface-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Machine Learning</h1>
              <p className="text-sm text-muted">AutoML-lite with model registry</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-muted">Total Models</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalModels}</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted">Production Models</span>
            </div>
            <p className="text-2xl font-bold text-white">{productionModels}</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-muted">Best Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-white">{(bestAccuracy * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted">Avg Training Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{(avgTrainingTime / 1000).toFixed(1)}s</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-2 rounded-lg p-1 border border-border w-fit">
          {([
            { key: "experiments" as Tab, label: "Experiments" },
            { key: "clustering" as Tab, label: "Clustering" },
            { key: "registry" as Tab, label: "Model Registry" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-accent text-white"
                  : "text-muted hover:text-white hover:bg-surface-3"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Experiments Tab */}
        {activeTab === "experiments" && (
          <div className="space-y-4">
            {SEEDED_EXPERIMENTS.map((exp) => {
              const isExpanded = expandedExperiment === exp.id;
              const statusInfo = STATUS_ICON[exp.status] || STATUS_ICON.pending;
              const bestModel = exp.models.reduce((best, m) => {
                const metric = exp.taskType === "classification" ? m.metrics.accuracy : m.metrics.r2;
                const bestMetric = exp.taskType === "classification" ? best.metrics.accuracy : best.metrics.r2;
                return metric > bestMetric ? m : best;
              }, exp.models[0]);

              return (
                <div key={exp.id} className="bg-surface-2 border border-border rounded-xl overflow-hidden">
                  {/* Experiment Header */}
                  <button
                    onClick={() => setExpandedExperiment(isExpanded ? null : exp.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-surface-3/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        exp.taskType === "classification"
                          ? "bg-blue-500/15"
                          : "bg-emerald-500/15"
                      }`}>
                        {exp.taskType === "classification" ? (
                          <Target className="w-5 h-5 text-blue-400" />
                        ) : (
                          <BarChart3 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{exp.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            exp.taskType === "classification"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          }`}>
                            {exp.taskType}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          {exp.models.length} models &middot; Target: {exp.targetColumn} &middot; {exp.features.length} features
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusInfo.color}`}>
                        <statusInfo.icon className={`w-3.5 h-3.5 ${exp.status === "training" ? "animate-spin" : ""}`} />
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-muted">Best: {bestModel.name}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Model Leaderboard */}
                      <div className="px-5 py-4">
                        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                          Model Leaderboard
                        </h4>
                        <div className="bg-surface-3/50 rounded-lg border border-border overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted">Algorithm</th>
                                {exp.taskType === "classification" ? (
                                  <>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">Accuracy</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">Precision</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">Recall</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">F1</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">AUC-ROC</th>
                                  </>
                                ) : (
                                  <>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">RMSE</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">MAE</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">R2</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">MAPE</th>
                                  </>
                                )}
                                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted">Train Time</th>
                                <th className="px-4 py-2.5"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {exp.models.map((model) => {
                                const isExpandedModel = expandedModel === model.id;
                                const isBest = model.id === bestModel.id;

                                return (
                                  <>
                                    <tr
                                      key={model.id}
                                      className={`border-b border-border last:border-0 hover:bg-surface-4/50 transition-colors ${
                                        isBest ? "bg-indigo-500/5" : ""
                                      }`}
                                    >
                                      <td className="px-4 py-3 text-sm font-medium text-white">
                                        <div className="flex items-center gap-2">
                                          {model.name}
                                          {isBest && (
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                          )}
                                        </div>
                                      </td>
                                      {exp.taskType === "classification" ? (
                                        <>
                                          <td className="px-4 py-3 text-sm text-right text-white">{(model.metrics.accuracy * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-3 text-sm text-right text-muted">{(model.metrics.precision * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-3 text-sm text-right text-muted">{(model.metrics.recall * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-3 text-sm text-right text-white font-medium">{(model.metrics.f1 * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-3 text-sm text-right text-muted">{(model.metrics.auc_roc * 100).toFixed(1)}%</td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="px-4 py-3 text-sm text-right text-white">{model.metrics.rmse.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-sm text-right text-muted">{model.metrics.mae.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-sm text-right text-white font-medium">{model.metrics.r2.toFixed(3)}</td>
                                          <td className="px-4 py-3 text-sm text-right text-muted">{model.metrics.mape.toFixed(2)}%</td>
                                        </>
                                      )}
                                      <td className="px-4 py-3 text-sm text-right text-muted">{model.trainingTimeMs}ms</td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => setExpandedModel(isExpandedModel ? null : model.id)}
                                          className="text-xs text-accent hover:text-accent/80 transition-colors"
                                        >
                                          {isExpandedModel ? "Hide SHAP" : "Show SHAP"}
                                        </button>
                                      </td>
                                    </tr>
                                    {isExpandedModel && (
                                      <tr key={`${model.id}-shap`}>
                                        <td colSpan={exp.taskType === "classification" ? 7 : 6} className="px-4 py-4 bg-surface-4/30">
                                          <div className="space-y-3">
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                                              Feature Importance (SHAP-like)
                                            </p>
                                            <div className="h-[140px]">
                                              <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                  data={model.featuresImportance}
                                                  layout="vertical"
                                                  margin={{ top: 0, right: 20, left: 80, bottom: 0 }}
                                                >
                                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                                  <XAxis
                                                    type="number"
                                                    domain={[0, 0.5]}
                                                    stroke="#64748b"
                                                    fontSize={11}
                                                    tickLine={false}
                                                  />
                                                  <YAxis
                                                    type="category"
                                                    dataKey="feature"
                                                    stroke="#64748b"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    width={75}
                                                  />
                                                  <Tooltip
                                                    contentStyle={{
                                                      backgroundColor: "#1e293b",
                                                      border: "1px solid #334155",
                                                      borderRadius: "8px",
                                                      fontSize: "12px",
                                                    }}
                                                    formatter={(value: any, _name: any, props: any) => [
                                                      `${(Number(value) * 100).toFixed(1)}% (${(props?.payload as FeatureImp)?.direction || "unknown"})`,
                                                      "Importance",
                                                    ]}
                                                  />
                                                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                                                    {model.featuresImportance.map((fi, idx) => (
                                                      <Cell
                                                        key={idx}
                                                        fill={
                                                          fi.direction === "positive"
                                                            ? "#6366f1"
                                                            : fi.direction === "negative"
                                                            ? "#ef4444"
                                                            : "#64748b"
                                                        }
                                                      />
                                                    ))}
                                                  </Bar>
                                                </BarChart>
                                              </ResponsiveContainer>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted">
                                              <div className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                                                Positive direction
                                              </div>
                                              <div className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                                                Negative direction
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Clustering Tab */}
        {activeTab === "clustering" && (
          <div className="space-y-6">
            {/* Clustering Setup */}
            <div className="bg-surface-2 border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Clustering Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Dataset</label>
                  <select className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/50">
                    <option>customers_db</option>
                    <option>sales_db</option>
                    <option>analytics_db</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Features</label>
                  <select className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/50" multiple>
                    <option selected>tenure</option>
                    <option selected>monthly_charges</option>
                    <option>total_charges</option>
                    <option>contract_type</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 bg-surface-3 border border-border rounded-lg px-4 py-2 w-full cursor-pointer hover:bg-surface-4 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border accent-indigo-500" />
                    <div>
                      <span className="text-sm font-medium text-white">Auto-detect K</span>
                      <p className="text-xs text-muted">Test K=2..10, pick best silhouette</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Results */}
            {SEEDED_CLUSTERING.map((cluster) => {
              const distData = Object.entries(cluster.clusterDistribution).map(([k, v]) => ({
                cluster: `Cluster ${k}`,
                count: v,
              }));

              return (
                <div key={cluster.id} className="space-y-4">
                  {/* Cluster Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-2 border border-border rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-muted">Optimal K</span>
                      </div>
                      <p className="text-3xl font-bold text-white">{cluster.nClusters}</p>
                      <p className="text-xs text-muted mt-1">clusters selected</p>
                    </div>
                    <div className="bg-surface-2 border border-border rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-muted">Silhouette Score</span>
                      </div>
                      <p className="text-3xl font-bold text-white">{cluster.silhouetteScore.toFixed(2)}</p>
                      <p className="text-xs text-muted mt-1">0.4-0.8 range</p>
                    </div>
                    <div className="bg-surface-2 border border-border rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-violet-400" />
                        <span className="text-xs text-muted">Davies-Bouldin Index</span>
                      </div>
                      <p className="text-3xl font-bold text-white">{cluster.daviesBouldinIndex.toFixed(2)}</p>
                      <p className="text-xs text-muted mt-1">lower is better</p>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Cluster Distribution */}
                    <div className="bg-surface-2 border border-border rounded-xl p-5">
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
                        Cluster Distribution
                      </h4>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="cluster" stroke="#64748b" fontSize={11} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                fontSize: "12px",
                              }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {distData.map((_entry, idx) => (
                                <Cell key={idx} fill={CLUSTER_COLORS[idx % CLUSTER_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Scatter Plot */}
                    <div className="bg-surface-2 border border-border rounded-xl p-5">
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
                        Cluster Visualization
                      </h4>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" dataKey="x" stroke="#64748b" fontSize={11} tickLine={false} name="Dim 1" />
                            <YAxis type="number" dataKey="y" stroke="#64748b" fontSize={11} tickLine={false} name="Dim 2" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                fontSize: "12px",
                              }}
                              formatter={(_value: any, name: any) => {
                                if (name === "cluster") return ["Cluster " + _value, name];
                                return [_value, name];
                              }}
                            />
                            <Scatter data={CLUSTER_SCATTER} fill="#8884d8">
                              {CLUSTER_SCATTER.map((entry, idx) => (
                                <Cell key={idx} fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]} />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Model Registry Tab */}
        {activeTab === "registry" && (
          <div className="space-y-4">
            <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Version</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Stage</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted">Accuracy</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted">F1 / Metric</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted">Registered</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registry.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-surface-3/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{entry.name}</p>
                          {entry.description && (
                            <p className="text-xs text-muted mt-0.5 line-clamp-1">{entry.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-surface-4 text-xs text-muted font-mono">
                          {entry.version}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          STAGE_STYLE[entry.stage] || STAGE_STYLE.archived
                        }`}>
                          {entry.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-white font-medium">
                        {(entry.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-muted">
                        {entry.f1Score > 0 ? `${(entry.f1Score * 100).toFixed(1)}%` : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{entry.registeredAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {entry.stage !== "production" && entry.stage !== "archived" && (
                            <button
                              onClick={() => handlePromote(entry.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                            >
                              <ArrowUpCircle className="w-3 h-3" />
                              Promote
                            </button>
                          )}
                          {entry.stage !== "archived" && (
                            <button
                              onClick={() => handleArchive(entry.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-4 text-muted text-xs font-medium hover:bg-surface-5 transition-colors border border-border"
                            >
                              <Archive className="w-3 h-3" />
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
