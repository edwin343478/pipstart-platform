export type CalculatorFormError = {
  field: string;
  message: string;
};

export type NumericField = {
  field: string;
  label: string;
  maximum?: number;
  minimum?: number;
  value: number;
};

export function validateNumericFields(
  fields: NumericField[],
): CalculatorFormError | null {
  for (const field of fields) {
    if (!Number.isFinite(field.value)) {
      return { field: field.field, message: `Enter a valid ${field.label}.` };
    }
    if (field.minimum !== undefined && field.value < field.minimum) {
      return {
        field: field.field,
        message: `${field.label} must be at least ${field.minimum}.`,
      };
    }
    if (field.maximum !== undefined && field.value > field.maximum) {
      return {
        field: field.field,
        message: `${field.label} cannot be greater than ${field.maximum}.`,
      };
    }
  }

  return null;
}

export function inputErrorProps(
  error: CalculatorFormError | null,
  field: string,
) {
  const invalid = error?.field === field;
  return {
    "aria-describedby": invalid ? `calculator-error-${field}` : undefined,
    "aria-invalid": invalid || undefined,
  } as const;
}

export function safeCalculation<T>(calculate: () => T): {
  error: CalculatorFormError | null;
  result: T | null;
} {
  try {
    return { error: null, result: calculate() };
  } catch (error) {
    return {
      error: {
        field: "form",
        message:
          error instanceof RangeError
            ? error.message
            : "The calculation could not be completed with these inputs.",
      },
      result: null,
    };
  }
}
