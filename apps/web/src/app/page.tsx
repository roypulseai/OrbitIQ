import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            OrbitIQ
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            AI-Native Enterprise BI Platform
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to OrbitIQ</h2>
          <p className="text-gray-600 mb-6">
            Describe what you want in plain language and get a governed,
            accurate, production-grade dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-2">AI-Native</h3>
            <p className="text-sm text-gray-600">
              Ask questions in natural language, get dashboards instantly.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-2">Enterprise Ready</h3>
            <p className="text-sm text-gray-600">
              RLS/CLS, compliance packs, audit trails built-in.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-2">BYO-LLM</h3>
            <p className="text-sm text-gray-600">
              Use any AI provider - OpenAI, Anthropic, or local models.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
