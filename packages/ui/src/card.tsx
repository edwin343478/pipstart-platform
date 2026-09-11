import { cloneElement, isValidElement } from "react";
import type { HTMLAttributes, ReactElement } from "react";

import { joinClasses } from "./utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  padded?: boolean;
}

export function Card({
  asChild = false,
  padded = true,
  className,
  children,
  ...props
}: CardProps) {
  const classes = joinClasses(
    "rounded-2xl border border-border bg-surface text-foreground shadow-sm",
    padded && "p-6",
    className,
  );

  if (asChild) {
    if (!isValidElement(children))
      throw new Error("Card with asChild requires one element child.");
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ...props,
      className: joinClasses(classes, child.props.className),
    });
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
