import type { HTMLAttributes } from "react";

import { joinClasses } from "./utils";

export type PageStateKind = "empty" | "error" | "loading";

export interface PageStateProps extends HTMLAttributes<HTMLParagraphElement> {
  kind?: PageStateKind;
}

export function PageState({
  className,
  kind = "empty",
  ...props
}: PageStateProps) {
  return (
    <p
      {...props}
      className={joinClasses("text-sm leading-6 text-muted", className)}
      role={kind === "error" ? "alert" : "status"}
      aria-live={kind === "error" ? "assertive" : "polite"}
      aria-busy={kind === "loading" ? true : undefined}
    />
  );
}
