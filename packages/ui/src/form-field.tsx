import type { ReactNode } from "react";

import { joinClasses } from "./utils";

export interface FormFieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (controlProps: FormFieldControlProps) => ReactNode;
}

export function FormField({
  id,
  label,
  description,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const descriptionId = description
    ? `${id}-description`
    : undefined;

  const errorId = error ? `${id}-error` : undefined;

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={joinClasses("space-y-2", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-foreground"
      >
        {label}

        {required ? (
          <>
            <span className="text-danger" aria-hidden="true">
              {" "}
              *
            </span>

            <span className="sr-only"> required</span>
          </>
        ) : null}
      </label>

      {description ? (
        <p id={descriptionId} className="text-sm leading-6 text-muted">
          {description}
        </p>
      ) : null}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}