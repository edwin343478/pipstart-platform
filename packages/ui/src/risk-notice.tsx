import type { HTMLAttributes, ReactNode } from "react";

import { joinClasses } from "./utils";

export interface RiskNoticeProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  title?: ReactNode;
}

export function RiskNotice({
  title = "Risk notice",
  children,
  className,
  ...props
}: RiskNoticeProps) {
  return (
    <aside
      role="note"
      className={joinClasses(
        "flex gap-4 rounded-2xl border border-warning-border",
        "bg-warning-soft p-5 text-foreground",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className={joinClasses(
          "flex h-8 w-8 shrink-0 items-center justify-center",
          "rounded-full bg-surface font-bold text-warning",
        )}
      >
        !
      </div>

      <div className="min-w-0">
        <h2 className="font-heading text-base font-bold">{title}</h2>

        <div className="mt-1 text-sm leading-6 text-muted">{children}</div>
      </div>
    </aside>
  );
}
