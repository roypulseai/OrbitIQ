"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, FileText, Trash2, Eye, Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UploadedFile {
  id: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

interface SchemaColumn {
  name: string;
  inferredType: string;
  nullPercentage: number;
  cardinality: number;
  sampleValues: string[];
  detectedFormat?: string;
  maxLength?: number;
}

interface SchemaProfile {
  id: string;
  fileId: string;
  tableName: string;
  columns: SchemaColumn[];
  rowCount: number;
  columnCount: number;
  status: string;
}

interface IngestedTable {
  id: string;
  fileId: string;
  tableName: string;
  schema: string;
}

const TYPE_BADGES: Record<string, string> = {
  integer: "badge-info",
  float: "badge-info",
  string: "badge-default",
  boolean: "badge-success",
  date: "badge-accent",
  datetime: "badge-accent",
  timestamp: "badge-accent",
  currency: "badge-warning",
  percentage: "badge-warning",
  unknown: "badge-default",
};

const TYPE_ICONS: Record<string, string> = {
  email: "@",
  phone: "#",
  url: "://",
  zip: "ZIP",
  ip: "IP",
  uuid: "UUID",
};

export default function IngestionPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [profile, setProfile] = useState<SchemaProfile | null>(null);
  const [tables, setTables] = useState<IngestedTable[]>([]);
  const [uploading, setUploading] = useState(false);
  const [profiling, setProfiling] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", "default");
      formData.append("uploadedBy", "user");

      const res = await fetch("http://localhost:4001/api/v1/ingestion/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFiles(prev => [...prev, { ...data, uploadedAt: new Date(data.uploadedAt).toLocaleString() }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleProfile = async (fileId: string) => {
    setProfiling(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4001/api/v1/ingestion/profile/${fileId}`, { method: "POST" });
      if (!res.ok) throw new Error("Profiling failed");
      const data = await res.json();
      setProfile(data);
      setSelectedFile(files.find(f => f.id === fileId) || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profiling failed");
    } finally {
      setProfiling(false);
    }
  };

  const handleIngest = async (fileId: string) => {
    setIngesting(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4001/api/v1/ingestion/ingest/${fileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Ingestion failed");
      const data = await res.json();
      setTables(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingestion failed");
    } finally {
      setIngesting(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const table = tables.find(t => t.fileId === fileId);
      if (table) {
        await fetch(`http://localhost:4001/api/v1/ingestion/tables/${table.id}`, { method: "DELETE" });
        setTables(prev => prev.filter(t => t.id !== table.id));
      }
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
        setProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith(".csv") || name.endsWith(".tsv")) return <FileText className="w-5 h-5" />;
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) return <FileSpreadsheet className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Ingestion</h1>
          <p className="text-sm text-muted mt-1">Upload CSV, Excel, or Parquet files and ingest them into DuckDB.</p>
        </div>
      </div>

      {error && (
        <div className="surface-card p-4 mb-4 border border-danger/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger" />
          <span className="text-sm text-danger">{error}</span>
          <button className="ml-auto text-xs text-muted hover:text-white" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div
        className={`surface-card p-8 mb-6 border-2 border-dashed transition-colors cursor-pointer ${
          dragActive ? "border-accent bg-accent/5" : "border-border hover:border-border-strong"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.tsv,.xlsx,.xls,.parquet,.json"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center justify-center text-center">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
          ) : (
            <Upload className="w-10 h-10 text-muted mb-3" />
          )}
          <p className="text-sm font-medium text-white mb-1">
            {uploading ? "Uploading..." : "Drop files here or click to browse"}
          </p>
          <p className="text-xs text-muted">
            Supports CSV, TSV, Excel (.xlsx/.xls), Parquet, and JSON files
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="surface-card p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-4 flex items-center justify-center text-muted">
                    {getFileIcon(file.originalName)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{file.originalName}</div>
                    <div className="text-xs text-muted">{formatBytes(file.sizeBytes)} &middot; {file.uploadedAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg bg-surface-4 text-white hover:bg-accent/20 hover:text-accent transition-colors disabled:opacity-50"
                    onClick={() => handleProfile(file.id)}
                    disabled={profiling}
                  >
                    {profiling ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
                    Profile
                  </button>
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-50"
                    onClick={() => handleIngest(file.id)}
                    disabled={ingesting || tables.some(t => t.fileId === file.id)}
                  >
                    {ingesting ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : <Database className="w-3 h-3 inline mr-1" />}
                    {tables.some(t => t.fileId === file.id) ? "Ingested" : "Ingest"}
                  </button>
                  <button
                    className="text-xs px-2 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tables.length > 0 && (
        <div className="surface-card p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Ingested Tables</h3>
          <div className="space-y-2">
            {tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <div>
                    <div className="text-sm font-medium text-white">{table.tableName}</div>
                    <div className="text-xs text-muted">{table.schema} schema &middot; DuckDB</div>
                  </div>
                </div>
                <button className="text-xs text-accent hover:underline">Open in Explore</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile && (
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Schema Profile: {profile.tableName}
            </h3>
            <div className="text-xs text-muted">
              {profile.rowCount.toLocaleString()} rows &middot; {profile.columnCount} columns
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted font-medium">Column</th>
                  <th className="text-left py-2 px-3 text-muted font-medium">Type</th>
                  <th className="text-right py-2 px-3 text-muted font-medium">Null %</th>
                  <th className="text-right py-2 px-3 text-muted font-medium">Cardinality</th>
                  <th className="text-left py-2 px-3 text-muted font-medium">Format</th>
                  <th className="text-left py-2 px-3 text-muted font-medium">Sample Values</th>
                </tr>
              </thead>
              <tbody>
                {profile.columns.map((col) => (
                  <tr key={col.name} className="border-b border-border/50 hover:bg-surface-2 transition-colors">
                    <td className="py-2 px-3 font-mono text-white">{col.name}</td>
                    <td className="py-2 px-3">
                      <span className={TYPE_BADGES[col.inferredType] || "badge-default"}>
                        {col.inferredType}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-muted">
                      {col.nullPercentage.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right text-muted">
                      {col.cardinality.toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      {col.detectedFormat ? (
                        <span className="badge-accent">
                          {TYPE_ICONS[col.detectedFormat] || col.detectedFormat}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-muted max-w-[200px] truncate">
                      {col.sampleValues.slice(0, 3).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
