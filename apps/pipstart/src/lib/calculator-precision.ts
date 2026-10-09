const RANGE_ERROR =
  "The inputs produce a result outside the calculator's safe numeric range.";

type Decimal = { coefficient: bigint; exponent: number };
type Fraction = { numerator: bigint; denominator: bigint };

function decimal(value: number): Decimal {
  if (!Number.isFinite(value)) throw new RangeError(RANGE_ERROR);
  const [mantissa, exponent = "0"] = value.toString().split("e");
  const [whole, fraction = ""] = mantissa.split(".");
  return {
    coefficient: BigInt(whole + fraction),
    exponent: Number(exponent) - fraction.length,
  };
}

function fraction(value: number): Fraction {
  const parts = decimal(value);
  return parts.exponent >= 0
    ? {
        numerator: parts.coefficient * BigInt(10) ** BigInt(parts.exponent),
        denominator: BigInt(1),
      }
    : {
        numerator: parts.coefficient,
        denominator: BigInt(10) ** BigInt(-parts.exponent),
      };
}

function product(values: number[]): Fraction {
  return values.reduce<Fraction>(
    (result, value) => {
      if (value < 0) throw new RangeError(RANGE_ERROR);
      const next = fraction(value);
      return {
        numerator: result.numerator * next.numerator,
        denominator: result.denominator * next.denominator,
      };
    },
    { numerator: BigInt(1), denominator: BigInt(1) },
  );
}

// Floor decimal input factors in integer venue steps, not binary-float steps.
export function floorCalculatorRatioToStep(
  numeratorFactors: number[],
  denominatorFactors: number[],
  step: number,
  maximum?: {
    numeratorFactors: number[];
    denominatorFactors: number[];
  },
): number {
  if (!(step > 0)) throw new RangeError(RANGE_ERROR);
  const numerator = product(numeratorFactors);
  const denominator = product([...denominatorFactors, step]);
  if (denominator.numerator <= 0) throw new RangeError(RANGE_ERROR);
  let count =
    (numerator.numerator * denominator.denominator) /
    (numerator.denominator * denominator.numerator);
  if (maximum) {
    const capNumerator = product(maximum.numeratorFactors);
    const capDenominator = product([...maximum.denominatorFactors, step]);
    if (capDenominator.numerator <= BigInt(0)) {
      throw new RangeError(RANGE_ERROR);
    }
    const capCount =
      (capNumerator.numerator * capDenominator.denominator) /
      (capNumerator.denominator * capDenominator.numerator);
    count = count < capCount ? count : capCount;
  }
  if (count > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError(RANGE_ERROR);
  }
  const parts = decimal(step);
  const result = Number(
    (count * parts.coefficient).toString() + "e" + parts.exponent,
  );
  if (!Number.isFinite(result)) throw new RangeError(RANGE_ERROR);
  return result;
}

// Upward rounding is ONLY for an explanatory minimum balance, never trade size.
export function ceilCalculatorRatioToStep(
  numeratorFactors: number[],
  denominatorFactors: number[],
  step: number,
): number {
  if (!(step > 0)) throw new RangeError(RANGE_ERROR);
  const numerator = product(numeratorFactors);
  const denominator = product([...denominatorFactors, step]);
  if (denominator.numerator <= BigInt(0)) throw new RangeError(RANGE_ERROR);
  const top = numerator.numerator * denominator.denominator;
  const bottom = numerator.denominator * denominator.numerator;
  const count = (top + bottom - BigInt(1)) / bottom;
  if (count > BigInt(Number.MAX_SAFE_INTEGER))
    throw new RangeError(RANGE_ERROR);
  const parts = decimal(step);
  const result = Number(
    (count * parts.coefficient).toString() + "e" + parts.exponent,
  );
  if (!Number.isFinite(result)) throw new RangeError(RANGE_ERROR);
  return result;
}

export function subtractCalculatorNumbers(left: number, right: number): number {
  const a = decimal(left);
  const b = decimal(right);
  const exponent = Math.min(a.exponent, b.exponent);
  const difference =
    a.coefficient * BigInt(10) ** BigInt(a.exponent - exponent) -
    b.coefficient * BigInt(10) ** BigInt(b.exponent - exponent);
  return Number(difference.toString() + "e" + exponent);
}

function divideUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - BigInt(1)) / denominator;
}

// Bounded 60-decimal intervals avoid a balance-sized epsilon and huge powers.
// Squaring is capped as soon as the target is exceeded; work is O(log periods).
export function compareCalculatorGrowth(
  current: number,
  target: number,
  gainPercent: number,
  periods: number,
): -1 | 0 | 1 {
  if (
    !(current > 0) ||
    !(target > 0) ||
    !(gainPercent > 0) ||
    !Number.isSafeInteger(periods) ||
    periods < 0
  ) {
    throw new RangeError(RANGE_ERROR);
  }
  const scale = BigInt(10) ** BigInt(60);
  const starting = fraction(current);
  const ending = fraction(target);
  const gain = fraction(gainPercent);
  const targetNumerator = ending.numerator * starting.denominator * scale;
  const targetDenominator = ending.denominator * starting.numerator;
  const targetLower = targetNumerator / targetDenominator;
  const targetUpper = divideUp(targetNumerator, targetDenominator);
  const rateNumerator = gain.numerator + BigInt(100) * gain.denominator;
  const rateDenominator = BigInt(100) * gain.denominator;
  let factorLower = (rateNumerator * scale) / rateDenominator;
  let factorUpper = divideUp(rateNumerator * scale, rateDenominator);
  let lower = scale;
  let upper = scale;
  let remaining = periods;

  while (remaining > 0) {
    if (factorLower > targetUpper) return 1;
    if (remaining % 2 === 1) {
      lower = (lower * factorLower) / scale;
      upper = divideUp(upper * factorUpper, scale);
      if (lower > targetUpper) return 1;
    }
    remaining = Math.floor(remaining / 2);
    if (remaining > 0) {
      factorLower = (factorLower * factorLower) / scale;
      factorUpper = divideUp(factorUpper * factorUpper, scale);
    }
  }
  if (lower > targetUpper) return 1;
  if (upper < targetLower) return -1;
  return 0;
}
