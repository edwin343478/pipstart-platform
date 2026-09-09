"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  calculateDollarCostAveraging,
  type DollarCostAveragingResult,
  type DollarCostAveragingFrequency,
} from "../../../lib/calculator-engine";
import { cryptoAccountCurrencies, majorCryptoAssets } from "../crypto-options";
import {
  type CalculatorFormError,
  inputErrorProps,
  safeCalculation,
  validateNumericFields,
} from "../calculator-validation";
import CalculatorError from "../components/calculator-error";
import styles from "../position-size-calculator/page.module.css";

const frequencies = [
  { label: "Weekly", value: "weekly" },
  { label: "Every two weeks", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
] as const;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function initialDates() {
  const start = new Date();
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 3);
  return { end: isoDate(end), start: isoDate(start) };
}

const defaults = initialDates();

export default function DollarCostAveragingCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [assetSymbol, setAssetSymbol] = useState("BTC");
  const [investmentPerPurchase, setInvestmentPerPurchase] = useState("100");
  const [purchaseFrequency, setPurchaseFrequency] =
    useState<DollarCostAveragingFrequency>("weekly");
  const [firstPurchaseDate, setFirstPurchaseDate] = useState(defaults.start);
  const [planEndDate, setPlanEndDate] = useState(defaults.end);
  const [startingPrice, setStartingPrice] = useState("50000");
  const [endingPrice, setEndingPrice] = useState("60000");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<DollarCostAveragingResult>(() =>
    calculateDollarCostAveraging(
      "USD",
      "BTC",
      100,
      "weekly",
      defaults.start,
      defaults.end,
      50_000,
      60_000,
    ),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(investmentPerPurchase),
      Number(startingPrice),
      Number(endingPrice),
    ];

    const validationError = validateNumericFields([
      {
        field: "investment",
        label: "investment per purchase",
        minimum: 0.01,
        value: values[0],
      },
      {
        field: "startingPrice",
        label: "starting asset price",
        minimum: 0.000001,
        value: values[1],
      },
      {
        field: "endingPrice",
        label: "ending asset price",
        minimum: 0.000001,
        value: values[2],
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!firstPurchaseDate || !planEndDate || planEndDate < firstPurchaseDate) {
      setError({
        field: !firstPurchaseDate ? "startDate" : "endDate",
        message:
          "The plan end date must be on or after the first purchase date.",
      });
      return;
    }

    const calculation = safeCalculation(() =>
      calculateDollarCostAveraging(
        accountCurrency,
        assetSymbol,
        values[0],
        purchaseFrequency,
        firstPurchaseDate,
        planEndDate,
        values[1],
        values[2],
      ),
    );
    if (!calculation.result) {
      setError(calculation.error);
      return;
    }
    const nextResult = calculation.result;
    if (nextResult.purchaseCount >= 2_400) {
      setError({
        field: "endDate",
        message: "Choose a date range containing fewer than 2,400 purchases.",
      });
      return;
    }

    setError(null);
    setResult(nextResult);
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
          <span>Dollar-Cost Averaging</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Dollar-Cost-Averaging Calculator</h1>
          <p>
            Explore how equal recurring purchases accumulate units as an
            asset&apos;s price changes over time.
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
                {cryptoAccountCurrencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Asset</span>
              <select
                value={assetSymbol}
                onChange={(event) => setAssetSymbol(event.target.value)}
              >
                {majorCryptoAssets.map((asset) => (
                  <option value={asset.symbol} key={asset.symbol}>
                    {asset.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Investment per purchase</span>
              <input
                {...inputErrorProps(error, "investment")}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={investmentPerPurchase}
                onChange={(event) =>
                  setInvestmentPerPurchase(event.target.value)
                }
              />
            </label>
            <label>
              <span>Purchase frequency</span>
              <select
                value={purchaseFrequency}
                onChange={(event) =>
                  setPurchaseFrequency(
                    event.target.value as DollarCostAveragingFrequency,
                  )
                }
              >
                {frequencies.map((frequency) => (
                  <option value={frequency.value} key={frequency.value}>
                    {frequency.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>First purchase date</span>
              <input
                {...inputErrorProps(error, "startDate")}
                type="date"
                value={firstPurchaseDate}
                onChange={(event) => setFirstPurchaseDate(event.target.value)}
              />
            </label>
            <label>
              <span>Plan end date</span>
              <input
                {...inputErrorProps(error, "endDate")}
                type="date"
                min={firstPurchaseDate}
                value={planEndDate}
                onChange={(event) => setPlanEndDate(event.target.value)}
              />
            </label>
            <label>
              <span>Starting asset price</span>
              <input
                {...inputErrorProps(error, "startingPrice")}
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={startingPrice}
                onChange={(event) => setStartingPrice(event.target.value)}
              />
            </label>
            <label>
              <span>Ending asset price</span>
              <input
                {...inputErrorProps(error, "endingPrice")}
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={endingPrice}
                onChange={(event) => setEndingPrice(event.target.value)}
              />
              <small>
                Prices between the two points are spread evenly for
                illustration.
              </small>
            </label>
          </div>

          <CalculatorError className={styles.error} error={error} />
          <button type="submit">Calculate</button>
        </form>

        <section className={styles.result} aria-live="polite">
          <h2>Illustrated ending value</h2>
          <p>
            {result.accountCurrency} {result.endingValue.toFixed(2)}
          </p>
          <div>
            {result.purchaseCount} purchases generated from actual calendar
            dates.
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Purchase count</dt>
              <dd>{result.purchaseCount}</dd>
            </div>
            <div>
              <dt>Total invested</dt>
              <dd>
                {result.accountCurrency} {result.totalContributed.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Units accumulated</dt>
              <dd>
                {result.units.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                })}{" "}
                {result.assetSymbol}
              </dd>
            </div>
            <div>
              <dt>Average cost</dt>
              <dd>
                {result.accountCurrency} {result.averageCost.toFixed(2)}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.schedule}>
          <h2>Generated schedule</h2>
          <dl>
            <div>
              <dt>First purchase</dt>
              <dd>{result.firstPurchaseDate ?? "—"}</dd>
            </div>
            <div>
              <dt>Last purchase on or before end date</dt>
              <dd>{result.lastPurchaseDate ?? "—"}</dd>
            </div>
            <div>
              <dt>Calendar rule</dt>
              <dd>
                {result.purchaseFrequency === "weekly"
                  ? "Every 7 days"
                  : result.purchaseFrequency === "biweekly"
                    ? "Every 14 days"
                    : "Same calendar day each month"}
              </dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Purchase dates follow the selected calendar rule. Monthly dates use
          the same day where available and the month&apos;s final day otherwise.
          Each contribution is divided by an evenly changing illustrative price;
          fees, spreads and slippage are excluded.
        </aside>

        <aside className={styles.disclaimer}>
          This is an educational illustration, not investment advice or a return
          forecast. Crypto prices can fall sharply, and dollar-cost averaging
          does not guarantee profit or prevent loss.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
