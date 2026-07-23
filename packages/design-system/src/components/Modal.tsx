import { useEffect, useCallback } from "react";
import { cn } from "../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-surface-2 border border-border rounded-xl shadow-elevated p-6 animate-scale-in",
          {
            "w-full max-w-sm": size === "sm",
            "w-full max-w-md": size === "md",
            "w-full max-w-lg": size === "lg",
          }
        )}
      >
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
