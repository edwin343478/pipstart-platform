"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import styles from "./page.module.css";

const accountCurrencies = ["USD", "EUR", "GBP", "TZS", "KES", "GHS"];
const cryptoAssets = [
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "USDT",
  "USDC",
];

type Result = {
  accountCurrency: string;
  asset: string;
  balance: number;
  positionQuantity: number;
  positionValue: number;
  riskAmount: number;
  riskPerCoin: number;
  stopDistancePercent: number;
};

function calculate(
  balance: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number,
  asset: string,
  accountCurrency: string,
): Result {
  const riskAmount = balance * (riskPercent / 100);
  const riskPerCoin = Math.abs(entryPrice - stopLossPrice);
  const positionQuantity = riskAmount / riskPerCoin;

  return {
    accountCurrency,
    asset,
    balance,
    positionQuantity,
    positionValue: positionQuantity * entryPrice,
    riskAmount,
    riskPerCoin,
    stopDistancePercent: (riskPerCoin / entryPrice) * 100,
  };
}

export default function CryptoPositionSizeCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [balance, setBalance] = useState("1000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [asset, setAsset] = useState("BTC");
  const [entryPrice, setEntryPrice] = useState("60000");
  const [stopLossPrice, setStopLossPrice] = useState("59000");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(() =>
    calculate(1000, 1, 60000, 59000, "BTC", "USD"),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(balance),
      Number(riskPercent),
      Number(entryPrice),
      Number(stopLossPrice),
    ];

    if (!values.every(Number.isFinite) || values.some((value) => value <= 0)) {
      setError("Enter numbers greater than zero in every numeric field.");
      return;
    }
    if (values[1] > 100) {
      setError("Risk per trade cannot be greater than 100%.");
      return;
    }
    if (values[2] === values[3]) {
      setError("Entry price and stop-loss price must be different.");
      return;
    }

    setError("");
    setResult(
      calculate(
        values[0],
        values[1],
        values[2],
        values[3],
        asset,
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
          <span>Crypto Position Size</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Crypto Position Size Calculator</h1>
          <p>
            Find the maximum crypto position that keeps your risk within your
            own limit.
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
              <span>Crypto asset</span>
              <select
                value={asset}
                onChange={(event) => setAsset(event.target.value)}
              >
                {cryptoAssets.map((cryptoAsset) => (
                  <option key={cryptoAsset}>{cryptoAsset}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Entry price</span>
              <input
                type="number"
                min="0.00000001"
                step="any"
                inputMode="decimal"
                value={entryPrice}
                onChange={(event) => setEntryPrice(event.target.value)}
              />
            </label>
            <label>
              <span>Stop-loss price</span>
              <input
                type="number"
                min="0.00000001"
                step="any"
                inputMode="decimal"
                value={stopLossPrice}
                onChange={(event) => setStopLossPrice(event.target.value)}
              />
              <small>
                Use the planned exit price if the position moves against you.
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
          <p>
            {result.positionQuantity.toFixed(6)} {result.asset}
          </p>
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
              <dt>Risk per coin</dt>
              <dd>
                {result.accountCurrency} {result.riskPerCoin.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Position value</dt>
              <dd>
                {result.accountCurrency} {result.positionValue.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Stop distance</dt>
              <dd>{result.stopDistancePercent.toFixed(2)}%</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Position quantity is calculated from your account risk and the
          difference between entry and stop-loss prices. Confirm minimum order
          sizes and price precision with your exchange.
        </aside>

        <aside className={styles.disclaimer}>
          This is an educational estimate only, not a guarantee of outcome.
          Volatility, fees, slippage and liquidation rules may affect real
          results.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
