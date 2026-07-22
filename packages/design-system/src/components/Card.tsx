import { cn } from "../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
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
        "rounded-xl p-6",
        {
          "bg-white shadow-sm border border-gray-200": variant === "default",
          "bg-white shadow-lg": variant === "elevated",
          "bg-white border-2 border-gray-200": variant === "bordered",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
