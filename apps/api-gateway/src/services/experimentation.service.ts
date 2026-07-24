import { Injectable } from "@nestjs/common";

export interface TimelinePoint {
  date: string;
  controlValue: number;
  variantValue: number;
  cumulativeControl: number;
  cumulativeVariant: number;
  sampleSize: number;
}

export interface ExperimentReport {
  experimentId: string;
  name: string;
  status: string;
  hypothesis: string;
  targetMetric: string;
  duration: number;
  totalSampleSize: number;
  variants: Array<{
    name: string;
    metricValue: number;
    conversions: number;
    sampleSize: number;
    conversionRate: number;
  }>;
  winner?: string;
  pValue: number;
  power: number;
  confidenceInterval: [number, number];
  recommendations: string[];
  summary: string;
}

export interface SampleSizeParams {
  baselineRate: number;
  minimumDetectableEffect: number;
  significanceLevel: number;
  desiredPower: number;
}

@Injectable()
export class ExperimentationService {
  createExperiment(config: {
    name: string;
    hypothesis: string;
    experimentType: string;
    targetMetric: string;
    sampleSize: number;
    duration: number;
    variants: Array<{ name: string; description: string; trafficPercentage: number }>;
  }) {
    return {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...config,
      status: "draft",
      createdAt: new Date(),
    };
  }

  startExperiment(id: string): { id: string; status: string; startedAt: Date } {
    return { id, status: "running", startedAt: new Date() };
  }

  pauseExperiment(id: string): { id: string; status: string; pausedAt: Date } {
    return { id, status: "paused", pausedAt: new Date() };
  }

  getExperiment(id: string) {
    return { id, status: "running" };
  }

  calculateSampleSize(params: SampleSizeParams): {
    requiredSampleSize: number;
    totalSampleSize: number;
    estimatedDuration: number;
  } {
    const z_alpha = params.significanceLevel < 0.05 ? 1.96 : 1.645;
    const z_beta = 0.842;
    const p1 = params.baselineRate;
    const p2 = params.baselineRate + params.minimumDetectableEffect;
    const pAvg = (p1 + p2) / 2;

    const n = Math.ceil(
      (Math.pow(z_alpha * Math.sqrt(2 * pAvg * (1 - pAvg)) + z_beta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2)) /
        Math.pow(params.minimumDetectableEffect, 2),
    );

    return {
      requiredSampleSize: n,
      totalSampleSize: n * 2,
      estimatedDuration: Math.ceil((n * 2) / 1000),
    };
  }

  calculatePower(params: {
    sampleSize: number;
    effectSize: number;
    significanceLevel: number;
  }): number {
    const z = 1.96 * (params.significanceLevel < 0.05 ? 1 : 0.84);
    const ncp = params.effectSize * Math.sqrt(params.sampleSize / 2);
    const power = 1 - Math.exp(-0.5 * Math.pow(ncp - z, 2)) * 0.8;
    return Math.round(Math.min(0.99, Math.max(0.1, power)) * 1000) / 1000;
  }

  getExperimentTimeline(id: string): TimelinePoint[] {
    const points: TimelinePoint[] = [];
    const days = 14;
    let cumControl = 0;
    let cumVariant = 0;

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - i));
      const controlVal = 2.8 + Math.sin(i * 0.5) * 0.3 + (Math.random() - 0.5) * 0.2;
      const variantVal = 3.4 + Math.sin(i * 0.5) * 0.2 + (Math.random() - 0.5) * 0.25;
      cumControl += controlVal * 150;
      cumVariant += variantVal * 150;

      points.push({
        date: d.toISOString().slice(0, 10),
        controlValue: Math.round(controlVal * 100) / 100,
        variantValue: Math.round(variantVal * 100) / 100,
        cumulativeControl: Math.round(cumControl),
        cumulativeVariant: Math.round(cumVariant),
        sampleSize: 150 * (i + 1),
      });
    }

    return points;
  }

  generateReport(id: string): ExperimentReport {
    return {
      experimentId: id,
      name: "Experiment Report",
      status: "completed",
      hypothesis: "Test hypothesis for this experiment",
      targetMetric: "conversion_rate",
      duration: 14,
      totalSampleSize: 30000,
      variants: [
        { name: "Control", metricValue: 3.2, conversions: 640, sampleSize: 15000, conversionRate: 4.27 },
        { name: "Variant A", metricValue: 3.8, conversions: 760, sampleSize: 15000, conversionRate: 5.07 },
      ],
      winner: "Variant A",
      pValue: 0.032,
      power: 0.82,
      confidenceInterval: [0.1, 1.1],
      recommendations: [
        "The winning variant shows a statistically significant improvement",
        "Consider rolling out the winning variant to all users",
        "Monitor key metrics for 2 weeks after full deployment",
      ],
      summary: "Variant A outperformed the control with a 25% relative improvement in conversion rate (p = 0.032). The result is statistically significant at the 95% confidence level.",
    };
  }
}
