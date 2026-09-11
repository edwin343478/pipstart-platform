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
  calculateProfitLoss,
  type ProfitLossResult,
  type TradeDirection,
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

function signed(value: number, decimals: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}`;
}

export default function ProfitLossCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [instrument, setInstrument] = useState("EUR/USD");
  const [lots, setLots] = useState("1");
  const [entryPrice, setEntryPrice] = useState("1.1000");
  const [exitPrice, setExitPrice] = useState("1.1050");
  const [conversionRate, setConversionRate] = useState("1");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<ProfitLossResult>(() =>
    calculateProfitLoss("long", "EUR/USD", 1, 1.1, 1.105, 1, "USD"),
  );
  const selectedInstrument =
    instruments.find((item) => item.label === instrument) ?? instruments[0];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(lots),
      Number(entryPrice),
      Number(exitPrice),
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
        field: "entry",
        label: "entry price",
        minimum: 0.000001,
        value: values[1],
      },
      {
        field: "exit",
        label: "exit price",
        minimum: 0.000001,
        value: values[2],
      },
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
    if (values[1] === values[2]) {
      setError({
        field: "exit",
        message: "Entry price and exit price must be different.",
      });
      return;
    }

    const calculation = safeCalculation(() =>
      calculateProfitLoss(
        direction,
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
          <span>Profit and Loss</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Profit-and-Loss Calculator</h1>
          <p>
            Estimate the gross profit or loss from the movement between entry
            and exit prices.
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
              <span>Trade direction</span>
              <select
                value={direction}
                onChange={(event) =>
                  setDirection(event.target.value as TradeDirection)
                }
              >
                <option value="long">Long / Buy</option>
                <option value="short">Short / Sell</option>
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
              <span>Entry price</span>
              <input
                {...inputErrorProps(error, "entry")}
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={entryPrice}
                onChange={(event) => setEntryPrice(event.target.value)}
              />
            </label>
            <label>
              <span>Exit price</span>
              <input
                {...inputErrorProps(error, "exit")}
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={exitPrice}
                onChange={(event) => setExitPrice(event.target.value)}
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
          <Button type="submit">Calculate</Button>
        </form>

        <section className={styles.result} aria-live="polite">
          <h2>Estimated gross result</h2>
          <p>
            {result.accountCurrency} {Math.abs(result.profitLoss).toFixed(2)}{" "}
            {result.profitLoss >= 0 ? "profit" : "loss"}
          </p>
          <div>
            {result.direction === "long" ? "Long" : "Short"} {result.instrument}
            {" · "}
            {result.lots.toFixed(2)} standard lot
            {result.lots === 1 ? "" : "s"}
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Price movement</dt>
              <dd>{signed(result.priceMovement, 4)}</dd>
            </div>
            <div>
              <dt>Pip movement</dt>
              <dd>{signed(result.pipMovement, 1)} pips</dd>
            </div>
            <div>
              <dt>Position size</dt>
              <dd>{result.positionSize.toLocaleString("en-US")} units</dd>
            </div>
            <div>
              <dt>Direction</dt>
              <dd>{result.direction === "long" ? "Long" : "Short"}</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          The result is calculated from price movement, position size and
          quote-to-account conversion. Confirm contract specifications with your
          broker.
        </aside>

        <RelatedLesson
          description="Review how Forex prices and pip movements connect to a trade result."
          href="/learn/forex/level-1"
          title="Forex Kindergarten"
        />

        <Alert className={styles.disclaimer} variant="warning">
          This educational estimate excludes spread, commissions, swaps, taxes
          and slippage. Actual results may differ.
        </Alert>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
