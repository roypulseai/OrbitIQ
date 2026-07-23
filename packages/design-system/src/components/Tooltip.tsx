import { cn } from "../lib/utils";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export function Tooltip({
  content,
  position = "top",
  children,
}: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={cn(
          "absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-surface-4 border border-border-strong rounded-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none",
          "whitespace-nowrap",
          positionClasses[position]
        )}
      >
        {content}
      </div>
    </div>
  );
}
