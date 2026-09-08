"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  accountCurrencies,
  instrumentGroups,
  instruments,
} from "./instruments";
import styles from "./page.module.css";

type Result = {
  accountCurrency: string;
  balance: number;
  lots: number;
  positionSize: number;
  riskAmount: number;
};

function calculate(
  balance: number,
  riskPercent: number,
  stopLoss: number,
  conversionRate: number,
  instrumentLabel: string,
  accountCurrency: string,
): Result {
  const instrument = instruments.find(
    (candidate) => candidate.label === instrumentLabel,
  );

  if (!instrument) {
    throw new Error("Unsupported instrument.");
  }

  const riskAmount = balance * (riskPercent / 100);
  const riskPerUnit = stopLoss * instrument.pipSize * conversionRate;
  const positionSize = Math.floor(riskAmount / riskPerUnit);

  return {
    accountCurrency,
    balance,
    positionSize,
    riskAmount,
    lots: positionSize / instrument.contractSize,
  };
}

export default function PositionSizeCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [balance, setBalance] = useState("1000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [stopLoss, setStopLoss] = useState("25");
  const [instrument, setInstrument] = useState("EUR/USD");
  const [conversionRate, setConversionRate] = useState("1");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(() =>
    calculate(1000, 1, 25, 1, "EUR/USD", "USD"),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(balance),
      Number(riskPercent),
      Number(stopLoss),
      Number(conversionRate),
    ];

    if (!values.every(Number.isFinite) || values.some((value) => value <= 0)) {
      setError("Enter numbers greater than zero in every numeric field.");
      return;
    }
    if (values[1] > 100) {
      setError("Risk per trade cannot be greater than 100%.");
      return;
    }

    setError("");
    setResult(
      calculate(
        values[0],
        values[1],
        values[2],
        values[3],
        instrument,
        accountCurrency,
      ),
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
          <span>Position Size</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Position Size Calculator</h1>
          <p>
            Find the maximum position size that keeps your risk within your own
            limit.
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
              <span>Account balance</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
              />
            </label>
            <label>
              <span>Risk per trade (%)</span>
              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                inputMode="decimal"
                value={riskPercent}
                onChange={(event) => setRiskPercent(event.target.value)}
              />
            </label>
            <label>
              <span>Stop loss (pips)</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                inputMode="decimal"
                value={stopLoss}
                onChange={(event) => setStopLoss(event.target.value)}
              />
            </label>
            <label>
              <span>Currency pair or metal</span>
              <select
                value={instrument}
                onChange={(event) => setInstrument(event.target.value)}
              >
                {instrumentGroups.map((instrumentGroup) => (
                  <optgroup
                    label={instrumentGroup.label}
                    key={instrumentGroup.label}
                  >
                    {instrumentGroup.instruments.map((item) => (
                      <option key={item.label}>{item.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label>
              <span>Quote-to-account conversion rate</span>
              <input
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={conversionRate}
                onChange={(event) => setConversionRate(event.target.value)}
              />
              <small>
                Use 1 when the instrument&apos;s quote currency matches your
                account currency.
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
          <h2>Maximum position size</h2>
          <p>{result.positionSize.toLocaleString("en-US")} units</p>
          <div>
            Risking {result.accountCurrency} {result.riskAmount.toFixed(2)} of
            your {result.accountCurrency}{" "}
            {result.balance.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}{" "}
            balance
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Amount at risk</dt>
              <dd>
                {result.accountCurrency} {result.riskAmount.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Standard lots</dt>
              <dd>{result.lots.toFixed(4)}</dd>
            </div>
            <div>
              <dt>Mini lots</dt>
              <dd>{(result.lots * 10).toFixed(3)}</dd>
            </div>
            <div>
              <dt>Micro lots</dt>
              <dd>{(result.lots * 100).toFixed(2)}</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Forex uses 100,000 units per standard lot. Metal calculations use 100
          oz for XAU/USD and 5,000 oz for XAG/USD; confirm specifications with
          your broker.
        </aside>

        <aside className={styles.disclaimer}>
          This is an educational estimate only, not a guarantee of outcome.
          Actual broker execution, spreads and slippage will affect real
          results.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
