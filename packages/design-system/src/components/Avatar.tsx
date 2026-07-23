import { cn } from "../lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

export function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  const initials = fallback || alt?.charAt(0)?.toUpperCase() || "?";

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("rounded-full object-cover", sizeClasses[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium",
        sizeClasses[size]
      )}
    >
      {initials}
    </div>
  );
}
