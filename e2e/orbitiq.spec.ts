import { test, expect } from "@playwright/test";

test.describe("OrbitIQ Platform", () => {
  test("homepage loads with title and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OrbitIQ/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("sidebar navigation is visible", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.locator("nav").first();
    await expect(sidebar).toBeVisible();
  });

  test("explore page loads", async ({ page }) => {
    await page.goto("/dashboard/explore");
    await expect(page.locator("text=Explore")).toBeVisible();
  });

  test("models page loads", async ({ page }) => {
    await page.goto("/dashboard/models");
    await expect(page.locator("text=Models")).toBeVisible();
  });

  test("connections page loads", async ({ page }) => {
    await page.goto("/dashboard/connections");
    await expect(page.locator("text=Connections")).toBeVisible();
  });

  test("relationships page loads", async ({ page }) => {
    await page.goto("/dashboard/relationships");
    await expect(page.locator("text=Relationships")).toBeVisible();
  });

  test("OQL playground loads", async ({ page }) => {
    await page.goto("/dashboard/oql");
    await expect(page.locator("text=OQL")).toBeVisible();
  });

  test("forecasting page loads", async ({ page }) => {
    await page.goto("/dashboard/analytics/forecasting");
    await expect(page.locator("text=Forecasting")).toBeVisible();
  });

  test("hypothesis testing page loads", async ({ page }) => {
    await page.goto("/dashboard/analytics/hypothesis-testing");
    await expect(page.locator("text=Hypothesis")).toBeVisible();
  });

  test("experiments page loads", async ({ page }) => {
    await page.goto("/dashboard/analytics/experiments");
    await expect(page.locator("text=Experiment")).toBeVisible();
  });

  test("ML page loads", async ({ page }) => {
    await page.goto("/dashboard/analytics/ml");
    await expect(page.locator("text=Machine Learning")).toBeVisible();
  });

  test("federated query page loads", async ({ page }) => {
    await page.goto("/dashboard/analytics/federation");
    await expect(page.locator("text=Federated")).toBeVisible();
  });

  test("performance page loads", async ({ page }) => {
    await page.goto("/dashboard/analytics/performance");
    await expect(page.locator("text=Performance")).toBeVisible();
  });

  test("model gateway page loads", async ({ page }) => {
    await page.goto("/dashboard/ai/model-gateway");
    await expect(page.locator("text=Model Gateway")).toBeVisible();
  });

  test("intent parser page loads", async ({ page }) => {
    await page.goto("/dashboard/ai/intent-parser");
    await expect(page.locator("text=Intent Parser")).toBeVisible();
  });

  test("AI agent page loads", async ({ page }) => {
    await page.goto("/dashboard/ai/agent");
    await expect(page.locator("text=AI Agent")).toBeVisible();
  });

  test("conversations page loads", async ({ page }) => {
    await page.goto("/dashboard/ai/conversations");
    await expect(page.locator("text=Conversations")).toBeVisible();
  });

  test("RLS page loads", async ({ page }) => {
    await page.goto("/dashboard/security");
    await expect(page.locator("text=Security")).toBeVisible();
  });

  test("column security page loads", async ({ page }) => {
    await page.goto("/dashboard/security/column-security");
    await expect(page.locator("text=Column Security")).toBeVisible();
  });

  test("PII detection page loads", async ({ page }) => {
    await page.goto("/dashboard/security/pii-scanning");
    await expect(page.locator("text=PII")).toBeVisible();
  });

  test("compliance page loads", async ({ page }) => {
    await page.goto("/dashboard/security/compliance");
    await expect(page.locator("text=Compliance")).toBeVisible();
  });

  test("sharing page loads", async ({ page }) => {
    await page.goto("/dashboard/sharing");
    await expect(page.locator("text=Sharing")).toBeVisible();
  });

  test("caching page loads", async ({ page }) => {
    await page.goto("/dashboard/caching");
    await expect(page.locator("text=Caching")).toBeVisible();
  });

  test("embedding page loads", async ({ page }) => {
    await page.goto("/dashboard/embedding");
    await expect(page.locator("text=Embedding")).toBeVisible();
  });

  test("data discovery page loads", async ({ page }) => {
    await page.goto("/dashboard/discovery");
    await expect(page.locator("text=Data Discovery")).toBeVisible();
  });

  test("knowledge graph page loads", async ({ page }) => {
    await page.goto("/dashboard/discovery/knowledge-graph");
    await expect(page.locator("text=Knowledge Graph")).toBeVisible();
  });

  test("model generation page loads", async ({ page }) => {
    await page.goto("/dashboard/discovery/model-generation");
    await expect(page.locator("text=Model Generation")).toBeVisible();
  });

  test("data catalog page loads", async ({ page }) => {
    await page.goto("/dashboard/discovery/catalog");
    await expect(page.locator("text=Data Catalog")).toBeVisible();
  });

  test("GA launch page loads", async ({ page }) => {
    await page.goto("/dashboard/settings/ga-launch");
    await expect(page.locator("text=GA Launch")).toBeVisible();
  });
});

test.describe("GraphQL API", () => {
  const API_URL = "http://localhost:4001/graphql";

  test("introspection query returns schema", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { query: "{ __typename }" },
    });
    const body = await response.json();
    expect(body.data.__typename).toBe("Query");
  });

  test("GA report query returns data", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        query:
          '{ gaReport { overallStatus totalChecks passed failed warnings } }',
      },
    });
    const body = await response.json();
    expect(body.data.gaReport).toBeDefined();
    expect(body.data.gaReport.totalChecks).toBeGreaterThan(0);
    expect(body.data.gaReport.passed).toBeGreaterThan(0);
  });

  test("compliance packs query returns data", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        query: "{ compliancePacks { id name region status coveragePercent } }",
      },
    });
    const body = await response.json();
    expect(body.data.compliancePacks).toBeDefined();
    expect(body.data.compliancePacks.length).toBeGreaterThanOrEqual(4);
  });

  test("federation engines query returns data", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        query:
          "{ federationEngines { id name type status avgLatencyMs queriesProcessed } }",
      },
    });
    const body = await response.json();
    expect(body.data.federationEngines).toBeDefined();
    expect(body.data.federationEngines.length).toBeGreaterThanOrEqual(3);
  });

  test("connector catalog returns data", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        query:
          "{ connectorCatalog { id name type status version } }",
      },
    });
    const body = await response.json();
    expect(body.data.connectorCatalog).toBeDefined();
    expect(body.data.connectorCatalog.length).toBeGreaterThanOrEqual(4);
  });

  test("load tests query returns data", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        query:
          '{ loadTests { id name status concurrentUsers result { p95LatencyMs throughputPerSec errorRate } } }',
      },
    });
    const body = await response.json();
    expect(body.data.loadTests).toBeDefined();
    expect(body.data.loadTests.length).toBeGreaterThanOrEqual(2);
  });
});
