import type { DetailsHTMLAttributes, ReactNode } from "react";
import { joinClasses } from "./utils";
export type AccordionProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
  summary: ReactNode;
};
export function Accordion({
  children,
  className,
  summary,
  ...props
}: AccordionProps) {
  return (
    <details
      className={joinClasses(
        "rounded-xl border border-border bg-surface",
        className,
      )}
      {...props}
    >
      <summary className="min-h-11 cursor-pointer px-4 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        {summary}
      </summary>
      <div className="px-4 pb-4 text-muted">{children}</div>
    </details>
  );
}
