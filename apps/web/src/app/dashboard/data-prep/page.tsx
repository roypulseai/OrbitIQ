"use client";

import { useState } from "react";

type StepType =
  | "filter"
  | "join"
  | "pivot"
  | "unpivot"
  | "group"
  | "rename"
  | "cast"
  | "add_column"
  | "remove_column"
  | "sort"
  | "deduplicate"
  | "sample";

interface PipelineStep {
  id: string;
  type: StepType;
  config: Record<string, string>;
  active: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  source: string;
  schema: string;
  table: string;
  steps: PipelineStep[];
  createdAt: string;
}

const STEP_META: Record<StepType, { label: string; icon: string; color: string }> = {
  filter: { label: "Filter", icon: "⚙", color: "bg-blue-100 text-blue-700 border-blue-200" },
  join: { label: "Join", icon: "⟶", color: "bg-purple-100 text-purple-700 border-purple-200" },
  pivot: { label: "Pivot", icon: "↥", color: "bg-teal-100 text-teal-700 border-teal-200" },
  unpivot: { label: "Unpivot", icon: "↧", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  group: { label: "Group", icon: "⊞", color: "bg-amber-100 text-amber-700 border-amber-200" },
  rename: { label: "Rename", icon: "✎", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  cast: { label: "Cast", icon: "⇄", color: "bg-rose-100 text-rose-700 border-rose-200" },
  add_column: { label: "Add Column", icon: "＋", color: "bg-green-100 text-green-700 border-green-200" },
  remove_column: { label: "Remove Column", icon: "−", color: "bg-red-100 text-red-700 border-red-200" },
  sort: { label: "Sort", icon: "↕", color: "bg-orange-100 text-orange-700 border-orange-200" },
  deduplicate: { label: "Deduplicate", icon: "⊘", color: "bg-violet-100 text-violet-700 border-violet-200" },
  sample: { label: "Sample", icon: "⊡", color: "bg-lime-100 text-lime-700 border-lime-200" },
};

const STEP_FIELDS: Record<StepType, string[]> = {
  filter: ["column", "operator", "value"],
  join: ["type", "right_table", "on_left", "on_right"],
  pivot: ["index", "columns", "values", "agg"],
  unpivot: ["unpivot_columns", "key_column", "value_column"],
  group: ["group_by", "aggregations"],
  rename: ["from_column", "to_column"],
  cast: ["column", "target_type"],
  add_column: ["column_name", "expression"],
  remove_column: ["columns"],
  sort: ["column", "direction"],
  deduplicate: ["columns", "keep"],
  sample: ["method", "size"],
};

const MOCK_PIPELINES: Pipeline[] = [
  {
    id: "p1",
    name: "Sales Analytics Transform",
    description: "Clean and aggregate raw sales data for reporting dashboards",
    source: "PostgreSQL",
    schema: "raw",
    table: "orders",
    createdAt: "2026-07-15",
    steps: [
      {
        id: "s1",
        type: "filter",
        config: { column: "status", operator: "=", value: "'completed'" },
        active: true,
      },
      {
        id: "s2",
        type: "cast",
        config: { column: "total", target_type: "NUMERIC(12,2)" },
        active: true,
      },
      {
        id: "s3",
        type: "group",
        config: { group_by: "region", aggregations: "SUM(total) AS revenue, COUNT(*) AS order_count" },
        active: true,
      },
      {
        id: "s4",
        type: "sort",
        config: { column: "revenue", direction: "DESC" },
        active: true,
      },
    ],
  },
  {
    id: "p2",
    name: "Customer 360 Profile",
    description: "Join user data with activity logs to build a unified customer profile",
    source: "Snowflake",
    schema: "analytics",
    table: "users",
    createdAt: "2026-07-18",
    steps: [
      {
        id: "s5",
        type: "join",
        config: { type: "LEFT JOIN", right_table: "user_activity", on_left: "users.id", on_right: "user_activity.user_id" },
        active: true,
      },
      {
        id: "s6",
        type: "rename",
        config: { from_column: "activity_count", to_column: "total_events" },
        active: true,
      },
      {
        id: "s7",
        type: "deduplicate",
        config: { columns: "users.id", keep: "latest" },
        active: false,
      },
      {
        id: "s8",
        type: "add_column",
        config: { column_name: "engagement_score", expression: "total_events / NULLIF(days_since_signup, 0)" },
        active: true,
      },
    ],
  },
];

const GENERATED_SQL: Record<string, string> = {
  p1: `SELECT
  region,
  SUM(total) AS revenue,
  COUNT(*) AS order_count
FROM raw.orders
WHERE status = 'completed'
GROUP BY region
ORDER BY revenue DESC`,
  p2: `SELECT
  users.*,
  user_activity.activity_count AS total_events,
  users.id,
  CASE
    WHEN days_since_signup > 0
    THEN total_events / days_since_signup
    ELSE NULL
  END AS engagement_score
FROM analytics.users
LEFT JOIN analytics.user_activity
  ON users.id = user_activity.user_id`,
};

let stepIdCounter = 100;

function generateStepId(): string {
  stepIdCounter += 1;
  return `s${stepIdCounter}`;
}

export default function DataPrepPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(MOCK_PIPELINES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSource, setNewSource] = useState("PostgreSQL");
  const [newSchema, setNewSchema] = useState("");
  const [newTable, setNewTable] = useState("");

  const [stepType, setStepType] = useState<StepType>("filter");
  const [stepConfig, setStepConfig] = useState<Record<string, string>>({});

  const selectedPipeline = pipelines.find((p) => p.id === selectedId) ?? null;

  const filteredPipelines = pipelines.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function openStepModal(type?: StepType, index?: number) {
    if (type !== undefined && index !== undefined) {
      setStepType(type);
      setEditingStepIndex(index);
      setStepConfig({ ...selectedPipeline!.steps[index].config });
    } else {
      setStepType("filter");
      setEditingStepIndex(null);
      setStepConfig({});
    }
    setShowStepModal(true);
  }

  function handleCreatePipeline() {
    if (!newName.trim()) return;
    const pipeline: Pipeline = {
      id: `p${Date.now()}`,
      name: newName,
      description: newDescription,
      source: newSource,
      schema: newSchema,
      table: newTable,
      steps: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPipelines((prev) => [...prev, pipeline]);
    setShowCreateModal(false);
    setNewName("");
    setNewDescription("");
    setNewSource("PostgreSQL");
    setNewSchema("");
    setNewTable("");
  }

  function handleSaveStep() {
    if (!selectedPipeline) return;
    setPipelines((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPipeline.id) return p;
        const newSteps = [...p.steps];
        if (editingStepIndex !== null) {
          newSteps[editingStepIndex] = { ...newSteps[editingStepIndex], config: { ...stepConfig } };
        } else {
          newSteps.push({ id: generateStepId(), type: stepType, config: { ...stepConfig }, active: true });
        }
        return { ...p, steps: newSteps };
      }),
    );
    setShowStepModal(false);
    setEditingStepIndex(null);
    setStepConfig({});
  }

  function handleDeleteStep(index: number) {
    if (!selectedPipeline) return;
    setPipelines((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPipeline.id) return p;
        return { ...p, steps: p.steps.filter((_, i) => i !== index) };
      }),
    );
  }

  function handleToggleStep(index: number) {
    if (!selectedPipeline) return;
    setPipelines((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPipeline.id) return p;
        const newSteps = [...p.steps];
        newSteps[index] = { ...newSteps[index], active: !newSteps[index].active };
        return { ...p, steps: newSteps };
      }),
    );
  }

  function handleDeletePipeline(id: string) {
    setPipelines((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleStepTypeChange(newType: StepType) {
    setStepType(newType);
    setStepConfig({});
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPipeline ? (
          <PipelineDetail
            pipeline={selectedPipeline}
            onBack={() => setSelectedId(null)}
            onAddStep={() => openStepModal()}
            onEditStep={(index) => {
              const step = selectedPipeline.steps[index];
              openStepModal(step.type, index);
            }}
            onDeleteStep={handleDeleteStep}
            onToggleStep={handleToggleStep}
            onDeletePipeline={handleDeletePipeline}
            onShowSql={() => setShowSqlPreview(true)}
          />
        ) : (
          <PipelineList
            pipelines={filteredPipelines}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={setSelectedId}
            onCreate={() => setShowCreateModal(true)}
            onDelete={handleDeletePipeline}
          />
        )}
      </div>

      {showCreateModal && (
        <CreatePipelineModal
          name={newName}
          description={newDescription}
          source={newSource}
          schema={newSchema}
          table={newTable}
          onNameChange={setNewName}
          onDescriptionChange={setNewDescription}
          onSourceChange={setNewSource}
          onSchemaChange={setNewSchema}
          onTableChange={setNewTable}
          onSubmit={handleCreatePipeline}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showStepModal && (
        <StepModal
          stepType={stepType}
          config={stepConfig}
          isEditing={editingStepIndex !== null}
          onTypeChange={handleStepTypeChange}
          onConfigChange={(key, value) => setStepConfig((prev) => ({ ...prev, [key]: value }))}
          onSubmit={handleSaveStep}
          onClose={() => {
            setShowStepModal(false);
            setEditingStepIndex(null);
          }}
        />
      )}

      {showSqlPreview && selectedPipeline && (
        <SqlPreviewModal
          pipeline={selectedPipeline}
          onClose={() => setShowSqlPreview(false)}
        />
      )}
    </div>
  );
}

function PipelineList({
  pipelines,
  searchQuery,
  onSearchChange,
  onSelect,
  onCreate,
  onDelete,
}: {
  pipelines: Pipeline[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Prep</h1>
          <p className="mt-1 text-sm text-gray-500">
            Build transformation pipelines to clean, shape, and enrich your data
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Create Pipeline
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search pipelines..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>

      {pipelines.length === 0 ? (
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
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pipelines found</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first data prep pipeline.</p>
          <div className="mt-6">
            <button
              onClick={onCreate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create Pipeline
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(pipeline.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{pipeline.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{pipeline.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pipeline.id);
                  }}
                  className="ml-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  title="Delete pipeline"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {pipeline.source}
                </span>
                <span>{pipeline.steps.length} step{pipeline.steps.length !== 1 ? "s" : ""}</span>
                <span>{pipeline.createdAt}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {pipeline.steps.slice(0, 4).map((step) => {
                  const meta = STEP_META[step.type];
                  return (
                    <span
                      key={step.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  );
                })}
                {pipeline.steps.length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    +{pipeline.steps.length - 4}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PipelineDetail({
  pipeline,
  onBack,
  onAddStep,
  onEditStep,
  onDeleteStep,
  onToggleStep,
  onDeletePipeline,
  onShowSql,
}: {
  pipeline: Pipeline;
  onBack: () => void;
  onAddStep: () => void;
  onEditStep: (index: number) => void;
  onDeleteStep: (index: number) => void;
  onToggleStep: (index: number) => void;
  onDeletePipeline: (id: string) => void;
  onShowSql: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{pipeline.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{pipeline.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShowSql}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            SQL Preview
          </button>
          <button
            onClick={onAddStep}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            Add Step
          </button>
          <button
            onClick={() => onDeletePipeline(pipeline.id)}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Source</h2>
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                DB
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{pipeline.source}</div>
                <div className="text-xs text-gray-500 font-mono">
                  {pipeline.schema}.{pipeline.table}
                </div>
              </div>
            </div>

            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Transform Steps ({pipeline.steps.length})
            </h2>

            {pipeline.steps.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">No steps yet. Add your first transform step.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {pipeline.steps.map((step, index) => {
                  const meta = STEP_META[step.type];
                  const configSummary = Object.entries(step.config)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ");
                  return (
                    <div key={step.id}>
                      {index > 0 && (
                        <div className="flex justify-center py-1">
                          <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`border rounded-xl p-4 transition-all ${
                          step.active
                            ? "bg-white border-gray-200 hover:shadow-md"
                            : "bg-gray-50 border-gray-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${meta.color}`}>
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{meta.label}</span>
                                {!step.active && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                    INACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-mono mt-0.5 max-w-md truncate">
                                {configSummary}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onToggleStep(index)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                step.active ? "bg-indigo-600" : "bg-gray-300"
                              }`}
                              title={step.active ? "Deactivate" : "Activate"}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  step.active ? "translate-x-4.5" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => onEditStep(index)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Edit step"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteStep(index)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete step"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Pipeline Info</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Source</dt>
                <dd className="font-medium text-gray-900">{pipeline.source}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Schema</dt>
                <dd className="font-mono text-gray-900 text-xs">{pipeline.schema}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Table</dt>
                <dd className="font-mono text-gray-900 text-xs">{pipeline.table}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Steps</dt>
                <dd className="font-medium text-gray-900">{pipeline.steps.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Active</dt>
                <dd className="font-medium text-gray-900">
                  {pipeline.steps.filter((s) => s.active).length}/{pipeline.steps.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{pipeline.createdAt}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Step Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STEP_META) as StepType[]).map((type) => {
                const meta = STEP_META[type];
                return (
                  <div
                    key={type}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${meta.color}`}
                  >
                    <span className="text-sm">{meta.icon}</span>
                    <span className="text-xs font-medium">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CreatePipelineModal({
  name,
  description,
  source,
  schema,
  table,
  onNameChange,
  onDescriptionChange,
  onSourceChange,
  onSchemaChange,
  onTableChange,
  onSubmit,
  onClose,
}: {
  name: string;
  description: string;
  source: string;
  schema: string;
  table: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSourceChange: (v: string) => void;
  onSchemaChange: (v: string) => void;
  onTableChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Data Prep Pipeline</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Sales Analytics Transform"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="What does this pipeline do?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Connection</label>
            <select
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="MySQL">MySQL</option>
              <option value="Snowflake">Snowflake</option>
              <option value="BigQuery">BigQuery</option>
              <option value="Redshift">Redshift</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schema</label>
              <input
                type="text"
                value={schema}
                onChange={(e) => onSchemaChange(e.target.value)}
                placeholder="e.g. public"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
              <input
                type="text"
                value={table}
                onChange={(e) => onTableChange(e.target.value)}
                placeholder="e.g. orders"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!name.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}

function StepModal({
  stepType,
  config,
  isEditing,
  onTypeChange,
  onConfigChange,
  onSubmit,
  onClose,
}: {
  stepType: StepType;
  config: Record<string, string>;
  isEditing: boolean;
  onTypeChange: (t: StepType) => void;
  onConfigChange: (key: string, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const fields = STEP_FIELDS[stepType];
  const meta = STEP_META[stepType];

  function fieldLabel(field: string): string {
    return field
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function fieldPlaceholder(field: string): string {
    const placeholders: Record<string, string> = {
      column: "e.g. status",
      operator: "e.g. =, >, <, LIKE",
      value: "e.g. 'completed', 100",
      type: "e.g. LEFT JOIN, INNER JOIN",
      right_table: "e.g. orders",
      on_left: "e.g. users.id",
      on_right: "e.g. orders.user_id",
      index: "e.g. customer_id",
      columns: "e.g. product_category",
      values: "e.g. revenue",
      agg: "e.g. SUM, COUNT, AVG",
      unpivot_columns: "e.g. q1_sales, q2_sales, q3_sales, q4_sales",
      key_column: "e.g. quarter",
      value_column: "e.g. sales_amount",
      group_by: "e.g. region, category",
      aggregations: "e.g. SUM(revenue), COUNT(*)",
      from_column: "e.g. old_name",
      to_column: "e.g. new_name",
      target_type: "e.g. INTEGER, VARCHAR(255), DATE",
      column_name: "e.g. full_name",
      expression: "e.g. first_name || ' ' || last_name",
      direction: "e.g. ASC, DESC",
      keep: "e.g. first, last, latest, oldest",
      method: "e.g. random, top, stratified",
      size: "e.g. 1000, 0.1 (10%)",
    };
    return placeholders[field] ?? "";
  }

  function renderFieldHint(field: string): string | null {
    if (field === "operator") return "Supported: =, !=, >, <, >=, <=, LIKE, IN, IS NULL, IS NOT NULL";
    if (field === "type" && stepType === "join") return "Options: LEFT JOIN, RIGHT JOIN, INNER JOIN, FULL JOIN, CROSS JOIN";
    if (field === "direction") return "Options: ASC, DESC";
    if (field === "keep") return "Options: first, last, latest, oldest";
    if (field === "method") return "Options: random, top (first N), stratified";
    if (field === "target_type") return "Options: INTEGER, BIGINT, FLOAT, VARCHAR(255), TEXT, DATE, TIMESTAMP, BOOLEAN";
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? "Edit" : "Add"} Step
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Step Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STEP_META) as StepType[]).map((type) => {
                const m = STEP_META[type];
                const isSelected = type === stepType;
                return (
                  <button
                    key={type}
                    onClick={() => onTypeChange(type)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${m.color}`}>
                      {m.icon}
                    </span>
                    <span className="font-medium text-gray-700">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${meta.color}`}>
                {meta.icon}
              </span>
              <span className="text-sm font-medium text-gray-900">{meta.label} Configuration</span>
            </div>
            {fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fieldLabel(field)}
                </label>
                {field === "direction" || field === "keep" || field === "method" || field === "target_type" || (field === "type" && stepType === "join") ? (
                  <select
                    value={config[field] ?? ""}
                    onChange={(e) => onConfigChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select...</option>
                    {field === "direction" && (
                      <>
                        <option value="ASC">Ascending (ASC)</option>
                        <option value="DESC">Descending (DESC)</option>
                      </>
                    )}
                    {field === "keep" && (
                      <>
                        <option value="first">First</option>
                        <option value="last">Last</option>
                        <option value="latest">Latest</option>
                        <option value="oldest">Oldest</option>
                      </>
                    )}
                    {field === "method" && (
                      <>
                        <option value="random">Random</option>
                        <option value="top">Top (First N)</option>
                        <option value="stratified">Stratified</option>
                      </>
                    )}
                    {field === "target_type" && (
                      <>
                        <option value="INTEGER">INTEGER</option>
                        <option value="BIGINT">BIGINT</option>
                        <option value="FLOAT">FLOAT</option>
                        <option value="VARCHAR(255)">VARCHAR(255)</option>
                        <option value="TEXT">TEXT</option>
                        <option value="DATE">DATE</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                      </>
                    )}
                    {field === "type" && stepType === "join" && (
                      <>
                        <option value="LEFT JOIN">LEFT JOIN</option>
                        <option value="RIGHT JOIN">RIGHT JOIN</option>
                        <option value="INNER JOIN">INNER JOIN</option>
                        <option value="FULL JOIN">FULL JOIN</option>
                        <option value="CROSS JOIN">CROSS JOIN</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={config[field] ?? ""}
                    onChange={(e) => onConfigChange(field, e.target.value)}
                    placeholder={fieldPlaceholder(field)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                )}
                {renderFieldHint(field) && (
                  <p className="mt-1 text-xs text-gray-400">{renderFieldHint(field)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            {isEditing ? "Save Changes" : "Add Step"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SqlPreviewModal({
  pipeline,
  onClose,
}: {
  pipeline: Pipeline;
  onClose: () => void;
}) {
  const activeSteps = pipeline.steps.filter((s) => s.active);
  const sql =
    GENERATED_SQL[pipeline.id] ??
    buildMockSql(pipeline);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SQL Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            Generated from {activeSteps.length} active step{activeSteps.length !== 1 ? "s" : ""}
            {activeSteps.length < pipeline.steps.length &&
              ` (${pipeline.steps.length - activeSteps.length} inactive step${pipeline.steps.length - activeSteps.length !== 1 ? "s" : ""} skipped)`}
          </p>
        </div>
        <div className="flex-1 overflow-auto">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre">
            {sql}
          </pre>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => navigator.clipboard.writeText(sql)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

function buildMockSql(pipeline: Pipeline): string {
  const activeSteps = pipeline.steps.filter((s) => s.active);
  const lines: string[] = [];

  lines.push(`SELECT *`);
  lines.push(`FROM ${pipeline.schema}.${pipeline.table}`);

  for (const step of activeSteps) {
    switch (step.type) {
      case "filter":
        if (step.config.column && step.config.operator && step.config.value) {
          lines.push(`WHERE ${step.config.column} ${step.config.operator} ${step.config.value}`);
        }
        break;
      case "join":
        if (step.config.right_table) {
          lines.push(
            `${step.config.type ?? "LEFT JOIN"} ${step.config.right_table} ON ${step.config.on_left ?? "?"} = ${step.config.on_right ?? "?"}`,
          );
        }
        break;
      case "group":
        if (step.config.group_by) {
          lines.push(`GROUP BY ${step.config.group_by}`);
          if (step.config.aggregations) {
            lines[0] = `SELECT ${step.config.group_by}, ${step.config.aggregations}`;
          }
        }
        break;
      case "sort":
        if (step.config.column) {
          lines.push(`ORDER BY ${step.config.column} ${step.config.direction ?? "ASC"}`);
        }
        break;
      case "rename":
        if (step.config.from_column && step.config.to_column) {
          lines.push(`-- RENAME: ${step.config.from_column} -> ${step.config.to_column}`);
        }
        break;
      case "cast":
        if (step.config.column && step.config.target_type) {
          lines.push(`-- CAST: ${step.config.column} AS ${step.config.target_type}`);
        }
        break;
      case "add_column":
        if (step.config.column_name && step.config.expression) {
          lines.push(`-- ADD COLUMN: ${step.config.column_name} = ${step.config.expression}`);
        }
        break;
      case "remove_column":
        if (step.config.columns) {
          lines.push(`-- REMOVE COLUMNS: ${step.config.columns}`);
        }
        break;
      case "deduplicate":
        if (step.config.columns) {
          lines.push(`-- DEDUPLICATE ON: ${step.config.columns} (keep: ${step.config.keep ?? "first"})`);
        }
        break;
      case "sample":
        if (step.config.size) {
          lines.push(`-- SAMPLE: ${step.config.method ?? "random"} ${step.config.size}`);
        }
        break;
      case "pivot":
        if (step.config.columns && step.config.values) {
          lines.push(`-- PIVOT: ${step.config.agg ?? "SUM"}(${step.config.values}) ON ${step.config.columns}`);
        }
        break;
      case "unpivot":
        if (step.config.unpivot_columns) {
          lines.push(`-- UNPIVOT: ${step.config.unpivot_columns} INTO ${step.config.key_column ?? "key"} / ${step.config.value_column ?? "value"}`);
        }
        break;
    }
  }

  return lines.join("\n");
}
