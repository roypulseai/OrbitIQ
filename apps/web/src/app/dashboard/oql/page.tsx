"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";

interface OQLExample {
  name: string;
  oql: string;
  description: string;
}

interface CompileResult {
  sql: string;
  params: string[];
  warnings: string[];
}

interface ValidateResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const EXAMPLES: OQLExample[] = [
  {
    name: "Basic SELECT",
    oql: "SELECT id, name, email FROM users LIMIT 10",
    description: "Simple select with column list",
  },
  {
    name: "With Aggregation",
    oql: "SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC",
    description: "Aggregation with GROUP BY",
  },
  {
    name: "Time Intelligence",
    oql: "SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS signups FROM users WHERE TIME THIS_MONTH GROUP BY month ORDER BY month",
    description: "Time-based filtering and grouping",
  },
  {
    name: "Complex Filters",
    oql: "SELECT * FROM orders WHERE status = 'completed' AND total > 100 AND created_at >= '2024-01-01' LIMIT 50",
    description: "Multiple filter conditions",
  },
  {
    name: "JOIN Query",
    oql: "SELECT u.name, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY order_count DESC",
    description: "Join with aggregation",
  },
  {
    name: "Metric & Dimension",
    oql: "SELECT METRIC revenue, DIMENSION region FROM sales WHERE TIME LAST_MONTH",
    description: "Using semantic model concepts",
  },
];

const KEYWORDS = [
  "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "LIMIT", "OFFSET",
  "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON",
  "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN", "IS NULL", "IS NOT NULL",
  "AS", "HAVING", "FILTER",
];

const FUNCTIONS = [
  "SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT",
  "DATE_TRUNC", "DATE_ADD", "DATE_SUB", "DATE_DIFF",
];

const TIME_KEYWORDS = [
  "TIME TODAY", "TIME YESTERDAY", "TIME THIS_WEEK", "TIME LAST_WEEK",
  "TIME THIS_MONTH", "TIME LAST_MONTH", "TIME THIS_QUARTER", "TIME LAST_QUARTER",
  "TIME THIS_YEAR", "TIME LAST_YEAR",
];

export default function OQLPlaygroundPage() {
  const [oql, setOql] = useState("");
  const [result, setResult] = useState<CompileResult | null>(null);
  const [validation, setValidation] = useState<ValidateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"compile" | "validate" | "examples">("compile");
  const [dialect, setDialect] = useState("postgresql");

  const handleCompile = async () => {
    if (!oql.trim()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, this would call the API
      const mockResult: CompileResult = {
        sql: `SELECT\n  "id",\n  "name",\n  "email"\nFROM "users"\nLIMIT $1`,
        params: ["10"],
        warnings: [],
      };
      setResult(mockResult);
    } catch (error) {
      console.error("Compile failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!oql.trim()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockValidation: ValidateResult = {
        valid: true,
        errors: [],
        warnings: ["Consider adding a LIMIT clause to prevent large result sets"],
      };
      setValidation(mockValidation);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (example: OQLExample) => {
    setOql(example.oql);
    setResult(null);
    setValidation(null);
  };

  const exportToCSV = () => {
    if (!result) return;

    // Simple CSV export mock
    const csv = `SQL Query\n"${result.sql.replace(/"/g, '""')}"\n\nParameters\n${result.params.join(",")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oql-query.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!result) return;

    const json = JSON.stringify({
      oql,
      sql: result.sql,
      params: result.params,
      warnings: result.warnings,
    }, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oql-query.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OQL Playground</h1>
            <p className="mt-1 text-sm text-gray-500">
              Write and compile OrbitIQ Query Language (OQL) queries
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="bigquery">BigQuery</option>
              <option value="snowflake">Snowflake</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("compile")}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      activeTab === "compile"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Compile
                  </button>
                  <button
                    onClick={() => setActiveTab("validate")}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      activeTab === "validate"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Validate
                  </button>
                  <button
                    onClick={() => setActiveTab("examples")}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      activeTab === "examples"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Examples
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOql("")}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === "examples" ? (
                  <div className="space-y-3">
                    {EXAMPLES.map((example) => (
                      <button
                        key={example.name}
                        onClick={() => loadExample(example)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          {example.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {example.description}
                        </div>
                        <code className="block mt-2 text-xs text-indigo-600 font-mono">
                          {example.oql}
                        </code>
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={oql}
                    onChange={(e) => setOql(e.target.value)}
                    placeholder="Write your OQL query here..."
                    className="w-full h-64 p-4 font-mono text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    spellCheck={false}
                  />
                )}
              </div>

              <div className="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex gap-2">
                  {activeTab === "compile" && (
                    <Button onClick={handleCompile} isLoading={isLoading}>
                      Compile to SQL
                    </Button>
                  )}
                  {activeTab === "validate" && (
                    <Button onClick={handleValidate} isLoading={isLoading}>
                      Validate
                    </Button>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {oql.length} characters
                </div>
              </div>
            </div>

            {/* Result Panel */}
            {(result || validation) && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">
                    {result ? "Generated SQL" : "Validation Result"}
                  </h3>
                  {result && (
                    <div className="flex gap-2">
                      <button
                        onClick={exportToCSV}
                        className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={exportToJSON}
                        className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Export JSON
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {result && (
                    <div>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        {result.sql}
                      </pre>

                      {result.params.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Parameters
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.params.map((param, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                              >
                                ${i + 1}: {param}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.warnings.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-yellow-700 mb-2">
                            Warnings
                          </h4>
                          <ul className="list-disc list-inside text-sm text-yellow-600">
                            {result.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {validation && (
                    <div>
                      <div
                        className={`flex items-center gap-2 mb-4 ${
                          validation.valid ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {validation.valid ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span className="font-medium">
                          {validation.valid ? "Valid OQL" : "Invalid OQL"}
                        </span>
                      </div>

                      {validation.errors.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-red-700 mb-2">
                            Errors
                          </h4>
                          <ul className="list-disc list-inside text-sm text-red-600">
                            {validation.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-yellow-700 mb-2">
                            Warnings
                          </h4>
                          <ul className="list-disc list-inside text-sm text-yellow-600">
                            {validation.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reference Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Quick Reference</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {KEYWORDS.slice(0, 12).map((keyword) => (
                      <button
                        key={keyword}
                        onClick={() => setOql((prev) => prev + " " + keyword)}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Functions
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {FUNCTIONS.map((func) => (
                      <button
                        key={func}
                        onClick={() => setOql((prev) => prev + " " + func + "()")}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs hover:bg-indigo-100 transition-colors"
                      >
                        {func}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Time Intelligence
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {TIME_KEYWORDS.slice(0, 6).map((time) => (
                      <button
                        key={time}
                        onClick={() => setOql((prev) => prev + " " + time)}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Syntax
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1 font-mono">
                    <div>SELECT column1, column2</div>
                    <div>FROM table_name</div>
                    <div>WHERE condition</div>
                    <div>GROUP BY column</div>
                    <div>ORDER BY column ASC/DESC</div>
                    <div>LIMIT n OFFSET m</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
