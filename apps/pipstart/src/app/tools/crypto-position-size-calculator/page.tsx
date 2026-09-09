"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  calculateCryptoPositionSize,
  type CryptoPositionSizeResult,
  type CryptoTradingMode,
  type TradeDirection,
} from "../../../lib/calculator-engine";
import { cryptoAccountCurrencies, majorCryptoAssets } from "../crypto-options";
import styles from "./page.module.css";

export default function CryptoPositionSizeCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [tradingMode, setTradingMode] = useState<CryptoTradingMode>("spot");
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [balance, setBalance] = useState("1000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [asset, setAsset] = useState("BTC");
  const [entryPrice, setEntryPrice] = useState("60000");
  const [stopLossPrice, setStopLossPrice] = useState("58800");
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState("0.0001");
  const [quantityStep, setQuantityStep] = useState("0.0001");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CryptoPositionSizeResult>(() =>
    calculateCryptoPositionSize(
      1000,
      1,
      60000,
      58800,
      "BTC",
      "USD",
      "spot",
      "long",
      0.0001,
      0.0001,
    ),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(balance),
      Number(riskPercent),
      Number(entryPrice),
      Number(stopLossPrice),
      Number(minimumOrderQuantity),
      Number(quantityStep),
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
    if (tradingMode === "spot" && direction !== "long") {
      setError("Spot positions must use the Long / Buy direction.");
      return;
    }
    if (
      (direction === "long" && values[3] >= values[2]) ||
      (direction === "short" && values[3] <= values[2])
    ) {
      setError(
        direction === "long"
          ? "A long position requires a stop price below the entry price."
          : "A short position requires a stop price above the entry price.",
      );
      return;
    }

    const nextResult = calculateCryptoPositionSize(
      values[0],
      values[1],
      values[2],
      values[3],
      asset,
      accountCurrency,
      tradingMode,
      direction,
      values[4],
      values[5],
    );
    if (!nextResult.meetsMinimumOrder) {
      setError(
        `The calculated quantity is below the ${minimumOrderQuantity} ${asset} minimum order.`,
      );
      return;
    }

    setError("");
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
                {cryptoAccountCurrencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Trading mode</span>
              <select
                value={tradingMode}
                onChange={(event) => {
                  const mode = event.target.value as CryptoTradingMode;
                  setTradingMode(mode);
                  if (mode === "spot") setDirection("long");
                }}
              >
                <option value="spot">Spot — cash-funded</option>
                <option value="leveraged">Leveraged / derivative</option>
              </select>
            </label>
            <label>
              <span>Trade direction</span>
              <select
                value={direction}
                disabled={tradingMode === "spot"}
                onChange={(event) =>
                  setDirection(event.target.value as TradeDirection)
                }
              >
                <option value="long">Long / Buy</option>
                {tradingMode === "leveraged" ? (
                  <option value="short">Short / Sell</option>
                ) : null}
              </select>
              <small>
                {tradingMode === "spot"
                  ? "Spot positions are long-only."
                  : "Confirm leverage and liquidation rules with your venue."}
              </small>
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
                {majorCryptoAssets.map((cryptoAsset) => (
                  <option value={cryptoAsset.symbol} key={cryptoAsset.symbol}>
                    {cryptoAsset.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Minimum order quantity</span>
              <input
                type="number"
                min="0.00000001"
                step="any"
                inputMode="decimal"
                value={minimumOrderQuantity}
                onChange={(event) =>
                  setMinimumOrderQuantity(event.target.value)
                }
              />
              <small>Use the minimum shown by your exchange.</small>
            </label>
            <label>
              <span>Quantity step</span>
              <input
                type="number"
                min="0.00000001"
                step="any"
                inputMode="decimal"
                value={quantityStep}
                onChange={(event) => setQuantityStep(event.target.value)}
              />
              <small>The result rounds down to this exchange step.</small>
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
            {result.cappedByBalance
              ? "Position capped by the available cash balance."
              : "Risk-sized position is within the available cash balance."}
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Amount at risk</dt>
              <dd>
                {result.accountCurrency} {result.riskAmount.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Risk-sized quantity</dt>
              <dd>
                {result.riskSizedQuantity.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                })}{" "}
                {result.asset}
              </dd>
            </div>
            <div>
              <dt>Affordable maximum</dt>
              <dd>
                {result.affordableMaximum === null
                  ? "Venue dependent"
                  : `${result.affordableMaximum.toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })} ${result.asset}`}
              </dd>
            </div>
            <div>
              <dt>Position value</dt>
              <dd>
                {result.accountCurrency} {result.positionValue.toFixed(2)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          For spot positions, the final quantity is the lower of the risk-sized
          quantity and the cash-affordable quantity, rounded down to your
          exchange&apos;s quantity step. Leveraged results are risk-sized only;
          venue margin and liquidation rules are not modelled.
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
