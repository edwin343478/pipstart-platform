import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

function joinClasses(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
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