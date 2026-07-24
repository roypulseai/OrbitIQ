import { test, expect } from "@playwright/test";

test.describe("OrbitIQ Platform - UI Pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OrbitIQ/);
  });

  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible({ timeout: 60000 });
  });

  test("sidebar navigation is visible", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("nav").first()).toBeVisible({ timeout: 60000 });
  });

  const pages = [
    { url: "/dashboard/explore", text: "Explore" },
    { url: "/dashboard/models", text: "Models" },
    { url: "/dashboard/connections", text: "Connections" },
    { url: "/dashboard/relationships", text: "Relationships" },
    { url: "/dashboard/data-prep", text: "Data Prep" },
    { url: "/dashboard/oql", text: "OQL" },
    { url: "/dashboard/analytics/forecasting", text: "Forecasting" },
    { url: "/dashboard/analytics/hypothesis-testing", text: "Hypothesis" },
    { url: "/dashboard/analytics/experiments", text: "Experiment" },
    { url: "/dashboard/analytics/ml", text: "Machine Learning" },
    { url: "/dashboard/analytics/federation", text: "Federated" },
    { url: "/dashboard/analytics/performance", text: "Performance" },
    { url: "/dashboard/ai/model-gateway", text: "Model Gateway" },
    { url: "/dashboard/ai/intent-parser", text: "Intent Parser" },
    { url: "/dashboard/ai/agent", text: "AI Agent" },
    { url: "/dashboard/ai/conversations", text: "Conversations" },
    { url: "/dashboard/security", text: "Row-Level Security" },
    { url: "/dashboard/security/column-security", text: "Column Security" },
    { url: "/dashboard/security/pii-scanning", text: "PII Detection" },
    { url: "/dashboard/security/user-attributes", text: "User Attributes" },
    { url: "/dashboard/security/compliance", text: "Compliance" },
    { url: "/dashboard/security/compliance/audit-trail", text: "Audit Trail" },
    { url: "/dashboard/sharing", text: "Sharing" },
    { url: "/dashboard/schedules", text: "Schedules" },
    { url: "/dashboard/caching", text: "Caching" },
    { url: "/dashboard/embedding", text: "Embedding" },
    { url: "/dashboard/discovery", text: "Data Discovery" },
    { url: "/dashboard/discovery/knowledge-graph", text: "Knowledge Graph" },
    { url: "/dashboard/discovery/relationship-canvas", text: "Relationship Canvas" },
    { url: "/dashboard/discovery/model-generation", text: "Model Generation" },
    { url: "/dashboard/discovery/cross-language", text: "Cross-Language" },
    { url: "/dashboard/discovery/catalog", text: "Data Catalog" },
    { url: "/dashboard/settings/api-keys", text: "API Keys" },
    { url: "/dashboard/settings/ga-launch", text: "GA Launch" },
  ];

  for (const p of pages) {
    test(`${p.url} loads`, async ({ page }) => {
      await page.goto(p.url, { timeout: 60000 });
      await expect(page.getByRole("heading", { name: new RegExp(p.text, "i") })).toBeVisible({ timeout: 30000 });
    });
  }
});

test.describe("OrbitIQ Platform - GraphQL API", () => {
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
      data: { query: '{ gaReport { overallStatus totalChecks passed failed warnings } }' },
    });
    const body = await response.json();
    expect(body.data.gaReport).toBeDefined();
    expect(body.data.gaReport.totalChecks).toBeGreaterThan(0);
    expect(body.data.gaReport.passed).toBeGreaterThan(0);
  });

  test("compliance packs query returns 4 packs", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { query: "{ compliancePacks { id name region status coveragePercent } }" },
    });
    const body = await response.json();
    expect(body.data.compliancePacks.length).toBeGreaterThanOrEqual(4);
  });

  test("federation engines query returns 3 engines", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { query: "{ federationEngines { id name type status avgLatencyMs queriesProcessed } }" },
    });
    const body = await response.json();
    expect(body.data.federationEngines.length).toBeGreaterThanOrEqual(3);
  });

  test("connector catalog returns entries", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { query: "{ connectorCatalog { id name type status version } }" },
    });
    const body = await response.json();
    expect(body.data.connectorCatalog.length).toBeGreaterThanOrEqual(4);
  });

  test("load tests query returns 2 tests", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { query: '{ loadTests { id name status concurrentUsers result { p95LatencyMs throughputPerSec errorRate } } }' },
    });
    const body = await response.json();
    expect(body.data.loadTests.length).toBeGreaterThanOrEqual(2);
  });

  test("performance dashboard returns metrics", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { query: "{ performanceDashboard { aggregateHitRate avgCDCPipelinesLagMs activeAggregates streamingThroughput } }" },
    });
    const body = await response.json();
    expect(body.data.performanceDashboard).toBeDefined();
    expect(body.data.performanceDashboard.aggregateHitRate).toBeGreaterThan(0);
  });
});
