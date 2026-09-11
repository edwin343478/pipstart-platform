"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alert, Button } from "@repo/ui";

import {
  accountCurrencies,
  instrumentGroups,
  instruments,
} from "../position-size-calculator/instruments";
import ConversionRateField from "../components/conversion-rate-field";
import InstrumentSpecification from "../components/instrument-specification";
import {
  calculateMargin,
  type MarginResult,
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

export default function MarginCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [instrument, setInstrument] = useState("EUR/USD");
  const [lots, setLots] = useState("1");
  const [marketPrice, setMarketPrice] = useState("1.085");
  const [leverage, setLeverage] = useState("100");
  const [conversionRate, setConversionRate] = useState("1");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<MarginResult>(() =>
    calculateMargin("EUR/USD", 1, 1.085, 100, 1, "USD"),
  );
  const selectedInstrument =
    instruments.find((item) => item.label === instrument) ?? instruments[0];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(lots),
      Number(marketPrice),
      Number(leverage),
      Number(conversionRate),
    ];

    const validationError = validateNumericFields([
      {
        field: "lots",
        label: "position size",
        minimum: 0.0001,
        value: values[0],
      },
      {
        field: "price",
        label: "market price",
        minimum: 0.000001,
        value: values[1],
      },
      { field: "leverage", label: "leverage", minimum: 1, value: values[2] },
      {
        field: "conversion",
        label: "conversion rate",
        minimum: 0.000001,
        value: values[3],
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    const calculation = safeCalculation(() =>
      calculateMargin(
        instrument,
        values[0],
        values[1],
        values[2],
        values[3],
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
            <InstrumentSpecification instrument={selectedInstrument} />
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
                {...inputErrorProps(error, "lots")}
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
                {...inputErrorProps(error, "price")}
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
            <ConversionRateField
              accountCurrency={accountCurrency}
              error={error}
              onChange={setConversionRate}
              quoteCurrency={selectedInstrument.quoteCurrency}
              value={conversionRate}
            />
          </div>

          <CalculatorError className={styles.error} error={error} />
          <Button type="submit">Calculate</Button>
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

        <RelatedLesson
          description="Start with the Forex foundations before using leverage and margin."
          href="/learn/forex/level-1"
          title="Forex Kindergarten"
        />

        <Alert className={styles.disclaimer} variant="warning">
          This is an educational estimate only. Broker contract sizes, leverage
          limits, conversion rates and margin rules can differ. Leverage reduces
          required margin but does not reduce market exposure or potential loss.
        </Alert>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
