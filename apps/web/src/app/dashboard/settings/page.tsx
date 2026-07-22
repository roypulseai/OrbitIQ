export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage your account and platform settings
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            AI Providers
          </h2>
          <p className="text-gray-500 mb-4">
            Configure your LLM providers for AI-powered features.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">🤖</span>
                <div>
                  <p className="font-medium text-gray-900">OpenAI</p>
                  <p className="text-sm text-gray-500">GPT-4, GPT-3.5</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">Not configured</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧠</span>
                <div>
                  <p className="font-medium text-gray-900">Anthropic</p>
                  <p className="text-sm text-gray-500">Claude 3.5, Claude 3</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">Not configured</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <div>
                  <p className="font-medium text-gray-900">Local LLM</p>
                  <p className="text-sm text-gray-500">Ollama, vLLM</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">Not configured</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Security & Compliance
          </h2>
          <p className="text-gray-500 mb-4">
            Configure security policies and compliance packs.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">GDPR</p>
                <p className="text-sm text-gray-500">
                  EU data protection compliance
                </p>
              </div>
              <span className="text-sm text-green-600">Available</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">CCPA</p>
                <p className="text-sm text-gray-500">
                  California consumer privacy
                </p>
              </div>
              <span className="text-sm text-gray-400">Coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
