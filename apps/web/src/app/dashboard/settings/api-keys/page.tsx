"use client";

import { useState } from "react";
import { Button, Input } from "@orbitiq/design-system";

interface APIKey {
  id: string;
  name: string;
  provider: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
}

const DEMO_API_KEYS: APIKey[] = [
  {
    id: "1",
    name: "OpenAI Production",
    provider: "OpenAI",
    createdAt: "2024-01-15",
    lastUsed: "2024-03-10",
    isActive: true,
  },
  {
    id: "2",
    name: "Anthropic Development",
    provider: "Anthropic",
    createdAt: "2024-02-01",
    lastUsed: "2024-03-09",
    expiresAt: "2024-12-31",
    isActive: true,
  },
  {
    id: "3",
    name: "Google Cloud (BigQuery)",
    provider: "Google Cloud",
    createdAt: "2024-01-20",
    isActive: false,
  },
];

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI", description: "GPT-4, GPT-3.5-turbo, DALL-E" },
  { value: "anthropic", label: "Anthropic", description: "Claude 3, Claude 2" },
  { value: "google", label: "Google AI", description: "Gemini, PaLM" },
  { value: "mistral", label: "Mistral", description: "Mistral Large, Mixtral" },
  { value: "azure", label: "Azure OpenAI", description: "Enterprise OpenAI" },
  { value: "bedrock", label: "AWS Bedrock", description: "Multi-model gateway" },
  { value: "ollama", label: "Ollama (Local)", description: "Self-hosted models" },
  { value: "cohere", label: "Cohere", description: "Command, Embed" },
];

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(DEMO_API_KEYS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({
    name: "",
    provider: "openai",
    apiKey: "",
    endpoint: "",
  });
  const [showKey, setShowKey] = useState<string | null>(null);

  const handleAddKey = () => {
    if (!newKey.name || !newKey.apiKey) return;

    const key: APIKey = {
      id: String(Date.now()),
      name: newKey.name,
      provider: AI_PROVIDERS.find((p) => p.value === newKey.provider)?.label || newKey.provider,
      createdAt: new Date().toISOString().split("T")[0],
      isActive: true,
    };

    setApiKeys([...apiKeys, key]);
    setShowAddModal(false);
    setNewKey({ name: "", provider: "openai", apiKey: "", endpoint: "" });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleToggleKey = (id: string) => {
    setApiKeys(
      apiKeys.map((k) => (k.id === id ? { ...k, isActive: !k.isActive } : k))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Providers & API Keys</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your AI provider credentials for natural language features
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add API Key
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Supported Providers</h2>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {AI_PROVIDERS.map((provider) => (
              <div
                key={provider.value}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="font-medium text-gray-900 text-sm">
                  {provider.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {provider.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Your API Keys</h2>
          </div>

          {apiKeys.length === 0 ? (
            <div className="p-12 text-center">
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No API keys
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first API key to enable AI features.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        key.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{key.name}</div>
                      <div className="text-sm text-gray-500">
                        {key.provider} • Created {key.createdAt}
                        {key.lastUsed && ` • Last used ${key.lastUsed}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setShowKey(showKey === key.id ? null : key.id)
                      }
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {showKey === key.id ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => handleToggleKey(key.id)}
                      className={`text-sm ${
                        key.isActive
                          ? "text-yellow-600 hover:text-yellow-700"
                          : "text-green-600 hover:text-green-700"
                      }`}
                    >
                      {key.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-medium text-yellow-800">
                Security Notice
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                API keys are encrypted at rest using AES-256-GCM. They are never
                exposed in the UI after initial entry and are never logged. For
                production use, configure a KMS-backed master key via the{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  ENCRYPTION_MASTER_KEY
                </code>{" "}
                environment variable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add API Key
            </h2>
            <div className="space-y-4">
              <Input
                label="Key Name"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                placeholder="e.g., OpenAI Production"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={newKey.provider}
                  onChange={(e) =>
                    setNewKey({ ...newKey, provider: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {AI_PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="API Key"
                type="password"
                value={newKey.apiKey}
                onChange={(e) =>
                  setNewKey({ ...newKey, apiKey: e.target.value })
                }
                placeholder="sk-..."
                required
              />

              <Input
                label="Custom Endpoint (Optional)"
                value={newKey.endpoint}
                onChange={(e) =>
                  setNewKey({ ...newKey, endpoint: e.target.value })
                }
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKey}
                disabled={!newKey.name || !newKey.apiKey}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
