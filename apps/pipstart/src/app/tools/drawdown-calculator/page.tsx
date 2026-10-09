"use client";

import { FormEvent, useState } from "react";

import {
  formatCalculatorNumber,
  parseCalculatorNumber,
} from "../../../lib/calculator-format";

import { CalculatorHeader } from "../../../components/calculator-header";
import { Alert, Button } from "@repo/ui";

import { accountCurrencies } from "../position-size-calculator/instruments";
import {
  calculateDrawdown,
  type DrawdownResult,
  type DrawdownUnit,
} from "../../../lib/calculator-engine";
import {
  type CalculatorFormError,
  inputErrorProps,
  safeCalculation,
  validateNumericFields,
} from "../calculator-validation";
import CalculatorError from "../components/calculator-error";
import RelatedLesson from "../components/related-lesson";
import CalculatorLearning from "../components/calculator-learning";
import styles from "../position-size-calculator/page.module.css";

export default function DrawdownCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [currencyNeedsInputs, setCurrencyNeedsInputs] = useState(false);
  const [startingBalance, setStartingBalance] = useState("10000");
  const [drawdown, setDrawdown] = useState("20");
  const [drawdownUnit, setDrawdownUnit] = useState<DrawdownUnit>("percent");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<DrawdownResult>(() =>
    calculateDrawdown(10_000, 20, "percent", "USD"),
  );

  function changeUnit(unit: DrawdownUnit) {
    setDrawdownUnit(unit);
    setDrawdown(unit === "percent" ? "20" : "2000");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const balanceValue = parseCalculatorNumber(startingBalance);
    const drawdownValue = parseCalculatorNumber(drawdown);

    const validationError = validateNumericFields([
      {
        field: "balance",
        label: "starting balance",
        minimum: 0.01,
        value: balanceValue,
      },
      {
        field: "drawdown",
        label: "drawdown",
        minimum: 0,
        value: drawdownValue,
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    const amountLost =
      drawdownUnit === "percent"
        ? balanceValue * (drawdownValue / 100)
        : drawdownValue;

    if (amountLost >= balanceValue) {
      setError({
        field: "drawdown",
        message:
          amountLost === balanceValue
            ? "A total loss leaves no balance to grow. Percentage recovery is not defined."
            : "The drawdown cannot exceed the starting balance.",
      });
      return;
    }

    const calculation = safeCalculation(() =>
      calculateDrawdown(
        balanceValue,
        drawdownValue,
        drawdownUnit,
        accountCurrency,
      ),
    );
    setError(calculation.error);
    if (calculation.result) {
      setResult(calculation.result);
      setCurrencyNeedsInputs(false);
    }
  }

  return (
    <main className={styles.page}>
      <CalculatorHeader className={styles.header} currentLabel="Drawdown" />

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Drawdown Calculator</h1>
          <p>
            See how a loss changes your balance and how much growth is needed to
            return to where you started.
          </p>
        </section>

        <form className={styles.calculator} onSubmit={submit} noValidate>
          <div className={styles.fields}>
            <label>
              <span>Account currency</span>
              <select
                value={accountCurrency}
                onChange={(event) => {
                  if (event.target.value === accountCurrency) return;
                  setAccountCurrency(event.target.value);
                  setStartingBalance("");
                  if (drawdownUnit === "amount") setDrawdown("");
                  setCurrencyNeedsInputs(true);
                  setError({
                    field: "balance",
                    message: `Currency changed to ${event.target.value}. Enter fresh monetary amounts in ${event.target.value}, then calculate again. Amounts are not converted automatically.`,
                  });
                }}
              >
                {accountCurrencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Starting balance</span>
              <input
                {...inputErrorProps(error, "balance")}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={startingBalance}
                onChange={(event) => setStartingBalance(event.target.value)}
              />
            </label>
            <label>
              <span>Drawdown</span>
              <input
                {...inputErrorProps(error, "drawdown")}
                type="number"
                min="0"
                max={drawdownUnit === "percent" ? "99.99" : undefined}
                step="0.01"
                inputMode="decimal"
                value={drawdown}
                onChange={(event) => setDrawdown(event.target.value)}
              />
            </label>
            <label>
              <span>Drawdown unit</span>
              <select
                value={drawdownUnit}
                onChange={(event) =>
                  changeUnit(event.target.value as DrawdownUnit)
                }
              >
                <option value="percent">Percentage (%)</option>
                <option value="amount">Currency amount</option>
              </select>
            </label>
          </div>

          <CalculatorError className={styles.error} error={error} />
          <Button type="submit">Calculate</Button>
        </form>

        <section className={styles.result} aria-live="polite">
          {currencyNeedsInputs && (
            <div>
              Previous result. Currency changed — enter fresh amounts and
              calculate again.
            </div>
          )}
          <h2>Gain required to recover</h2>
          <p>{formatCalculatorNumber(result.recoveryPercent, 2)}%</p>
          <div>
            After a {formatCalculatorNumber(result.drawdownPercent, 2)}%
            drawdown
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Starting balance</dt>
              <dd>
                {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.startingBalance, 2)}
              </dd>
            </div>
            <div>
              <dt>Amount lost</dt>
              <dd>
                {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.amountLost, 2)}
              </dd>
            </div>
            <div>
              <dt>Balance remaining</dt>
              <dd>
                {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.remainingBalance, 2)}
              </dd>
            </div>
            <div>
              <dt>Amount to recover</dt>
              <dd>
                {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.amountLost, 2)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Recovery gain = amount lost ÷ remaining balance × 100. A percentage
          loss always requires a larger percentage gain to recover.
        </aside>

        <CalculatorLearning
          route="drawdown-calculator"
          className={styles.assumption}
        />

        <RelatedLesson
          description="Continue with the Forex learning path before applying recovery calculations."
          href="/learn/forex/level-1"
          title="Forex Kindergarten"
        />

        <Alert className={styles.disclaimer} variant="warning">
          This calculator is an educational illustration, not a forecast or
          guarantee. It excludes deposits, withdrawals, fees and additional
          trading losses.
        </Alert>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
