"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { accountCurrencies } from "../position-size-calculator/instruments";
import {
  calculateGainRecovery,
  type GainRecoveryResult,
} from "../../../lib/calculator-engine";
import styles from "../position-size-calculator/page.module.css";

export default function GainRecoveryCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [currentBalance, setCurrentBalance] = useState("8000");
  const [recoveryTarget, setRecoveryTarget] = useState("10000");
  const [gainPerPeriod, setGainPerPeriod] = useState("5");
  const [error, setError] = useState("");
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

    if (!values.every(Number.isFinite) || values.some((value) => value <= 0)) {
      setError("Enter values greater than zero in every numeric field.");
      return;
    }

    if (values[1] <= values[0]) {
      setError("The recovery target must be greater than the current balance.");
      return;
    }

    setError("");
    setResult(
      calculateGainRecovery(values[0], values[1], values[2], accountCurrency),
    );
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

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit">Calculate</button>
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

        <aside className={styles.disclaimer}>
          This is an educational mathematical illustration, not a forecast,
          target or guarantee. Real returns are uneven and losses can continue.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
