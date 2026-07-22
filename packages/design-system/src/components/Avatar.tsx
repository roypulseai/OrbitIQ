import { cn } from "../lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

export function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  const initials = fallback || alt?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium",
        {
          "w-8 h-8 text-xs": size === "sm",
          "w-10 h-10 text-sm": size === "md",
          "w-12 h-12 text-base": size === "lg",
        }
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
