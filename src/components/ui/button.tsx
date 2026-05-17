"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const variantClass: Record<Variant, string> = {
  primary: "btn-primary rounded-xl",
  ghost: "text-foreground/80 hover:text-foreground hover:bg-white/5 rounded-xl",
  outline:
    "border border-card-border text-foreground hover:bg-white/5 rounded-xl",
  danger:
    "bg-danger/90 hover:bg-danger text-white rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
          sizeClass[size],
          variantClass[variant],
          className
        )}
        {...rest}
      >
        {loading && (
          <span
            aria-hidden
            className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
