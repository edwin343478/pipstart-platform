import type { ComponentPropsWithRef, ReactNode } from "react";

import { joinClasses } from "./utils";

export type CheckboxProps = Omit<
  ComponentPropsWithRef<"input">,
  "id" | "type"
> & {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
};

export function Checkbox({
  id,
  label,
  description,
  error,
  className,
  containerClassName,
  ...props
}: CheckboxProps) {
  const descriptionId = description ? `${id}-description` : undefined;

  const errorId = error ? `${id}-error` : undefined;

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={joinClasses("space-y-2", containerClassName)}>
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={id}
          type="checkbox"
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={joinClasses(
            "mt-1 h-5 w-5 shrink-0 rounded border-border",
            "bg-surface accent-action",
            "focus:outline-none focus:ring-2 focus:ring-focus",
            "focus:ring-offset-2 focus:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "outline outline-1 outline-danger",
            className,
          )}
        />

        <div className="min-w-0">
          <label
            htmlFor={id}
            className="text-sm font-medium leading-6 text-foreground"
          >
            {label}
          </label>

          {description ? (
            <div
              id={descriptionId}
              className="mt-1 text-sm leading-6 text-muted"
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="pl-8 text-sm font-medium text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
