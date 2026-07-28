"use client";

import { Button, Badge } from "@orbitiq/design-system";

interface Connection {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastTested?: string;
}

const connectorIcons: Record<string, string> = {
  postgresql: "🐘",
  mysql: "🐬",
  snowflake: "❄️",
  bigquery: "🔷",
  redshift: "🔴",
  sqlserver: "🟦",
};

const connectorNames: Record<string, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  snowflake: "Snowflake",
  bigquery: "BigQuery",
  redshift: "Redshift",
  sqlserver: "SQL Server",
};

interface ConnectionCardProps {
  connection: Connection;
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const statusVariant = {
    active: "success" as const,
    inactive: "default" as const,
    error: "danger" as const,
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {connectorIcons[connection.type] || "🔌"}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">{connection.name}</h3>
            <p className="text-sm text-gray-500">
              {connectorNames[connection.type] || connection.type}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant[connection.status]}>
          {connection.status}
        </Badge>
      </div>

      {connection.lastTested && (
        <p className="mt-4 text-xs text-gray-400">
          Last tested: {connection.lastTested}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm">
          Test
        </Button>
        <Button variant="secondary" size="sm">
          Browse
        </Button>
        <Button variant="ghost" size="sm">
          Settings
        </Button>
      </div>
    </div>
  );
}
