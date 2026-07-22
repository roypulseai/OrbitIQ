"use client";

import { useState } from "react";
import { Button, Input } from "@orbitiq/design-system";

interface ConnectionFormProps {
  onClose: () => void;
}

const CONNECTOR_TYPES = [
  { value: "postgresql", label: "PostgreSQL", icon: "🐘", defaultPort: "5432" },
  { value: "mysql", label: "MySQL", icon: "🐬", defaultPort: "3306" },
  { value: "snowflake", label: "Snowflake", icon: "❄️", defaultPort: "" },
  { value: "bigquery", label: "BigQuery", icon: "🔷", defaultPort: "" },
  { value: "redshift", label: "Redshift", icon: "🔴", defaultPort: "5439" },
  { value: "sqlserver", label: "SQL Server", icon: "🟦", defaultPort: "1433" },
];

interface ConnectorConfig {
  fields: { name: string; label: string; type: string; required: boolean; placeholder?: string; default?: string }[];
}

const CONNECTOR_CONFIGS: Record<string, ConnectorConfig> = {
  postgresql: {
    fields: [
      { name: "host", label: "Host", type: "text", required: true, placeholder: "localhost" },
      { name: "port", label: "Port", type: "number", required: true, default: "5432" },
      { name: "database", label: "Database", type: "text", required: true, placeholder: "my_database" },
      { name: "user", label: "Username", type: "text", required: true, placeholder: "postgres" },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "ssl", label: "Use SSL", type: "checkbox", required: false },
      { name: "schema", label: "Default Schema", type: "text", required: false, default: "public" },
    ],
  },
  mysql: {
    fields: [
      { name: "host", label: "Host", type: "text", required: true, placeholder: "localhost" },
      { name: "port", label: "Port", type: "number", required: true, default: "3306" },
      { name: "database", label: "Database", type: "text", required: true, placeholder: "my_database" },
      { name: "user", label: "Username", type: "text", required: true, placeholder: "root" },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "ssl", label: "Use SSL", type: "checkbox", required: false },
      { name: "charset", label: "Character Set", type: "text", required: false, default: "utf8mb4" },
    ],
  },
  snowflake: {
    fields: [
      { name: "account", label: "Account", type: "text", required: true, placeholder: "xy12345.us-east-1" },
      { name: "username", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "database", label: "Database", type: "text", required: true },
      { name: "schema", label: "Default Schema", type: "text", required: false, default: "PUBLIC" },
      { name: "warehouse", label: "Warehouse", type: "text", required: false },
      { name: "role", label: "Role", type: "text", required: false },
    ],
  },
  bigquery: {
    fields: [
      { name: "projectId", label: "Project ID", type: "text", required: true, placeholder: "my-project-id" },
      { name: "keyFilename", label: "Key File Path", type: "text", required: false, placeholder: "/path/to/service-account.json" },
      { name: "dataset", label: "Default Dataset", type: "text", required: false },
      { name: "location", label: "Location", type: "text", required: false, default: "US" },
    ],
  },
  redshift: {
    fields: [
      { name: "host", label: "Host", type: "text", required: true, placeholder: "my-cluster.abc123.us-west-2.redshift.amazonaws.com" },
      { name: "port", label: "Port", type: "number", required: true, default: "5439" },
      { name: "database", label: "Database", type: "text", required: true, placeholder: "dev" },
      { name: "user", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "ssl", label: "Use SSL", type: "checkbox", required: false },
      { name: "schema", label: "Default Schema", type: "text", required: false, default: "public" },
    ],
  },
  sqlserver: {
    fields: [
      { name: "host", label: "Host", type: "text", required: true, placeholder: "localhost" },
      { name: "port", label: "Port", type: "number", required: true, default: "1433" },
      { name: "database", label: "Database", type: "text", required: true, placeholder: "master" },
      { name: "user", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "encrypt", label: "Encrypt", type: "checkbox", required: false },
      { name: "trustServerCertificate", label: "Trust Server Certificate", type: "checkbox", required: false },
    ],
  },
};

export function ConnectionForm({ onClose }: ConnectionFormProps) {
  const [selectedType, setSelectedType] = useState("postgresql");
  const [formData, setFormData] = useState<Record<string, string | boolean>>({
    name: "",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const currentConfig = CONNECTOR_CONFIGS[selectedType];

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setFormData({ name: formData.name as string });
    setTestResult(null);
  };

  const handleFieldChange = (fieldName: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock test result
    setTestResult({
      success: true,
      message: `Successfully connected to ${CONNECTOR_TYPES.find((t) => t.value === selectedType)?.label}`,
    });

    setIsTesting(false);
  };

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
                onClick={() => handleTypeChange(type.value)}
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
          value={formData.name as string}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          placeholder="My Database"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          {currentConfig.fields.slice(0, 2).map((field) => (
            <Input
              key={field.name}
              label={field.label}
              type={field.type === "checkbox" ? "text" : field.type}
              value={String(formData[field.name] || field.default || "")}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          ))}
        </div>

        {currentConfig.fields.slice(2).map((field) => (
          <div key={field.name}>
            {field.type === "checkbox" ? (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={Boolean(formData[field.name])}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={field.name} className="text-sm text-gray-700">
                  {field.label}
                </label>
              </div>
            ) : (
              <Input
                label={field.label}
                type={field.type}
                value={String(formData[field.name] || field.default || "")}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}

        {testResult && (
          <div
            className={`p-3 rounded-lg ${
              testResult.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleTest}
            isLoading={isTesting}
          >
            Test Connection
          </Button>
          <Button type="submit">Save Connection</Button>
        </div>
      </form>
    </div>
  );
}
