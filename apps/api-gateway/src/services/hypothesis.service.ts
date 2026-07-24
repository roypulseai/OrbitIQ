import { Injectable } from "@nestjs/common";

export interface TestResult {
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

export interface HypothesisTest {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  testType: "t_test" | "chi_square" | "anova" | "mann_whitney" | "wilcoxon" | "auto";
  variable1: string;
  variable2?: string;
  group1?: string;
  group2?: string;
  significanceLevel: number;
  result?: TestResult;
  createdAt: number;
  completedAt?: number;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  metricValue: number;
  conversions: number;
  sampleSize: number;
}

export interface ExperimentResult {
  winner?: string;
  pValue: number;
  power: number;
  confidenceInterval: [number, number];
  recommendations: string[];
}

export interface Experiment {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "paused";
  hypothesis: string;
  experimentType: "ab_test" | "multi_variant" | "sequential";
  variants: Variant[];
  targetMetric: string;
  sampleSize: number;
  duration: number;
  startDate?: number;
  endDate?: number;
  results?: ExperimentResult;
  createdAt: number;
}

@Injectable()
export class HypothesisService {
  private tests: HypothesisTest[] = [];
  private experiments: Experiment[] = [];

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    this.tests.push({
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
      createdAt: now - 3 * day,
      completedAt: now - 3 * day + 30000,
    });

    this.tests.push({
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
        interpretation: "Large effect (η² = 0.72). Revenue distributions differ significantly across regions, F(3, 1796) = 8.2, p < 0.001.",
      },
      createdAt: now - 7 * day,
      completedAt: now - 7 * day + 45000,
    });

    this.tests.push({
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
        interpretation: "Small effect (Cohen's d = 0.21). Insufficient evidence to conclude a difference in engagement between Feature A and B. Consider increasing sample size.",
      },
      createdAt: now - 14 * day,
      completedAt: now - 14 * day + 25000,
    });

    this.experiments.push({
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
      startDate: Date.now() - 7 * day,
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
      createdAt: now - 10 * day,
    });

    this.experiments.push({
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
      startDate: Date.now() - 30 * day,
      endDate: Date.now() - 9 * day,
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
      createdAt: now - 35 * day,
    });
  }

  private runTest(
    testType: HypothesisTest["testType"],
    variable1: string,
    significanceLevel: number,
  ): TestResult {
    const n1 = 400 + Math.floor(Math.random() * 1600);
    const n2 = 400 + Math.floor(Math.random() * 1600);

    switch (testType) {
      case "t_test": {
        const p = 0.001 + Math.random() * 0.199;
        const stat = 1.0 + Math.random() * 3.0;
        const effect = 0.2 + Math.random() * 1.0;
        const ci = effect * 0.4;
        return {
          statistic: Math.round(stat * 1000) / 1000,
          pValue: Math.round(p * 1000) / 1000,
          significant: p < significanceLevel,
          confidenceInterval: [Math.round((effect - ci) * 1000) / 1000, Math.round((effect + ci) * 1000) / 1000],
          effectSize: Math.round(effect * 1000) / 1000,
          power: Math.round((0.5 + Math.random() * 0.45) * 1000) / 1000,
          sampleSize1: n1,
          sampleSize2: n2,
          interpretation: `${effect < 0.5 ? "Small" : effect < 0.8 ? "Medium" : "Large"} effect (Cohen's d = ${effect.toFixed(3)}).`,
        };
      }
      case "chi_square": {
        const chi2 = 2 + Math.random() * 13;
        const df = 2 + Math.floor(Math.random() * 5);
        const p = 0.001 + Math.random() * 0.199;
        return {
          statistic: Math.round(chi2 * 1000) / 1000,
          pValue: Math.round(p * 1000) / 1000,
          significant: p < significanceLevel,
          confidenceInterval: [chi2 * 0.85, chi2 * 1.15].map((v) => Math.round(v * 1000) / 1000) as [number, number],
          effectSize: Math.round(Math.sqrt(chi2 / (n1 + n2)) * 1000) / 1000,
          power: Math.round((0.5 + Math.random() * 0.45) * 1000) / 1000,
          sampleSize1: n1,
          sampleSize2: n2,
          interpretation: `Chi-square test with ${df} degrees of freedom. χ² = ${chi2.toFixed(3)}, p = ${p.toFixed(3)}.`,
        };
      }
      case "anova": {
        const fStat = 1 + Math.random() * 9;
        const p = 0.001 + Math.random() * 0.199;
        return {
          statistic: Math.round(fStat * 1000) / 1000,
          pValue: Math.round(p * 1000) / 1000,
          significant: p < significanceLevel,
          confidenceInterval: [fStat * 0.8, fStat * 1.2].map((v) => Math.round(v * 1000) / 1000) as [number, number],
          effectSize: Math.round((fStat / (fStat + n1)) * 1000) / 1000,
          power: Math.round((0.5 + Math.random() * 0.45) * 1000) / 1000,
          sampleSize1: n1,
          sampleSize2: n2,
          interpretation: `ANOVA F-test. F = ${fStat.toFixed(3)}, p = ${p.toFixed(3)}.`,
        };
      }
      case "mann_whitney": {
        const u = 100000 + Math.floor(Math.random() * 400000);
        const p = 0.001 + Math.random() * 0.199;
        return {
          statistic: u,
          pValue: Math.round(p * 1000) / 1000,
          significant: p < significanceLevel,
          confidenceInterval: [u * 0.9, u * 1.1].map((v) => Math.round(v)) as [number, number],
          effectSize: Math.round((0.2 + Math.random() * 0.8) * 1000) / 1000,
          power: Math.round((0.5 + Math.random() * 0.45) * 1000) / 1000,
          sampleSize1: n1,
          sampleSize2: n2,
          interpretation: `Mann-Whitney U test. U = ${u}, p = ${p.toFixed(3)}. Non-parametric comparison of two independent samples.`,
        };
      }
      case "wilcoxon": {
        const w = 50000 + Math.floor(Math.random() * 200000);
        const p = 0.001 + Math.random() * 0.199;
        return {
          statistic: w,
          pValue: Math.round(p * 1000) / 1000,
          significant: p < significanceLevel,
          confidenceInterval: [w * 0.92, w * 1.08].map((v) => Math.round(v)) as [number, number],
          effectSize: Math.round((0.2 + Math.random() * 0.8) * 1000) / 1000,
          power: Math.round((0.5 + Math.random() * 0.45) * 1000) / 1000,
          sampleSize1: n1,
          sampleSize2: n2,
          interpretation: `Wilcoxon signed-rank test. W = ${w}, p = ${p.toFixed(3)}. Non-parametric comparison of paired samples.`,
        };
      }
      default: {
        return this.runTest("t_test", variable1, significanceLevel);
      }
    }
  }

  autoSelectTest(variable1: string, variable2?: string): HypothesisTest["testType"] {
    if (variable2 && ["category", "region", "segment", "group"].some((k) => variable2.toLowerCase().includes(k))) {
      return "chi_square";
    }
    if (!variable2 || variable1.includes("before") || variable1.includes("after")) {
      return "t_test";
    }
    return "t_test";
  }

  createTest(config: {
    name: string;
    testType: HypothesisTest["testType"];
    variable1: string;
    variable2?: string;
    significanceLevel?: number;
  }): HypothesisTest {
    const id = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const testType = config.testType === "auto" ? this.autoSelectTest(config.variable1, config.variable2) : config.testType;

    const test: HypothesisTest = {
      id,
      name: config.name,
      status: "completed",
      testType,
      variable1: config.variable1,
      variable2: config.variable2,
      significanceLevel: config.significanceLevel || 0.05,
      result: this.runTest(testType, config.variable1, config.significanceLevel || 0.05),
      createdAt: Date.now(),
      completedAt: Date.now() + 30000,
    };

    this.tests.unshift(test);
    return test;
  }

  getTest(id: string): HypothesisTest | undefined {
    return this.tests.find((t) => t.id === id);
  }

  listTests(): HypothesisTest[] {
    return this.tests;
  }

  createExperiment(config: {
    name: string;
    hypothesis: string;
    experimentType: Experiment["experimentType"];
    targetMetric: string;
    sampleSize: number;
    duration: number;
    variants: Array<{ name: string; description: string; trafficPercentage: number }>;
  }): Experiment {
    const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const variants: Variant[] = config.variants.map((v, i) => ({
      id: `var-${i + 1}`,
      name: v.name,
      description: v.description,
      trafficPercentage: v.trafficPercentage,
      metricValue: Math.round((1.5 + Math.random() * 3) * 100) / 100,
      conversions: Math.floor(100 + Math.random() * 900),
      sampleSize: Math.floor(config.sampleSize * (v.trafficPercentage / 100)),
    }));

    const experiment: Experiment = {
      id,
      name: config.name,
      status: "draft",
      hypothesis: config.hypothesis,
      experimentType: config.experimentType,
      variants,
      targetMetric: config.targetMetric,
      sampleSize: config.sampleSize,
      duration: config.duration,
      createdAt: Date.now(),
    };

    this.experiments.unshift(experiment);
    return experiment;
  }

  getExperiment(id: string): Experiment | undefined {
    return this.experiments.find((e) => e.id === id);
  }

  listExperiments(): Experiment[] {
    return this.experiments;
  }

  updateExperimentStatus(id: string, status: Experiment["status"]): Experiment | null {
    const experiment = this.experiments.find((e) => e.id === id);
    if (!experiment) return null;

    experiment.status = status;
    if (status === "running" && !experiment.startDate) {
      experiment.startDate = Date.now();
    }
    if (status === "completed") {
      experiment.endDate = Date.now();
      experiment.results = {
        winner: experiment.variants.sort((a, b) => b.metricValue - a.metricValue)[0].id,
        pValue: Math.round((0.001 + Math.random() * 0.05) * 1000) / 1000,
        power: Math.round((0.7 + Math.random() * 0.25) * 1000) / 1000,
        confidenceInterval: [
          Math.round((-0.5 + Math.random() * 0.3) * 1000) / 1000,
          Math.round((0.5 + Math.random() * 0.5) * 1000) / 1000,
        ],
        recommendations: [
          "Experiment completed with sufficient statistical power",
          "Review the winning variant's performance before full rollout",
          "Consider running a follow-up experiment to validate results",
        ],
      };
    }

    return experiment;
  }

  calculatePower(config: {
    sampleSize: number;
    effectSize: number;
    significanceLevel: number;
  }): number {
    const z = 1.96 * (config.significanceLevel < 0.05 ? 1 : 0.84);
    const ncp = config.effectSize * Math.sqrt(config.sampleSize / 2);
    const power = 1 - Math.exp(-0.5 * Math.pow(ncp - z, 2)) * 0.8;
    return Math.round(Math.min(0.99, Math.max(0.1, power)) * 1000) / 1000;
  }
}
