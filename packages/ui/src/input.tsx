import type { InputHTMLAttributes } from "react";

import { joinClasses } from "./utils";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({
  hasError = false,
  className,
  ...props
}: InputProps) {
  const ariaInvalid =
    props["aria-invalid"] ?? (hasError ? true : undefined);

  return (
    <input
      {...props}
      aria-invalid={ariaInvalid}
      className={joinClasses(
        "block min-h-12 w-full rounded-xl border bg-surface px-4 py-3",
        "text-base text-foreground shadow-sm outline-none",
        "transition duration-200 placeholder:text-muted",
        "focus:border-focus focus:ring-2 focus:ring-focus/30",
        "disabled:cursor-not-allowed disabled:bg-background",
        "disabled:opacity-70",
        hasError
          ? "border-danger focus:border-danger focus:ring-danger/20"
          : "border-border",
        className,
      )}
    />
  );
}