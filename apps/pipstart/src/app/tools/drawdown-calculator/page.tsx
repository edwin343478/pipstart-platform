"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

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
import styles from "../position-size-calculator/page.module.css";

export default function DrawdownCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
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
    const balanceValue = Number(startingBalance);
    const drawdownValue = Number(drawdown);

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
        minimum: 0.01,
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
        message: "The drawdown must be smaller than the starting balance.",
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
          <span>Drawdown</span>
        </nav>
      </header>

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
                onChange={(event) => setAccountCurrency(event.target.value)}
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
                min="0.01"
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
          <button type="submit">Calculate</button>
        </form>

        <section className={styles.result} aria-live="polite">
          <h2>Gain required to recover</h2>
          <p>{result.recoveryPercent.toFixed(2)}%</p>
          <div>After a {result.drawdownPercent.toFixed(2)}% drawdown</div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Starting balance</dt>
              <dd>
                {result.accountCurrency} {result.startingBalance.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Amount lost</dt>
              <dd>
                {result.accountCurrency} {result.amountLost.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Balance remaining</dt>
              <dd>
                {result.accountCurrency} {result.remainingBalance.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Amount to recover</dt>
              <dd>
                {result.accountCurrency} {result.amountLost.toFixed(2)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Recovery gain = amount lost ÷ remaining balance × 100. A percentage
          loss always requires a larger percentage gain to recover.
        </aside>

        <aside className={styles.disclaimer}>
          This calculator is an educational illustration, not a forecast or
          guarantee. It excludes deposits, withdrawals, fees and additional
          trading losses.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
