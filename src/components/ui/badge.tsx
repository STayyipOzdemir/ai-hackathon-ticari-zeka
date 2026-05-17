import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "bg-white/5 text-foreground/80 border-card-border",
  brand: "bg-brand/15 text-brand border-brand/30",
  success: "bg-brand-2/15 text-brand-2 border-brand-2/30",
  warning: "bg-accent/15 text-accent border-accent/30",
  danger: "bg-danger/15 text-danger border-danger/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className
      )}
      {...rest}
    />
  );
}
