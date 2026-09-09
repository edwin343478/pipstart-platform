"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { accountCurrencies } from "../position-size-calculator/instruments";
import {
  calculateDollarCostAveraging,
  type DollarCostAveragingResult,
} from "../../../lib/calculator-engine";
import styles from "../position-size-calculator/page.module.css";

const assets = [
  { label: "Bitcoin (BTC)", symbol: "BTC" },
  { label: "Ethereum (ETH)", symbol: "ETH" },
  { label: "Solana (SOL)", symbol: "SOL" },
  { label: "BNB", symbol: "BNB" },
  { label: "XRP", symbol: "XRP" },
  { label: "Other asset", symbol: "units" },
] as const;

const frequencies = [
  { label: "Monthly", purchasesPerMonth: 1 },
  { label: "Twice monthly", purchasesPerMonth: 2 },
  { label: "Weekly", purchasesPerMonth: 4 },
] as const;

export default function DollarCostAveragingCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [assetSymbol, setAssetSymbol] = useState("BTC");
  const [investmentPerPurchase, setInvestmentPerPurchase] = useState("100");
  const [purchasesPerMonth, setPurchasesPerMonth] = useState("1");
  const [durationMonths, setDurationMonths] = useState("12");
  const [startingPrice, setStartingPrice] = useState("60000");
  const [endingPrice, setEndingPrice] = useState("72000");
  const [error, setError] = useState("");
  const [result, setResult] = useState<DollarCostAveragingResult>(() =>
    calculateDollarCostAveraging(
      "USD",
      "BTC",
      100,
      1,
      "monthly",
      12,
      60_000,
      72_000,
    ),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(investmentPerPurchase),
      Number(purchasesPerMonth),
      Number(durationMonths),
      Number(startingPrice),
      Number(endingPrice),
    ];

    if (
      !values.every(Number.isFinite) ||
      values.some((value) => value <= 0) ||
      !Number.isInteger(values[2])
    ) {
      setError(
        "Enter values greater than zero. Duration must be a whole number of months.",
      );
      return;
    }

    const purchaseCount = values[1] * values[2];
    if (purchaseCount > 2_400) {
      setError(
        "Choose a duration and frequency totaling no more than 2,400 purchases.",
      );
      return;
    }

    const frequency = frequencies.find(
      (candidate) => candidate.purchasesPerMonth === values[1],
    );
    if (!frequency) {
      setError("Choose a supported purchase frequency.");
      return;
    }

    setError("");
    setResult(
      calculateDollarCostAveraging(
        accountCurrency,
        assetSymbol,
        values[0],
        values[1],
        frequency.label.toLowerCase(),
        values[2],
        values[3],
        values[4],
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
                {accountCurrencies.map((currency) => (
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
                {assets.map((asset) => (
                  <option value={asset.symbol} key={asset.symbol}>
                    {asset.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Investment per purchase</span>
              <input
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
                value={purchasesPerMonth}
                onChange={(event) => setPurchasesPerMonth(event.target.value)}
              >
                {frequencies.map((frequency) => (
                  <option
                    value={frequency.purchasesPerMonth}
                    key={frequency.label}
                  >
                    {frequency.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Duration (months)</span>
              <input
                type="number"
                min="1"
                max="600"
                step="1"
                inputMode="numeric"
                value={durationMonths}
                onChange={(event) => setDurationMonths(event.target.value)}
              />
            </label>
            <label>
              <span>Starting asset price</span>
              <input
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

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit">Calculate</button>
        </form>

        <section className={styles.result} aria-live="polite">
          <h2>Estimated units accumulated</h2>
          <p>
            {result.units.toLocaleString("en-US", {
              maximumFractionDigits: 8,
            })}{" "}
            {result.assetSymbol}
          </p>
          <div>
            {result.purchaseCount} {result.purchaseFrequency} purchases of{" "}
            {result.accountCurrency} {result.investmentPerPurchase.toFixed(2)}
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Total contributed</dt>
              <dd>
                {result.accountCurrency} {result.totalContributed.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Average cost</dt>
              <dd>
                {result.accountCurrency} {result.averageCost.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Ending value</dt>
              <dd>
                {result.accountCurrency} {result.endingValue.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Illustrated difference</dt>
              <dd>
                {result.illustratedDifference >= 0 ? "+" : "-"}
                {result.accountCurrency}{" "}
                {Math.abs(result.illustratedDifference).toFixed(2)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Each recurring contribution is divided by an evenly changing
          illustrative asset price. Fees, spreads and slippage are excluded.
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
