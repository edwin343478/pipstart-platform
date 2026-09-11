import type { FormEventHandler, ReactNode } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { joinClasses } from "./utils";
export type EmailCaptureProps = {
  buttonLabel?: string;
  className?: string;
  description?: ReactNode;
  inputId: string;
  label?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};
export function EmailCapture({
  buttonLabel = "Join free",
  className,
  description,
  inputId,
  label = "Email address",
  onSubmit,
}: EmailCaptureProps) {
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <form className={joinClasses("space-y-3", className)} onSubmit={onSubmit}>
      <label className="block font-semibold" htmlFor={inputId}>
        {label}
      </label>
      {description ? (
        <p id={descriptionId} className="text-sm text-muted">
          {description}
        </p>
      ) : null}
      <Input
        id={inputId}
        name="email"
        type="email"
        autoComplete="email"
        required
        aria-describedby={descriptionId}
      />
      <Button type="submit">{buttonLabel}</Button>
    </form>
  );
}
