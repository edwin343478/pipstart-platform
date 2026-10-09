// Preserve the established fixed-decimal display for ordinary values.
// Smaller accepted values retain meaningful digits instead of becoming zero.
export function formatCalculatorNumber(
  value: number,
  minimumFractionDigits = 2,
  maximumFractionDigits = minimumFractionDigits,
  useGrouping = false,
): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return (0).toFixed(minimumFractionDigits);
  const magnitude = Math.abs(value);
  let maximum = maximumFractionDigits;
  if (magnitude < 10 ** -maximum) {
    maximum = Math.max(maximum, 2 - Math.floor(Math.log10(magnitude)));
  }
  if (maximum > 16 || magnitude >= 1e21) return value.toExponential(4);
  return value.toLocaleString("en-US", {
    useGrouping,
    minimumFractionDigits,
    maximumFractionDigits: maximum,
  });
}

export function parseCalculatorNumber(value: string): number {
  return value.trim() === "" ? NaN : Number(value);
}
