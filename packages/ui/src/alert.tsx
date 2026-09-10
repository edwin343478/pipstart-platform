import type { HTMLAttributes, ReactNode } from "react";

import { joinClasses } from "./utils";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: ReactNode;
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "border-border bg-background text-foreground",
  success: "border-action bg-background text-foreground",
  warning: "border-warning-border bg-warning-soft text-foreground",
  error: "border-danger bg-background text-foreground",
};

export function Alert({
  title,
  variant = "info",
  children,
  className,
  role,
  ...props
}: AlertProps) {
  return (
    <div
      role={role ?? (variant === "error" ? "alert" : "status")}
      className={joinClasses(
        "rounded-xl border p-4 text-sm leading-6",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {title ? <h2 className="font-heading font-bold">{title}</h2> : null}
      <div className={joinClasses(title ? "mt-1" : undefined)}>{children}</div>
    </div>
  );
}
