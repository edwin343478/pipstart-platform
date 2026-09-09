"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  accountCurrencies,
  instrumentGroups,
} from "../position-size-calculator/instruments";
import {
  calculatePipValue,
  type PipValueResult,
} from "../../../lib/calculator-engine";
import styles from "../position-size-calculator/page.module.css";

export default function PipValueCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [instrument, setInstrument] = useState("EUR/USD");
  const [lots, setLots] = useState("1");
  const [conversionRate, setConversionRate] = useState("1");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PipValueResult>(() =>
    calculatePipValue("EUR/USD", 1, 1, "USD"),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [Number(lots), Number(conversionRate)];

    if (!values.every(Number.isFinite) || values.some((value) => value <= 0)) {
      setError("Enter numbers greater than zero in every numeric field.");
      return;
    }

    setError("");
    setResult(
      calculatePipValue(instrument, values[0], values[1], accountCurrency),
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
          <span>Pip Value</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Pip Value Calculator</h1>
          <p>
            See what a one-pip price movement is worth for your selected
            position size.
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
              <span>Position size (lots)</span>
              <input
                type="number"
                min="0.0001"
                step="0.01"
                inputMode="decimal"
                value={lots}
                onChange={(event) => setLots(event.target.value)}
              />
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
          <h2>Value per pip</h2>
          <p>
            {result.accountCurrency} {result.valuePerPip.toFixed(2)}
          </p>
          <div>
            For {result.lots.toFixed(2)} standard lot
            {result.lots === 1 ? "" : "s"} of {result.instrument}
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Position size</dt>
              <dd>{result.positionSize.toLocaleString("en-US")} units</dd>
            </div>
            <div>
              <dt>Pip size</dt>
              <dd>{result.pipSize}</dd>
            </div>
            <div>
              <dt>Value per 10 pips</dt>
              <dd>
                {result.accountCurrency} {(result.valuePerPip * 10).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Instrument</dt>
              <dd>{result.instrument}</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Forex calculations use the instrument&apos;s pip size and contract
          size. Metal specifications can vary, so confirm contract details with
          your broker.
        </aside>

        <aside className={styles.disclaimer}>
          This is an educational estimate only. Broker contract specifications,
          account conversion and pricing may change the actual pip value.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
