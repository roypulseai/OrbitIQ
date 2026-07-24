import { Injectable } from "@nestjs/common";

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction?: "positive" | "negative";
}

export interface MLModel {
  id: string;
  name: string;
  algorithm:
    | "logistic_regression"
    | "random_forest"
    | "xgboost"
    | "gradient_boosting"
    | "svm"
    | "kmeans"
    | "dbscan"
    | "linear_regression";
  metrics: Record<string, number>;
  trainingTimeMs: number;
  featuresImportance: FeatureImportance[];
}

export interface MLExperiment {
  id: string;
  name: string;
  status: "pending" | "training" | "completed" | "failed";
  taskType: "classification" | "regression" | "clustering";
  models: MLModel[];
  dataset: string;
  targetColumn?: string;
  features: string[];
  createdAt: number;
  completedAt?: number;
}

export interface ClusteringResult {
  id: string;
  name: string;
  nClusters: number;
  silhouetteScore: number;
  daviesBouldinIndex: number;
  clusterCentroids: number[][];
  labels: number[];
  clusterDistribution: Record<number, number>;
}

export interface MLModelRegistry {
  id: string;
  modelId: string;
  name: string;
  version: string;
  stage: "staging" | "production" | "archived";
  metrics: Record<string, number>;
  registeredAt: number;
  description?: string;
}

@Injectable()
export class MLService {
  private experiments: MLExperiment[] = [];
  private clusteringResults: ClusteringResult[] = [];
  private modelRegistry: MLModelRegistry[] = [];

  constructor() {
    this.seedData();
  }

  private generateFeatureImportance(
    features: string[],
    seed: number,
  ): FeatureImportance[] {
    const directions: ("positive" | "negative")[] = ["positive", "negative"];
    let total = 0;
    const raw = features.map((f, i) => {
      const val =
        Math.round(
          (0.15 + Math.sin(seed + i * 2.1) * 0.3 + Math.cos(seed + i * 1.3) * 0.2) *
            1000,
        ) / 1000;
      total += Math.abs(val);
      return { feature: f, raw: Math.abs(val) };
    });
    return raw
      .map((r) => ({
        feature: r.feature,
        importance: Math.round((r.raw / total) * 1000) / 1000,
        direction: directions[
          Math.round(Math.abs(Math.sin(seed + r.raw * 100))) % 2
        ] as "positive" | "negative",
      }))
      .sort((a, b) => b.importance - a.importance);
  }

  private generateClassificationModels(features: string[]): MLModel[] {
    const algorithms: {
      name: string;
      algo: MLModel["algorithm"];
      accBase: number;
      f1Base: number;
      timeBase: number;
    }[] = [
      {
        name: "Logistic Regression",
        algo: "logistic_regression",
        accBase: 0.82,
        f1Base: 0.79,
        timeBase: 320,
      },
      {
        name: "Random Forest",
        algo: "random_forest",
        accBase: 0.88,
        f1Base: 0.85,
        timeBase: 1800,
      },
      {
        name: "XGBoost",
        algo: "xgboost",
        accBase: 0.91,
        f1Base: 0.88,
        timeBase: 2400,
      },
      {
        name: "Gradient Boosting",
        algo: "gradient_boosting",
        accBase: 0.89,
        f1Base: 0.86,
        timeBase: 2100,
      },
    ];
    return algorithms.map((a, i) => ({
      id: `model-clf-${i}`,
      name: a.name,
      algorithm: a.algo,
      metrics: {
        accuracy:
          Math.round((a.accBase + Math.sin(i * 1.7) * 0.03) * 1000) / 1000,
        precision:
          Math.round((a.accBase - 0.03 + Math.sin(i * 2.1) * 0.02) * 1000) /
          1000,
        recall:
          Math.round((a.accBase - 0.06 + Math.cos(i * 1.3) * 0.03) * 1000) /
          1000,
        f1:
          Math.round((a.f1Base + Math.sin(i * 0.9) * 0.02) * 1000) / 1000,
        auc_roc:
          Math.round((a.accBase + 0.04 + Math.sin(i * 1.1) * 0.02) * 1000) /
          1000,
      },
      trainingTimeMs: Math.round(a.timeBase + Math.sin(i * 3.2) * 400),
      featuresImportance: this.generateFeatureImportance(features, i * 10),
    }));
  }

  private generateRegressionModels(features: string[]): MLModel[] {
    const algorithms: {
      name: string;
      algo: MLModel["algorithm"];
      rmseBase: number;
      r2Base: number;
      timeBase: number;
    }[] = [
      {
        name: "Linear Regression",
        algo: "linear_regression",
        rmseBase: 7.2,
        r2Base: 0.78,
        timeBase: 120,
      },
      {
        name: "Random Forest",
        algo: "random_forest",
        rmseBase: 3.8,
        r2Base: 0.94,
        timeBase: 1600,
      },
      {
        name: "XGBoost",
        algo: "xgboost",
        rmseBase: 4.1,
        r2Base: 0.92,
        timeBase: 2200,
      },
    ];
    return algorithms.map((a, i) => ({
      id: `model-reg-${i}`,
      name: a.name,
      algorithm: a.algo,
      metrics: {
        rmse:
          Math.round((a.rmseBase + Math.sin(i * 1.5) * 0.8) * 100) / 100,
        mae:
          Math.round((a.rmseBase * 0.7 + Math.cos(i * 2.1) * 0.5) * 100) /
          100,
        r2:
          Math.round((a.r2Base + Math.sin(i * 0.8) * 0.03) * 1000) / 1000,
        mape:
          Math.round((3.5 + Math.sin(i * 1.9) * 2.5) * 100) / 100,
      },
      trainingTimeMs: Math.round(a.timeBase + Math.cos(i * 2.7) * 300),
      featuresImportance: this.generateFeatureImportance(features, i * 20),
    }));
  }

  private seedData(): void {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const classificationFeatures = [
      "tenure",
      "monthly_charges",
      "total_charges",
      "contract_type",
    ];
    const regressionFeatures = [
      "marketing_spend",
      "num_sales",
      "avg_order_value",
    ];

    this.experiments.push({
      id: "ml-exp-001",
      name: "Customer Churn Classification",
      status: "completed",
      taskType: "classification",
      models: this.generateClassificationModels(classificationFeatures),
      dataset: "customers_db",
      targetColumn: "churned",
      features: classificationFeatures,
      createdAt: now - 5 * day,
      completedAt: now - 5 * day + 45000,
    });

    this.experiments.push({
      id: "ml-exp-002",
      name: "Revenue Prediction",
      status: "completed",
      taskType: "regression",
      models: this.generateRegressionModels(regressionFeatures),
      dataset: "sales_db",
      targetColumn: "revenue",
      features: regressionFeatures,
      createdAt: now - 10 * day,
      completedAt: now - 10 * day + 32000,
    });

    const labels: number[] = [];
    const dist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (let i = 0; i < 100; i++) {
      const cluster = Math.floor(Math.sin(i * 0.8) * 2 + 2) % 4;
      labels.push(cluster);
      dist[cluster] = (dist[cluster] || 0) + 1;
    }

    this.clusteringResults.push({
      id: "cluster-001",
      name: "Customer Segmentation",
      nClusters: 4,
      silhouetteScore: 0.62,
      daviesBouldinIndex: 1.35,
      clusterCentroids: [
        [12.5, 45.2, 280.0, 3],
        [36.8, 89.1, 950.0, 1],
        [24.3, 67.4, 520.0, 2],
        [8.1, 32.0, 150.0, 4],
      ],
      labels,
      clusterDistribution: dist,
    });

    this.modelRegistry.push({
      id: "reg-001",
      modelId: "model-clf-2",
      name: "Churn Predictor v2.1",
      version: "2.1.0",
      stage: "production",
      metrics: { accuracy: 0.91, f1: 0.88, auc_roc: 0.95 },
      registeredAt: now - 3 * day,
      description:
        "XGBoost classifier for customer churn prediction. Trained on 50k records with 4 features.",
    });

    this.modelRegistry.push({
      id: "reg-002",
      modelId: "model-reg-1",
      name: "Revenue Forecaster v1.0",
      version: "1.0.0",
      stage: "staging",
      metrics: { r2: 0.94, rmse: 3.8, mape: 4.1 },
      registeredAt: now - 7 * day,
      description:
        "Random Forest regressor for revenue prediction. 3 features, 100k training records.",
    });

    this.modelRegistry.push({
      id: "reg-003",
      modelId: "cluster-001",
      name: "Customer Segments v1.0",
      version: "1.0.0",
      stage: "production",
      metrics: { silhouette: 0.62, davies_bouldin: 1.35 },
      registeredAt: now - 14 * day,
      description:
        "K-Means clustering model for customer segmentation. Auto-selected K=4.",
    });
  }

  createExperiment(config: {
    name: string;
    taskType: string;
    dataset: string;
    targetColumn?: string;
    features: string[];
  }): MLExperiment {
    const id = `ml-exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const models =
      config.taskType === "classification"
        ? this.generateClassificationModels(config.features)
        : config.taskType === "regression"
          ? this.generateRegressionModels(config.features)
          : [];

    const experiment: MLExperiment = {
      id,
      name: config.name,
      status: "completed",
      taskType: config.taskType as MLExperiment["taskType"],
      models,
      dataset: config.dataset,
      targetColumn: config.targetColumn,
      features: config.features,
      createdAt: Date.now(),
      completedAt: Date.now() + 30000,
    };

    this.experiments.unshift(experiment);
    return experiment;
  }

  getExperiment(id: string): MLExperiment | undefined {
    return this.experiments.find((e) => e.id === id);
  }

  listExperiments(): MLExperiment[] {
    return this.experiments;
  }

  getModel(id: string): MLModel | undefined {
    for (const exp of this.experiments) {
      const model = exp.models.find((m) => m.id === id);
      if (model) return model;
    }
    return undefined;
  }

  runClustering(config: {
    name: string;
    dataset: string;
    features: string[];
    autoK: boolean;
  }): ClusteringResult {
    const bestK = config.autoK ? 3 + Math.floor(Math.random() * 3) : 4;
    const labels: number[] = [];
    const dist: Record<number, number> = {};
    for (let k = 0; k < bestK; k++) dist[k] = 0;
    for (let i = 0; i < 100; i++) {
      const cluster =
        Math.floor(Math.sin(i * (bestK * 0.3)) * (bestK / 2) + bestK / 2) %
        bestK;
      labels.push(cluster);
      dist[cluster] = (dist[cluster] || 0) + 1;
    }

    const result: ClusteringResult = {
      id: `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: config.name,
      nClusters: bestK,
      silhouetteScore:
        Math.round((0.4 + Math.random() * 0.4) * 1000) / 1000,
      daviesBouldinIndex:
        Math.round((0.8 + Math.random() * 1.7) * 100) / 100,
      clusterCentroids: Array.from({ length: bestK }, (_, i) =>
        config.features.map(
          (_, j) => Math.round((Math.sin(i + j) * 50 + 50) * 10) / 10,
        ),
      ),
      labels,
      clusterDistribution: dist,
    };

    this.clusteringResults.unshift(result);
    return result;
  }

  getClusteringResult(id: string): ClusteringResult | undefined {
    return this.clusteringResults.find((c) => c.id === id);
  }

  listClusteringResults(): ClusteringResult[] {
    return this.clusteringResults;
  }

  registerModel(config: {
    modelId: string;
    name: string;
    version: string;
    stage: string;
    metrics: Record<string, number>;
    description?: string;
  }): MLModelRegistry {
    const entry: MLModelRegistry = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      modelId: config.modelId,
      name: config.name,
      version: config.version,
      stage: config.stage as MLModelRegistry["stage"],
      metrics: config.metrics,
      registeredAt: Date.now(),
      description: config.description,
    };
    this.modelRegistry.unshift(entry);
    return entry;
  }

  getModelRegistry(): MLModelRegistry[] {
    return this.modelRegistry;
  }

  promoteModel(id: string, stage: string): MLModelRegistry | null {
    const entry = this.modelRegistry.find((e) => e.id === id);
    if (!entry) return null;
    entry.stage = stage as MLModelRegistry["stage"];
    return entry;
  }

  archiveModel(id: string): MLModelRegistry | null {
    const entry = this.modelRegistry.find((e) => e.id === id);
    if (!entry) return null;
    entry.stage = "archived";
    return entry;
  }

  getFeatureImportance(modelId: string): FeatureImportance[] {
    for (const exp of this.experiments) {
      const model = exp.models.find((m) => m.id === modelId);
      if (model) return model.featuresImportance;
    }
    return [];
  }
}
