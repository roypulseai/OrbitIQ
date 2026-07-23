import { cn } from "../lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent";
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        {
          "bg-surface-4 text-muted": variant === "default",
          "bg-success-muted text-success": variant === "success",
          "bg-warning-muted text-warning": variant === "warning",
          "bg-danger-muted text-danger": variant === "danger",
          "bg-info-muted text-info": variant === "info",
          "bg-accent-muted text-accent": variant === "accent",
        },
        {
          "px-2 py-0.5 text-[11px]": size === "sm",
          "px-2.5 py-1 text-xs": size === "md",
        }
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", {
            "bg-muted": variant === "default",
            "bg-success": variant === "success",
            "bg-warning": variant === "warning",
            "bg-danger": variant === "danger",
            "bg-info": variant === "info",
            "bg-accent": variant === "accent",
          })}
        />
      )}
      {children}
    </span>
  );
}
