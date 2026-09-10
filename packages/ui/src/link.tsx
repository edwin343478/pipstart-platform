import type { AnchorHTMLAttributes } from "react";

import { joinClasses } from "./utils";

export type LinkVariant = "default" | "muted" | "standalone";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
}

const variantClasses: Record<LinkVariant, string> = {
  default: "text-action underline decoration-transparent",
  muted: "text-muted underline decoration-transparent hover:text-foreground",
  standalone: "font-semibold text-action no-underline",
};

export function Link({ variant = "default", className, ...props }: LinkProps) {
  return (
    <a
      className={joinClasses(
        "rounded-sm underline-offset-4 transition-colors duration-200",
        "hover:decoration-current focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
