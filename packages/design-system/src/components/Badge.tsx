import { cn } from "../lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "sm",
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-red-100 text-red-800": variant === "danger",
          "bg-blue-100 text-blue-800": variant === "info",
        },
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-2.5 py-0.5 text-sm": size === "md",
        }
      )}
    >
      {children}
    </span>
  );
}
