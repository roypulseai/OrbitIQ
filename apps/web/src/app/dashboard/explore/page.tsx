"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";
import { Chart } from "@/components/charts/Chart";

interface QueryResult {
  data: Record<string, unknown>[];
  chartType: "bar" | "line" | "area" | "scatter" | "pie";
  xField: string;
  yField: string;
  sql: string;
  executionTimeMs: number;
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Demo response
    setResult({
      data: [
        { region: "North America", revenue: 1250000 },
        { region: "Europe", revenue: 980000 },
        { region: "Asia Pacific", revenue: 750000 },
        { region: "Latin America", revenue: 420000 },
      ],
      chartType: "bar",
      xField: "region",
      yField: "revenue",
      sql: 'SELECT region, SUM(revenue) AS revenue FROM sales GROUP BY region ORDER BY revenue DESC',
      executionTimeMs: 142,
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">
            Ask a question
          </h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              placeholder='Try: "Show me revenue by region for the last 12 months"'
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Button onClick={handleQuery} isLoading={isLoading}>
              Ask
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {!result && !isLoading && (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Your visualization will appear here
              </h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Connect to a data source and ask a question to get started. The
                AI will generate a dashboard based on your request.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-gray-600">Analyzing your question...</span>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  Revenue by Region
                </h3>
                <Chart
                  data={result.data}
                  chartType={result.chartType}
                  xField={result.xField}
                  yField={result.yField}
                  width={700}
                  height={350}
                />
              </div>

              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    Generated SQL
                  </span>
                  <span className="text-xs text-gray-500">
                    {result.executionTimeMs}ms
                  </span>
                </div>
                <pre className="text-sm text-green-400 overflow-x-auto">
                  {result.sql}
                </pre>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Show your work
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Intent:</span> Aggregate
                    revenue by region
                  </p>
                  <p>
                    <span className="font-medium">Metric:</span> SUM(revenue)
                  </p>
                  <p>
                    <span className="font-medium">Dimension:</span> region
                  </p>
                  <p>
                    <span className="font-medium">Source:</span> sales table
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
