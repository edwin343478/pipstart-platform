import type { ButtonHTMLAttributes } from "react";

import { joinClasses } from "./utils";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-action text-action-foreground hover:bg-action-hover",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-background",
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "min-h-10 px-4 py-2 text-sm",
  medium: "min-h-11 px-5 py-2.5 text-base",
  large: "min-h-12 px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(
        "inline-flex items-center justify-center rounded-xl font-semibold",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-focus focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}