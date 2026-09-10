import type { HTMLAttributes } from "react";

import { joinClasses } from "./utils";

export type BadgeVariant = "neutral" | "accent" | "warning";
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-background text-muted",
  accent: "bg-background text-action",
  warning: "bg-warning-soft text-warning",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={joinClasses(
        "inline-flex items-center rounded-full px-2.5 py-1",
        "text-xs font-semibold leading-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
