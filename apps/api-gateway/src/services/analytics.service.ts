import { Injectable } from "@nestjs/common";

export interface ForecastMetrics {
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
  backtestFolds: number;
}

export interface ForecastResult {
  dates: string[];
  actual: number[];
  predicted: number[];
  lowerBound: number[];
  upperBound: number[];
}

export interface ForecastJob {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  model: "arima" | "exponential_smoothing" | "prophet" | "linear" | "auto";
  dataSource: string;
  targetColumn: string;
  dateColumn: string;
  horizon: number;
  confidenceLevel: number;
  params: Record<string, any>;
  metrics?: ForecastMetrics;
  result?: ForecastResult;
  createdAt: number;
  completedAt?: number;
}

export interface ForecastConfig {
  dataSource: string;
  targetColumn: string;
  dateColumn: string;
  horizon: number;
  model: string;
  confidenceLevel?: number;
  seasonality?: string;
  frequency?: string;
}

export interface ModelComparisonResult {
  model: string;
  rmse: number;
  mape: number;
  r2: number;
  trainingTimeMs: number;
  recommended: boolean;
}

@Injectable()
export class AnalyticsService {
  private jobs: ForecastJob[] = [];

  constructor() {
    this.seedData();
  }

  private generateForecastData(
    targetColumn: string,
    horizon: number,
  ): { result: ForecastResult; metrics: ForecastMetrics } {
    const historical: number[] = [];
    const predicted: number[] = [];
    const lowerBound: number[] = [];
    const upperBound: number[] = [];
    const dates: string[] = [];
    const actual: number[] = [];

    let baseValue: number;
    let trend: number;
    let seasonalAmplitude: number;

    switch (targetColumn) {
      case "revenue":
        baseValue = 125000;
        trend = 4200;
        seasonalAmplitude = 15000;
        break;
      case "users":
        baseValue = 8500;
        trend = 320;
        seasonalAmplitude = 800;
        break;
      case "churn_rate":
        baseValue = 3.2;
        trend = -0.05;
        seasonalAmplitude = 0.3;
        break;
      default:
        baseValue = 50000;
        trend = 2000;
        seasonalAmplitude = 8000;
    }

    const startDate = new Date("2024-07-01");

    for (let i = 0; i < 24; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      dates.push(d.toISOString().slice(0, 7));

      const seasonal = seasonalAmplitude * Math.sin((2 * Math.PI * i) / 12);
      const noise = (Math.random() - 0.5) * seasonalAmplitude * 0.3;
      const value = baseValue + trend * i + seasonal + noise;
      historical.push(Math.round(value * 100) / 100);
    }

    const lastHistorical = historical[historical.length - 1];
    for (let i = 0; i < horizon; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + 24 + i);
      dates.push(d.toISOString().slice(0, 7));

      const seasonal = seasonalAmplitude * Math.sin((2 * Math.PI * (24 + i)) / 12);
      const predValue = lastHistorical + trend * (i + 1) * 0.8 + seasonal;
      predicted.push(Math.round(predValue * 100) / 100);

      const intervalWidth = (i + 1) * (targetColumn === "churn_rate" ? 0.08 : baseValue * 0.008);
      lowerBound.push(Math.round((predValue - intervalWidth * 1.96) * 100) / 100);
      upperBound.push(Math.round((predValue + intervalWidth * 1.96) * 100) / 100);
    }

    actual.push(...historical);
    for (let i = 0; i < horizon; i++) {
      actual.push(NaN);
    }

    const metrics: ForecastMetrics = {
      mae: Math.round((baseValue * (0.03 + Math.random() * 0.04)) * 100) / 100,
      rmse: Math.round((baseValue * (0.05 + Math.random() * 0.08)) * 100) / 100,
      mape: Math.round((3 + Math.random() * 5) * 100) / 100,
      r2: Math.round((0.85 + Math.random() * 0.12) * 1000) / 1000,
      backtestFolds: 5,
    };

    return {
      result: { dates, actual, predicted, lowerBound, upperBound },
      metrics,
    };
  }

  private seedData(): void {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const job1Data = this.generateForecastData("revenue", 12);
    this.jobs.push({
      id: "forecast-001",
      name: "Revenue Forecast - Next 12 Months",
      status: "completed",
      model: "auto",
      dataSource: "sales_db",
      targetColumn: "revenue",
      dateColumn: "order_date",
      horizon: 12,
      confidenceLevel: 0.95,
      params: { autoSelected: "arima", reason: "Lowest backtest RMSE across 5 folds" },
      metrics: job1Data.metrics,
      result: job1Data.result,
      createdAt: now - 3 * day,
      completedAt: now - 3 * day + 45000,
    });

    const job2Data = this.generateForecastData("users", 6);
    this.jobs.push({
      id: "forecast-002",
      name: "User Growth Projection",
      status: "completed",
      model: "linear",
      dataSource: "analytics_db",
      targetColumn: "users",
      dateColumn: "signup_date",
      horizon: 6,
      confidenceLevel: 0.90,
      params: { polynomialDegree: 1 },
      metrics: job2Data.metrics,
      result: job2Data.result,
      createdAt: now - 7 * day,
      completedAt: now - 7 * day + 12000,
    });

    const job3Data = this.generateForecastData("churn_rate", 3);
    this.jobs.push({
      id: "forecast-003",
      name: "Churn Rate Forecast",
      status: "completed",
      model: "exponential_smoothing",
      dataSource: "subscriptions_db",
      targetColumn: "churn_rate",
      dateColumn: "period",
      horizon: 3,
      confidenceLevel: 0.80,
      params: { smoothingLevel: 0.3, seasonalMethod: "additive" },
      metrics: job3Data.metrics,
      result: job3Data.result,
      createdAt: now - 14 * day,
      completedAt: now - 14 * day + 8500,
    });
  }

  createForecast(config: ForecastConfig): ForecastJob {
    const id = `forecast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const forecastData = this.generateForecastData(config.targetColumn, config.horizon);

    const job: ForecastJob = {
      id,
      name: `${config.targetColumn} Forecast - ${config.horizon} Periods`,
      status: "completed",
      model: config.model as ForecastJob["model"],
      dataSource: config.dataSource,
      targetColumn: config.targetColumn,
      dateColumn: config.dateColumn,
      horizon: config.horizon,
      confidenceLevel: config.confidenceLevel || 0.95,
      params: {
        seasonality: config.seasonality || "auto",
        frequency: config.frequency || "monthly",
      },
      metrics: forecastData.metrics,
      result: forecastData.result,
      createdAt: Date.now(),
      completedAt: Date.now() + 30000,
    };

    this.jobs.unshift(job);
    return job;
  }

  getJob(id: string): ForecastJob | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  listJobs(): ForecastJob[] {
    return this.jobs;
  }

  cancelJob(id: string): ForecastJob | null {
    const job = this.jobs.find((j) => j.id === id);
    if (!job) return null;
    if (job.status === "completed" || job.status === "failed") return job;
    job.status = "failed";
    return job;
  }

  getForecastResult(id: string): ForecastResult | null {
    const job = this.jobs.find((j) => j.id === id);
    return job?.result || null;
  }

  autoSelectModel(dataSource: string, targetColumn: string): string {
    const comparisons = this.getModelComparison(dataSource, targetColumn);
    const best = comparisons.sort((a, b) => a.rmse - b.rmse)[0];
    return best.model.toLowerCase().replace(" ", "_");
  }

  getModelComparison(dataSource: string, targetColumn: string): ModelComparisonResult[] {
    const base = targetColumn === "churn_rate" ? 0.3 : targetColumn === "users" ? 500 : 8000;

    return [
      {
        model: "ARIMA",
        rmse: Math.round((base * (0.06 + Math.random() * 0.02)) * 100) / 100,
        mape: Math.round((3.5 + Math.random() * 2) * 100) / 100,
        r2: Math.round((0.91 + Math.random() * 0.06) * 1000) / 1000,
        trainingTimeMs: Math.round(800 + Math.random() * 600),
        recommended: true,
      },
      {
        model: "Exponential Smoothing",
        rmse: Math.round((base * (0.07 + Math.random() * 0.03)) * 100) / 100,
        mape: Math.round((4.0 + Math.random() * 2.5) * 100) / 100,
        r2: Math.round((0.88 + Math.random() * 0.07) * 1000) / 1000,
        trainingTimeMs: Math.round(400 + Math.random() * 300),
        recommended: false,
      },
      {
        model: "Linear Regression",
        rmse: Math.round((base * (0.09 + Math.random() * 0.04)) * 100) / 100,
        mape: Math.round((5.0 + Math.random() * 3) * 100) / 100,
        r2: Math.round((0.82 + Math.random() * 0.1) * 1000) / 1000,
        trainingTimeMs: Math.round(50 + Math.random() * 80),
        recommended: false,
      },
    ];
  }
}
