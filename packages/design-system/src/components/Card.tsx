import { cn } from "../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "interactive";
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 transition-all duration-150",
        {
          "bg-surface-2 border border-border": variant === "default",
          "bg-surface-3 border border-border-strong shadow-card": variant === "elevated",
          "bg-surface-2 border-2 border-border-strong": variant === "bordered",
          "bg-surface-2 border border-border hover:border-border-strong hover:shadow-card cursor-pointer": variant === "interactive",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
