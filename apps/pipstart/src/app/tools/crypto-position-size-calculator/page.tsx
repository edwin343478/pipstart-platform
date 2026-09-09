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
import {
  type CalculatorFormError,
  inputErrorProps,
  safeCalculation,
  validateNumericFields,
} from "../calculator-validation";
import CalculatorError from "../components/calculator-error";
import RelatedLesson from "../components/related-lesson";
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
  const [error, setError] = useState<CalculatorFormError | null>(null);
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

    const validationError = validateNumericFields([
      {
        field: "balance",
        label: "account balance",
        minimum: 0.01,
        value: values[0],
      },
      {
        field: "risk",
        label: "risk per trade",
        minimum: 0.01,
        maximum: 100,
        value: values[1],
      },
      {
        field: "entry",
        label: "entry price",
        minimum: 0.00000001,
        value: values[2],
      },
      {
        field: "stop",
        label: "stop-loss price",
        minimum: 0.00000001,
        value: values[3],
      },
      {
        field: "minimum",
        label: "minimum order quantity",
        minimum: 0.00000001,
        value: values[4],
      },
      {
        field: "step",
        label: "quantity step",
        minimum: 0.00000001,
        value: values[5],
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (values[2] === values[3]) {
      setError({
        field: "stop",
        message: "Entry price and stop-loss price must be different.",
      });
      return;
    }
    if (tradingMode === "spot" && direction !== "long") {
      setError({
        field: "direction",
        message: "Spot positions must use the Long / Buy direction.",
      });
      return;
    }
    if (
      (direction === "long" && values[3] >= values[2]) ||
      (direction === "short" && values[3] <= values[2])
    ) {
      setError({
        field: "stop",
        message:
          direction === "long"
            ? "A long position requires a stop price below the entry price."
            : "A short position requires a stop price above the entry price.",
      });
      return;
    }

    const calculation = safeCalculation(() =>
      calculateCryptoPositionSize(
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
      ),
    );
    if (!calculation.result) {
      setError(calculation.error);
      return;
    }
    const nextResult = calculation.result;
    if (!nextResult.meetsMinimumOrder) {
      setError({
        field: "minimum",
        message: `The calculated quantity is below the ${minimumOrderQuantity} ${asset} minimum order.`,
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
                {...inputErrorProps(error, "direction")}
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
                {...inputErrorProps(error, "balance")}
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
                {...inputErrorProps(error, "risk")}
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
                {...inputErrorProps(error, "minimum")}
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
                {...inputErrorProps(error, "step")}
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
                {...inputErrorProps(error, "entry")}
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
                {...inputErrorProps(error, "stop")}
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

          <CalculatorError className={styles.error} error={error} />
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

        <RelatedLesson
          description="Learn the cryptocurrency foundations behind assets, prices and market risk."
          href="/learn/crypto/level-1"
          title="Cryptocurrency Foundation Path"
        />

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
