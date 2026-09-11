import type { CalculatorFormError } from "../calculator-validation";
import { PageState } from "@repo/ui";

export default function CalculatorError({
  className,
  error,
}: {
  className: string;
  error: CalculatorFormError | null;
}) {
  if (!error) return null;

  return (
    <PageState
      className={className}
      id={`calculator-error-${error.field}`}
      kind="error"
    >
      {error.message}
    </PageState>
  );
}
