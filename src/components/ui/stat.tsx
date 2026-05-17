import * as React from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
  className?: string;
}

const toneClass = {
  default: "text-foreground",
  success: "text-brand-2",
  warning: "text-accent",
  danger: "text-danger",
};

export function Stat({ label, value, hint, tone = "default", icon, className }: StatProps) {
  return (
    <div className={cn("glass rounded-2xl p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className={cn("mt-2 text-3xl font-semibold tracking-tight", toneClass[tone])}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
