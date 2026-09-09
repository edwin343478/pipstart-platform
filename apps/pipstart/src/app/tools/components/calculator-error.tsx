import type { CalculatorFormError } from "../calculator-validation";

export default function CalculatorError({
  className,
  error,
}: {
  className: string;
  error: CalculatorFormError | null;
}) {
  if (!error) return null;

  return (
    <p
      className={className}
      id={`calculator-error-${error.field}`}
      role="alert"
    >
      {error.message}
    </p>
  );
}
