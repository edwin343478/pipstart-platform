import type { ReactNode } from "react";

type PageStateProps = {
  children: ReactNode;
  className?: string;
  kind?: "empty" | "error" | "loading";
};

export function PageState({
  children,
  className,
  kind = "empty",
}: PageStateProps) {
  return (
    <p
      className={className}
      role={kind === "error" ? "alert" : "status"}
      aria-live={kind === "error" ? "assertive" : "polite"}
    >
      {children}
    </p>
  );
}
