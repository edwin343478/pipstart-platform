import type { HTMLAttributes } from "react";

import { joinClasses } from "./utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({
  padded = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={joinClasses(
        "rounded-2xl border border-border bg-surface shadow-sm",
        padded && "p-6",
        className,
      )}
      {...props}
    />
  );
}