import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to OrbitIQ</h1>
        <p className="mt-1 text-gray-500">
          Get started by connecting your data or exploring the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/connections"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">🔌</div>
          <h3 className="font-semibold text-gray-900">Add Connection</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect to your databases and data sources
          </p>
        </Link>

        <Link
          href="/dashboard/explore"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-semibold text-gray-900">Explore Data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Browse schemas, tables, and sample data
          </p>
        </Link>

        <Link
          href="/dashboard/models"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📐</div>
          <h3 className="font-semibold text-gray-900">Create Model</h3>
          <p className="mt-1 text-sm text-gray-500">
            Define metrics and dimensions for your data
          </p>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Start
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Connect to a database
              </h3>
              <p className="text-sm text-gray-500">
                Add your first PostgreSQL, MySQL, or Snowflake connection
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Discover your schema
              </h3>
              <p className="text-sm text-gray-500">
                Run Smart Data Discovery to auto-map your tables and columns
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Ask a question in natural language
              </h3>
              <p className="text-sm text-gray-500">
                Type what you want to see and get an instant dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
