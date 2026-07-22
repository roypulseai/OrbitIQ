"use client";

import { useEffect, useState } from "react";
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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300",
        {
          "bg-green-500 text-white": type === "success",
          "bg-red-500 text-white": type === "error",
          "bg-yellow-500 text-white": type === "warning",
          "bg-blue-500 text-white": type === "info",
          "opacity-0 translate-y-2": !isVisible,
          "opacity-100 translate-y-0": isVisible,
        }
      )}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 hover:opacity-75"
        >
          ×
        </button>
      </div>
    </div>
  );
}
