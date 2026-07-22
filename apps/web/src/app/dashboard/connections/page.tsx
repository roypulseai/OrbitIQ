"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";
import { ConnectionCard } from "./components/ConnectionCard";
import { ConnectionForm } from "./components/ConnectionForm";

interface Connection {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastTested?: string;
}

const DEMO_CONNECTIONS: Connection[] = [
  {
    id: "1",
    name: "Production PostgreSQL",
    type: "postgresql",
    status: "active",
    lastTested: "2 minutes ago",
  },
  {
    id: "2",
    name: "Analytics Snowflake",
    type: "snowflake",
    status: "inactive",
  },
];

export default function ConnectionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [connections] = useState<Connection[]>(DEMO_CONNECTIONS);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Connections</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your database and data source connections
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>Add Connection</Button>
        </div>

        {showForm && (
          <div className="mb-8">
            <ConnectionForm onClose={() => setShowForm(false)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>

        {connections.length === 0 && (
          <div className="text-center py-12">
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
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No connections
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new data connection.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>Add Connection</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
