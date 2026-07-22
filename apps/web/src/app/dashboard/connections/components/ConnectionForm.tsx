"use client";

import { useState } from "react";
import { Button, Input } from "@orbitiq/design-system";

interface ConnectionFormProps {
  onClose: () => void;
}

const CONNECTOR_TYPES = [
  { value: "postgresql", label: "PostgreSQL", icon: "🐘" },
  { value: "mysql", label: "MySQL", icon: "🐬" },
  { value: "snowflake", label: "Snowflake", icon: "❄️" },
  { value: "bigquery", label: "BigQuery", icon: "🔷" },
  { value: "redshift", label: "Redshift", icon: "🔴" },
  { value: "sqlserver", label: "SQL Server", icon: "🟦" },
];

export function ConnectionForm({ onClose }: ConnectionFormProps) {
  const [selectedType, setSelectedType] = useState("postgresql");
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "5432",
    database: "",
    user: "",
    password: "",
    ssl: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating connection:", { type: selectedType, ...formData });
    onClose();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Add New Connection</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Connection Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CONNECTOR_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                  selectedType === type.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Connection Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Database"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Host"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            placeholder="localhost"
            required
          />
          <Input
            label="Port"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: e.target.value })}
            placeholder="5432"
            required
          />
        </div>

        <Input
          label="Database"
          value={formData.database}
          onChange={(e) =>
            setFormData({ ...formData, database: e.target.value })
          }
          placeholder="my_database"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Username"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            placeholder="postgres"
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ssl"
            checked={formData.ssl}
            onChange={(e) =>
              setFormData({ ...formData, ssl: e.target.checked })
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="ssl" className="text-sm text-gray-700">
            Use SSL connection
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Test & Save</Button>
        </div>
      </form>
    </div>
  );
}
