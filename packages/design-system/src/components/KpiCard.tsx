import { cn } from "../lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  sparkline?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  sparkline,
  className,
}: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn("kpi-card group", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <span className="text-muted group-hover:text-accent transition-colors">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-2">
        <div>
          <div className="text-kpi font-bold text-white tabular-nums">
            {value}
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  isPositive ? "text-success" : "text-danger"
                )}
              >
                <svg
                  className={cn("w-3 h-3", { "rotate-180": !isPositive })}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                {isPositive ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-[11px] text-muted">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {sparkline && <div className="h-8 w-16 opacity-60">{sparkline}</div>}
      </div>
    </div>
  );
}
