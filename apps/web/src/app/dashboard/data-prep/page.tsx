"use client";

import React, { useState } from "react";
import { Button, Modal } from "@orbitiq/design-system";
import { Layers, Plus, Play, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Pipeline {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "failed";
  steps: number;
  lastRun?: string;
}

const DEMO_PIPELINES: Pipeline[] = [
  { id: "1", name: "Sales Data Enrichment", status: "completed", steps: 4, lastRun: "10 min ago" },
  { id: "2", name: "Customer Segmentation", status: "running", steps: 6 },
  { id: "3", name: "Monthly Revenue Rollup", status: "draft", steps: 3 },
];

const STEP_TYPES = [
  { type: "filter", label: "Filter", description: "Remove rows based on conditions" },
  { type: "rename", label: "Rename Column", description: "Change column names" },
  { type: "cast", label: "Type Cast", description: "Convert column data types" },
  { type: "aggregate", label: "Aggregate", description: "Summarize with GROUP BY" },
  { type: "join", label: "Join", description: "Combine two tables" },
  { type: "pivot", label: "Pivot", description: "Reshape columns to rows" },
  { type: "deduplicate", label: "Deduplicate", description: "Remove duplicate rows" },
  { type: "fillna", label: "Fill Nulls", description: "Replace null values" },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-4 h-4 text-success" />,
  running: <Clock className="w-4 h-4 text-accent animate-pulse" />,
  failed: <AlertCircle className="w-4 h-4 text-danger" />,
  draft: <span className="w-2 h-2 rounded-full bg-surface-6" />,
};

export default function DataPrepPage() {
  const [pipelines] = useState<Pipeline[]>(DEMO_PIPELINES);
  const [showNewPipeline, setShowNewPipeline] = useState(false);
  const [showStepCatalog, setShowStepCatalog] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<string[]>(["filter", "rename", "aggregate"]);
  const [newPipelineName, setNewPipelineName] = useState("");

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Prep</h1>
          <p className="text-sm text-muted mt-1">Build pipelines to clean, transform, and shape your data.</p>
        </div>
        <Button onClick={() => setShowNewPipeline(true)}>
          <Plus className="w-4 h-4" /> New Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline List */}
        <div className="lg:col-span-1 space-y-2">
          {pipelines.map((p) => (
            <div key={p.id} className="surface-card p-4 hover:border-border-strong transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {STATUS_ICON[p.status]}
                  <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                </div>
                <span className="badge-neutral">{p.steps} steps</span>
              </div>
              {p.lastRun && (
                <div className="text-[11px] text-surface-6">Last run: {p.lastRun}</div>
              )}
            </div>
          ))}
        </div>

        {/* Pipeline Editor */}
        <div className="lg:col-span-2">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Sales Data Enrichment</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setShowStepCatalog(true)}>
                  <Plus className="w-4 h-4" /> Add Step
                </Button>
                <Button onClick={() => {}}>
                  <Play className="w-4 h-4" /> Run
                </Button>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {/* Input */}
              <div className="flex items-center gap-3">
                <div className="w-6 flex justify-center">
                  <div className="w-0.5 h-3 bg-border" />
                </div>
                <div className="flex-1 bg-surface-3 border border-border rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Source: sales_raw</div>
                    <div className="text-[11px] text-muted">PostgreSQL → analytics.sales</div>
                  </div>
                </div>
              </div>

              {selectedSteps.map((stepType, i) => {
                const step = STEP_TYPES.find((s) => s.type === stepType)!;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 flex flex-col items-center">
                      <div className="w-0.5 h-3 bg-border" />
                      <div className="w-2 h-2 rounded-full bg-accent/50" />
                      <div className="w-0.5 flex-1 bg-border" />
                    </div>
                    <div className="flex-1 bg-surface-2 border border-border rounded-lg p-3 flex items-center justify-between group/step hover:border-border-strong transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-surface-3 text-[10px] font-bold text-muted flex items-center justify-center">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">{step.label}</div>
                          <div className="text-[11px] text-muted">{step.description}</div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedSteps((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 text-surface-6 hover:text-danger transition-colors opacity-0 group-hover/step:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Output */}
              <div className="flex items-center gap-3">
                <div className="w-6 flex justify-center">
                  <div className="w-0.5 h-3 bg-border" />
                </div>
                <div className="flex-1 bg-surface-3 border border-accent/30 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-success/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Output: sales_clean</div>
                    <div className="text-[11px] text-muted">Preview: 24,891 rows × 8 columns</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated SQL */}
            <div className="mt-5 bg-surface-2 border border-border rounded-lg p-3">
              <div className="text-[11px] text-muted uppercase tracking-wider mb-2">Generated SQL</div>
              <pre className="text-xs font-mono text-green-400 overflow-x-auto">
{`SELECT date_trunc('month', created_at) AS month, region, SUM(amount) AS revenue
FROM sales_raw
WHERE status = 'completed'
GROUP BY month, region`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Step Catalog Modal */}
      {showStepCatalog && (
        <Modal isOpen={showStepCatalog} onClose={() => setShowStepCatalog(false)} title="Add Step">
          <div className="grid grid-cols-2 gap-3">
            {STEP_TYPES.map((step) => (
              <button
                key={step.type}
                onClick={() => {
                  setSelectedSteps((prev) => [...prev, step.type]);
                  setShowStepCatalog(false);
                }}
                className="text-left p-3 bg-surface-2 border border-border rounded-lg hover:border-accent/30 transition-colors"
              >
                <div className="text-xs font-medium text-white mb-0.5">{step.label}</div>
                <div className="text-[11px] text-muted">{step.description}</div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* New Pipeline Modal */}
      {showNewPipeline && (
        <Modal isOpen={showNewPipeline} onClose={() => setShowNewPipeline(false)} title="New Pipeline">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Pipeline Name</label>
              <input className="input-dark" value={newPipelineName} onChange={(e) => setNewPipelineName(e.target.value)} placeholder="e.g., Sales Data Enrichment" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Source</label>
              <select className="input-dark"><option>Production PostgreSQL</option><option>Analytics Snowflake</option></select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowNewPipeline(false)}>Cancel</Button>
              <Button onClick={() => setShowNewPipeline(false)} disabled={!newPipelineName.trim()}>Create</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
