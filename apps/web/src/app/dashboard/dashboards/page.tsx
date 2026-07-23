"use client";

import { useState } from "react";
import Link from "next/link";

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  tileCount: number;
  lastModified: string;
}

const DEMO_DASHBOARDS: Dashboard[] = [
  {
    id: "1",
    name: "Sales Overview",
    description: "Key sales metrics and trends",
    tileCount: 6,
    lastModified: "2 hours ago",
  },
  {
    id: "2",
    name: "Marketing Performance",
    description: "Campaign and channel analytics",
    tileCount: 4,
    lastModified: "1 day ago",
  },
];

export default function DashboardsPage() {
  const [dashboards] = useState<Dashboard[]>(DEMO_DASHBOARDS);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboards</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage your dashboards
            </p>
          </div>
          <Link
            href="/dashboard/dashboards/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Create Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.id}
              href={`/dashboard/dashboards/${dashboard.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {dashboard.name}
                  </h3>
                  {dashboard.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {dashboard.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {dashboard.tileCount} tiles
                </span>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Modified {dashboard.lastModified}
              </p>
            </Link>
          ))}
        </div>

        {dashboards.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No dashboards
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first dashboard to get started.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/dashboards/new"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Create Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
