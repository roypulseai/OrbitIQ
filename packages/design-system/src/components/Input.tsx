import { cn } from "../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-muted mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full bg-surface-3 border rounded-lg px-3 py-2 text-sm text-white placeholder-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50",
          "transition-all duration-150",
          {
            "border-border": !error,
            "border-danger focus:ring-danger/40": error,
          },
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-muted">{helperText}</p>
      )}
    </div>
  );
}
