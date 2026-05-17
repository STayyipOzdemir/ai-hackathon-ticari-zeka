"use client";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  className?: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md";
}

export function InfoTip({ text, className, align = "center", size = "sm" }: Props) {
  const [open, setOpen] = useState(false);

  const alignClass =
    align === "left"
      ? "left-0 translate-x-0"
      : align === "right"
        ? "right-0 left-auto translate-x-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <span
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-muted hover:text-foreground focus:outline-none",
          size === "sm" ? "size-4" : "size-5"
        )}
        aria-label="Açıklama"
      >
        <HelpCircle className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
      {open && (
        <span
          role="tooltip"
          className={cn(
            "absolute top-full mt-1.5 z-50 w-56 rounded-lg border border-card-border bg-background/95 backdrop-blur px-3 py-2 text-xs text-foreground/90 leading-snug shadow-xl normal-case font-normal tracking-normal",
            alignClass
          )}
        >
          {text}
        </span>
      )}
    </span>
  );
}
