import type { HTMLAttributes } from "react";

import { joinClasses } from "./utils";

export interface ProgressBarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  label: string;
  max?: number;
  value: number;
}

export function ProgressBar({
  label,
  max = 100,
  value,
  className,
  ...props
}: ProgressBarProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), safeMax)
    : 0;
  const percentage = Math.round((safeValue / safeMax) * 100);

  return (
    <div className={joinClasses("space-y-2", className)} {...props}>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted">{percentage}%</span>
      </div>
      <progress
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full accent-action"
        max={safeMax}
        value={safeValue}
      />
    </div>
  );
}
