import { describe, expect, it } from "vitest";

import {
  inputErrorProps,
  safeCalculation,
  validateNumericFields,
} from "./calculator-validation";

describe("calculator form validation", () => {
  it("identifies the first invalid field", () => {
    expect(
      validateNumericFields([
        { field: "balance", label: "account balance", minimum: 0, value: NaN },
        { field: "risk", label: "risk percentage", minimum: 0, value: -1 },
      ]),
    ).toEqual({
      field: "balance",
      message: "Enter a valid account balance.",
    });
  });

  it("enforces inclusive numeric boundaries", () => {
    expect(
      validateNumericFields([
        {
          field: "periods",
          label: "number of periods",
          maximum: 1_200,
          minimum: 1,
          value: 1_201,
        },
      ]),
    ).toEqual({
      field: "periods",
      message: "number of periods cannot be greater than 1200.",
    });
  });

  it("associates the message only with the invalid input", () => {
    const error = { field: "risk", message: "Invalid risk." };

    expect(inputErrorProps(error, "risk")).toEqual({
      "aria-describedby": "calculator-error-risk",
      "aria-invalid": true,
    });
    expect(inputErrorProps(error, "balance")).toEqual({
      "aria-describedby": undefined,
      "aria-invalid": undefined,
    });
  });

  it("blocks an unsafe result so the caller can preserve its last result", () => {
    const previousResult = { value: 25 };
    const calculation = safeCalculation(() => {
      throw new RangeError("Unsafe result.");
    });

    expect(calculation).toEqual({
      error: { field: "form", message: "Unsafe result." },
      result: null,
    });
    expect(previousResult).toEqual({ value: 25 });
  });
});
