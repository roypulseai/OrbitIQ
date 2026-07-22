"use client";

import { useState } from "react";
import { cn } from "../lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap",
            {
              "bottom-full left-1/2 -translate-x-1/2 mb-2": position === "top",
              "top-full left-1/2 -translate-x-1/2 mt-2": position === "bottom",
              "right-full top-1/2 -translate-y-1/2 mr-2": position === "left",
              "left-full top-1/2 -translate-y-1/2 ml-2": position === "right",
            }
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
