"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";

export default function ExplorePage() {
  const [query, setQuery] = useState("");

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
              placeholder='Try: "Show me revenue by region for the last 12 months"'
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Button>Ask</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
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
              Connect to a data source and ask a question to get started. The AI
              will generate a dashboard based on your request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
