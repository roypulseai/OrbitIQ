"use client";

import { useState } from "react";
import { Clock, Play, Pause, Plus, Trash2, RefreshCw, Calendar, X, Pencil } from "lucide-react";

interface Schedule {
  id: string;
  dashboardName: string;
  cronExpression: string;
  cronDescription: string;
  status: "active" | "paused";
  lastRun: string;
  nextRun: string;
  enabled: boolean;
}

const MOCK_SCHEDULES: Schedule[] = [
  { id: "1", dashboardName: "Sales Overview", cronExpression: "0 */6 * * *", cronDescription: "Every 6 hours", status: "active", lastRun: "2 hours ago", nextRun: "4 hours from now", enabled: true },
  { id: "2", dashboardName: "Executive Summary", cronExpression: "0 8 * * 1-5", cronDescription: "Weekdays at 8:00 AM", status: "active", lastRun: "14 hours ago", nextRun: "10 hours from now", enabled: true },
  { id: "3", dashboardName: "Marketing Analytics", cronExpression: "0 0 * * 0", cronDescription: "Weekly on Sunday", status: "paused", lastRun: "5 days ago", nextRun: "Paused", enabled: false },
  { id: "4", dashboardName: "Financial Dashboard", cronExpression: "0 */2 * * *", cronDescription: "Every 2 hours", status: "active", lastRun: "45 min ago", nextRun: "1 hour 15 min from now", enabled: true },
];

const DASHBOARDS = ["Sales Overview", "Executive Summary", "Marketing Analytics", "Customer Insights", "Financial Dashboard"];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [showModal, setShowModal] = useState(false);
  const [newDash, setNewDash] = useState("");
  const [newCron, setNewCron] = useState("");
  const [newEnabled, setNewEnabled] = useState(true);

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, enabled: !s.enabled, status: s.enabled ? "paused" : "active" }
          : s
      )
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreate = () => {
    if (!newDash.trim() || !newCron.trim()) return;
    const newSchedule: Schedule = {
      id: String(Date.now()),
      dashboardName: newDash,
      cronExpression: newCron,
      cronDescription: newCron,
      status: newEnabled ? "active" : "paused",
      lastRun: "Never",
      nextRun: newEnabled ? "Pending" : "Paused",
      enabled: newEnabled,
    };
    setSchedules((prev) => [...prev, newSchedule]);
    setShowModal(false);
    setNewDash("");
    setNewCron("");
    setNewEnabled(true);
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-6 h-6 text-accent" />
            Scheduled Refreshes
          </h1>
          <p className="text-sm text-muted mt-1">Automate dashboard data refreshes on a schedule.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Schedule
        </button>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="surface-card p-5 group hover:border-border-strong transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => toggleSchedule(schedule.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${schedule.enabled ? "bg-accent" : "bg-surface-5"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${schedule.enabled ? "translate-x-5" : ""}`} />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">{schedule.dashboardName}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${schedule.status === "active" ? "bg-success-muted text-success" : "bg-surface-4 text-muted"}`}>
                      {schedule.status === "active" ? <RefreshCw className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {schedule.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs font-mono text-accent/80 bg-accent/10 px-2 py-0.5 rounded">{schedule.cronExpression}</span>
                    <span className="text-xs text-muted">{schedule.cronDescription}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 ml-4">
                <div className="text-right hidden md:block">
                  <div className="text-[11px] text-muted">Last run: <span className="text-white/70">{schedule.lastRun}</span></div>
                  <div className="text-[11px] text-muted">Next run: <span className="text-white/70">{schedule.nextRun}</span></div>
                </div>
                <div className="flex items-center gap-1">
                  {schedule.enabled && (
                    <button
                      className="p-2 text-muted hover:text-success hover:bg-success-muted rounded-lg transition-colors"
                      title="Run now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="p-2 text-muted hover:text-white hover:bg-surface-4 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 text-muted hover:text-danger hover:bg-danger-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-16">
          <Clock className="w-10 h-10 text-surface-5 mx-auto mb-3" />
          <p className="text-sm text-muted">No schedules configured yet.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            <Plus className="w-4 h-4" /> Create your first schedule
          </button>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="surface-card w-full max-w-md p-6 animate-scale-in border border-border-strong">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Create Schedule</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-muted hover:text-white hover:bg-surface-4 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Dashboard</label>
                <select
                  value={newDash}
                  onChange={(e) => setNewDash(e.target.value)}
                  className="input-dark"
                >
                  <option value="">Select a dashboard...</option>
                  {DASHBOARDS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5">Cron Expression</label>
                <input
                  className="input-dark font-mono"
                  placeholder="0 */6 * * *"
                  value={newCron}
                  onChange={(e) => setNewCron(e.target.value)}
                />
                <p className="text-[11px] text-muted mt-1.5">
                  Examples: <code className="text-accent/80">0 */6 * * *</code> (every 6h), <code className="text-accent/80">0 8 * * 1-5</code> (weekdays 8am), <code className="text-accent/80">0 0 * * 0</code> (weekly Sunday)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Enable schedule</span>
                <button
                  onClick={() => setNewEnabled(!newEnabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${newEnabled ? "bg-accent" : "bg-surface-5"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${newEnabled ? "translate-x-4" : ""}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newDash.trim() || !newCron.trim()}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Calendar className="w-4 h-4" /> Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
