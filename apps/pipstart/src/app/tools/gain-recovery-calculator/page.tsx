"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alert, Button } from "@repo/ui";

import { accountCurrencies } from "../position-size-calculator/instruments";
import {
  calculateGainRecovery,
  type GainRecoveryResult,
} from "../../../lib/calculator-engine";
import {
  type CalculatorFormError,
  inputErrorProps,
  safeCalculation,
  validateNumericFields,
} from "../calculator-validation";
import CalculatorError from "../components/calculator-error";
import RelatedLesson from "../components/related-lesson";
import styles from "../position-size-calculator/page.module.css";

export default function GainRecoveryCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [currentBalance, setCurrentBalance] = useState("8000");
  const [recoveryTarget, setRecoveryTarget] = useState("10000");
  const [gainPerPeriod, setGainPerPeriod] = useState("5");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<GainRecoveryResult>(() =>
    calculateGainRecovery(8_000, 10_000, 5, "USD"),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(currentBalance),
      Number(recoveryTarget),
      Number(gainPerPeriod),
    ];

    const validationError = validateNumericFields([
      {
        field: "current",
        label: "current balance",
        minimum: 0.01,
        value: values[0],
      },
      {
        field: "target",
        label: "recovery target",
        minimum: 0.01,
        value: values[1],
      },
      {
        field: "gain",
        label: "planned gain per period",
        minimum: 0.01,
        value: values[2],
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (values[1] <= values[0]) {
      setError({
        field: "target",
        message:
          "The recovery target must be greater than the current balance.",
      });
      return;
    }

    const calculation = safeCalculation(() =>
      calculateGainRecovery(values[0], values[1], values[2], accountCurrency),
    );
    setError(calculation.error);
    if (calculation.result) setResult(calculation.result);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <nav aria-label="Breadcrumb">
          <Link href="/tools">Tools</Link>
          <span aria-hidden="true"> / </span>
          <span>Gain Recovery</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Gain-Recovery Calculator</h1>
          <p>
            Estimate how many equal compounding periods it would take for a
            reduced balance to reach a chosen recovery target.
          </p>
        </section>

        <form className={styles.calculator} onSubmit={submit} noValidate>
          <div className={styles.fields}>
            <label>
              <span>Account currency</span>
              <select
                value={accountCurrency}
                onChange={(event) => setAccountCurrency(event.target.value)}
              >
                {accountCurrencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Current balance</span>
              <input
                {...inputErrorProps(error, "current")}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={currentBalance}
                onChange={(event) => setCurrentBalance(event.target.value)}
              />
            </label>
            <label>
              <span>Recovery target</span>
              <input
                {...inputErrorProps(error, "target")}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={recoveryTarget}
                onChange={(event) => setRecoveryTarget(event.target.value)}
              />
            </label>
            <label>
              <span>Planned gain per period (%)</span>
              <input
                {...inputErrorProps(error, "gain")}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={gainPerPeriod}
                onChange={(event) => setGainPerPeriod(event.target.value)}
              />
              <small>
                A mathematical scenario, not a recommended or expected return.
              </small>
            </label>
          </div>

          <CalculatorError className={styles.error} error={error} />
          <Button type="submit">Calculate</Button>
        </form>

        <section className={styles.result} aria-live="polite">
          <h2>Estimated recovery time</h2>
          <p>
            {result.periods} period{result.periods === 1 ? "" : "s"}
          </p>
          <div>
            At {result.gainPerPeriod.toFixed(2)}% compounded growth per period
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Current balance</dt>
              <dd>
                {result.accountCurrency} {result.currentBalance.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Recovery target</dt>
              <dd>
                {result.accountCurrency} {result.recoveryTarget.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Total gain needed</dt>
              <dd>{result.totalGainNeeded.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Projected balance</dt>
              <dd>
                {result.accountCurrency} {result.projectedBalance.toFixed(2)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Periods required = log(target ÷ current balance) ÷ log(1 + gain per
          period). The result rounds up to the next complete period.
        </aside>

        <RelatedLesson
          description="Continue with the Forex learning path before exploring compounded recovery."
          href="/learn/forex/level-1"
          title="Forex Kindergarten"
        />

        <Alert className={styles.disclaimer} variant="warning">
          This is an educational mathematical illustration, not a forecast,
          target or guarantee. Real returns are uneven and losses can continue.
        </Alert>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
