"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  accountCurrencies,
  instrumentGroups,
} from "../position-size-calculator/instruments";
import {
  calculateMargin,
  type MarginResult,
} from "../../../lib/calculator-engine";
import styles from "../position-size-calculator/page.module.css";

export default function MarginCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [instrument, setInstrument] = useState("EUR/USD");
  const [lots, setLots] = useState("1");
  const [marketPrice, setMarketPrice] = useState("1.085");
  const [leverage, setLeverage] = useState("100");
  const [conversionRate, setConversionRate] = useState("1");
  const [error, setError] = useState("");
  const [result, setResult] = useState<MarginResult>(() =>
    calculateMargin("EUR/USD", 1, 1.085, 100, 1, "USD"),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(lots),
      Number(marketPrice),
      Number(leverage),
      Number(conversionRate),
    ];

    if (!values.every(Number.isFinite) || values.some((value) => value <= 0)) {
      setError("Enter numbers greater than zero in every numeric field.");
      return;
    }

    setError("");
    setResult(
      calculateMargin(
        instrument,
        values[0],
        values[1],
        values[2],
        values[3],
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
          <span>Margin</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Margin Calculator</h1>
          <p>
            Estimate how much account equity your broker may set aside to open a
            Forex or metals position.
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
              <span>Market price</span>
              <input
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={marketPrice}
                onChange={(event) => setMarketPrice(event.target.value)}
              />
            </label>
            <label>
              <span>Leverage</span>
              <select
                value={leverage}
                onChange={(event) => setLeverage(event.target.value)}
              >
                {[1, 10, 20, 30, 50, 100, 200, 500, 1000].map((value) => (
                  <option value={value} key={value}>
                    1:{value}
                  </option>
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
          <h2>Estimated required margin</h2>
          <p>
            {result.accountCurrency} {result.requiredMargin.toFixed(2)}
          </p>
          <div>
            For {result.lots.toFixed(2)} standard lot
            {result.lots === 1 ? "" : "s"} of {result.instrument} at 1:
            {result.leverage}
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Position size</dt>
              <dd>{result.positionSize.toLocaleString("en-US")} units</dd>
            </div>
            <div>
              <dt>Notional value</dt>
              <dd>
                {result.accountCurrency} {result.notionalValue.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Margin rate</dt>
              <dd>{result.marginRate.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Leverage</dt>
              <dd>1:{result.leverage}</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Required margin = position size × market price × quote-to-account
          conversion rate ÷ leverage.
        </aside>

        <aside className={styles.disclaimer}>
          This is an educational estimate only. Broker contract sizes, leverage
          limits, conversion rates and margin rules can differ. Leverage reduces
          required margin but does not reduce market exposure or potential loss.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
