"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

interface DropdownItem {
  label: string;
  value: string;
  onClick?: () => void;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "left" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1",
            {
              "left-0": align === "left",
              "right-0": align === "right",
            }
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                {
                  "text-red-600 hover:bg-red-50": item.danger,
                  "text-gray-700": !item.danger,
                }
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
