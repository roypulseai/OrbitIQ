# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbitiq.spec.ts >> OrbitIQ Platform >> sidebar navigation is visible
- Location: e2e\orbitiq.spec.ts:15:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3001/dashboard", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("OrbitIQ Platform", () => {
  4   |   test("homepage loads with title and navigation", async ({ page }) => {
  5   |     await page.goto("/");
  6   |     await expect(page).toHaveTitle(/OrbitIQ/);
  7   |     await expect(page.locator("h1").first()).toBeVisible();
  8   |   });
  9   | 
  10  |   test("dashboard page loads", async ({ page }) => {
  11  |     await page.goto("/dashboard");
  12  |     await expect(page.locator("text=Dashboard")).toBeVisible();
  13  |   });
  14  | 
  15  |   test("sidebar navigation is visible", async ({ page }) => {
> 16  |     await page.goto("/dashboard");
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  17  |     const sidebar = page.locator("nav").first();
  18  |     await expect(sidebar).toBeVisible();
  19  |   });
  20  | 
  21  |   test("explore page loads", async ({ page }) => {
  22  |     await page.goto("/dashboard/explore");
  23  |     await expect(page.locator("text=Explore")).toBeVisible();
  24  |   });
  25  | 
  26  |   test("models page loads", async ({ page }) => {
  27  |     await page.goto("/dashboard/models");
  28  |     await expect(page.locator("text=Models")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("connections page loads", async ({ page }) => {
  32  |     await page.goto("/dashboard/connections");
  33  |     await expect(page.locator("text=Connections")).toBeVisible();
  34  |   });
  35  | 
  36  |   test("relationships page loads", async ({ page }) => {
  37  |     await page.goto("/dashboard/relationships");
  38  |     await expect(page.locator("text=Relationships")).toBeVisible();
  39  |   });
  40  | 
  41  |   test("OQL playground loads", async ({ page }) => {
  42  |     await page.goto("/dashboard/oql");
  43  |     await expect(page.locator("text=OQL")).toBeVisible();
  44  |   });
  45  | 
  46  |   test("forecasting page loads", async ({ page }) => {
  47  |     await page.goto("/dashboard/analytics/forecasting");
  48  |     await expect(page.locator("text=Forecasting")).toBeVisible();
  49  |   });
  50  | 
  51  |   test("hypothesis testing page loads", async ({ page }) => {
  52  |     await page.goto("/dashboard/analytics/hypothesis-testing");
  53  |     await expect(page.locator("text=Hypothesis")).toBeVisible();
  54  |   });
  55  | 
  56  |   test("experiments page loads", async ({ page }) => {
  57  |     await page.goto("/dashboard/analytics/experiments");
  58  |     await expect(page.locator("text=Experiment")).toBeVisible();
  59  |   });
  60  | 
  61  |   test("ML page loads", async ({ page }) => {
  62  |     await page.goto("/dashboard/analytics/ml");
  63  |     await expect(page.locator("text=Machine Learning")).toBeVisible();
  64  |   });
  65  | 
  66  |   test("federated query page loads", async ({ page }) => {
  67  |     await page.goto("/dashboard/analytics/federation");
  68  |     await expect(page.locator("text=Federated")).toBeVisible();
  69  |   });
  70  | 
  71  |   test("performance page loads", async ({ page }) => {
  72  |     await page.goto("/dashboard/analytics/performance");
  73  |     await expect(page.locator("text=Performance")).toBeVisible();
  74  |   });
  75  | 
  76  |   test("model gateway page loads", async ({ page }) => {
  77  |     await page.goto("/dashboard/ai/model-gateway");
  78  |     await expect(page.locator("text=Model Gateway")).toBeVisible();
  79  |   });
  80  | 
  81  |   test("intent parser page loads", async ({ page }) => {
  82  |     await page.goto("/dashboard/ai/intent-parser");
  83  |     await expect(page.locator("text=Intent Parser")).toBeVisible();
  84  |   });
  85  | 
  86  |   test("AI agent page loads", async ({ page }) => {
  87  |     await page.goto("/dashboard/ai/agent");
  88  |     await expect(page.locator("text=AI Agent")).toBeVisible();
  89  |   });
  90  | 
  91  |   test("conversations page loads", async ({ page }) => {
  92  |     await page.goto("/dashboard/ai/conversations");
  93  |     await expect(page.locator("text=Conversations")).toBeVisible();
  94  |   });
  95  | 
  96  |   test("RLS page loads", async ({ page }) => {
  97  |     await page.goto("/dashboard/security");
  98  |     await expect(page.locator("text=Security")).toBeVisible();
  99  |   });
  100 | 
  101 |   test("column security page loads", async ({ page }) => {
  102 |     await page.goto("/dashboard/security/column-security");
  103 |     await expect(page.locator("text=Column Security")).toBeVisible();
  104 |   });
  105 | 
  106 |   test("PII detection page loads", async ({ page }) => {
  107 |     await page.goto("/dashboard/security/pii-scanning");
  108 |     await expect(page.locator("text=PII")).toBeVisible();
  109 |   });
  110 | 
  111 |   test("compliance page loads", async ({ page }) => {
  112 |     await page.goto("/dashboard/security/compliance");
  113 |     await expect(page.locator("text=Compliance")).toBeVisible();
  114 |   });
  115 | 
  116 |   test("sharing page loads", async ({ page }) => {
```