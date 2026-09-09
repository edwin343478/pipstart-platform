"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  accountCurrencies,
  instrumentGroups,
  instruments,
} from "../position-size-calculator/instruments";
import ConversionRateField from "../components/conversion-rate-field";
import InstrumentSpecification from "../components/instrument-specification";
import {
  calculatePipValue,
  type PipValueResult,
} from "../../../lib/calculator-engine";
import {
  type CalculatorFormError,
  inputErrorProps,
  safeCalculation,
  validateNumericFields,
} from "../calculator-validation";
import CalculatorError from "../components/calculator-error";
import styles from "../position-size-calculator/page.module.css";

export default function PipValueCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [instrument, setInstrument] = useState("EUR/USD");
  const [lots, setLots] = useState("1");
  const [conversionRate, setConversionRate] = useState("1");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<PipValueResult>(() =>
    calculatePipValue("EUR/USD", 1, 1, "USD"),
  );
  const selectedInstrument =
    instruments.find((item) => item.label === instrument) ?? instruments[0];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [Number(lots), Number(conversionRate)];

    const validationError = validateNumericFields([
      {
        field: "lots",
        label: "position size",
        minimum: 0.0001,
        value: values[0],
      },
      {
        field: "conversion",
        label: "conversion rate",
        minimum: 0.000001,
        value: values[1],
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    const calculation = safeCalculation(() =>
      calculatePipValue(instrument, values[0], values[1], accountCurrency),
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
            <ConversionRateField
              accountCurrency={accountCurrency}
              error={error}
              onChange={setConversionRate}
              quoteCurrency={selectedInstrument.quoteCurrency}
              value={conversionRate}
            />
          </div>

          <CalculatorError className={styles.error} error={error} />
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
