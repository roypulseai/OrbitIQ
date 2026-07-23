import { useEffect } from "react";
import { cn } from "../lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 animate-slide-up",
        "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-elevated",
        "bg-surface-2 border-border"
      )}
      role="alert"
    >
      <span
        className={cn("w-2 h-2 rounded-full shrink-0", {
          "bg-success": type === "success",
          "bg-danger": type === "error",
          "bg-warning": type === "warning",
          "bg-info": type === "info",
        })}
      />
      <span className="text-sm text-white">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-muted hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
