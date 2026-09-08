"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import styles from "./page.module.css";

type Direction = "long" | "short";

type Result = {
  breakEvenWinRate: number;
  direction: Direction;
  ratio: number;
  rewardDistance: number;
  riskDistance: number;
};

function calculate(
  direction: Direction,
  entryPrice: number,
  stopLossPrice: number,
  targetPrice: number,
): Result {
  const riskDistance = Math.abs(entryPrice - stopLossPrice);
  const rewardDistance = Math.abs(targetPrice - entryPrice);
  const ratio = rewardDistance / riskDistance;

  return {
    breakEvenWinRate: 100 / (1 + ratio),
    direction,
    ratio,
    rewardDistance,
    riskDistance,
  };
}

export default function RiskRewardCalculatorPage() {
  const [direction, setDirection] = useState<Direction>("long");
  const [entryPrice, setEntryPrice] = useState("1.1000");
  const [stopLossPrice, setStopLossPrice] = useState("1.0950");
  const [targetPrice, setTargetPrice] = useState("1.1100");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(() =>
    calculate("long", 1.1, 1.095, 1.11),
  );

  function changeDirection(nextDirection: Direction) {
    setDirection(nextDirection);
    setError("");

    if (nextDirection === "short") {
      setStopLossPrice("1.1050");
      setTargetPrice("1.0900");
      setResult(calculate("short", 1.1, 1.105, 1.09));
      return;
    }

    setStopLossPrice("1.0950");
    setTargetPrice("1.1100");
    setResult(calculate("long", 1.1, 1.095, 1.11));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entry = Number(entryPrice);
    const stop = Number(stopLossPrice);
    const target = Number(targetPrice);
    const values = [entry, stop, target];

    if (!values.every(Number.isFinite) || values.some((value) => value <= 0)) {
      setError("Enter numbers greater than zero in every price field.");
      return;
    }

    const hasValidLongPrices =
      direction === "long" && stop < entry && target > entry;
    const hasValidShortPrices =
      direction === "short" && stop > entry && target < entry;

    if (!hasValidLongPrices && !hasValidShortPrices) {
      setError(
        direction === "long"
          ? "For a long trade, stop loss must be below entry and target above entry."
          : "For a short trade, stop loss must be above entry and target below entry.",
      );
      return;
    }

    setError("");
    setResult(calculate(direction, entry, stop, target));
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
          <span>Risk to Reward</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Risk-to-Reward Calculator</h1>
          <p>
            Compare the distance to your stop loss with the distance to your
            target before entering.
          </p>
        </section>

        <form className={styles.calculator} onSubmit={submit} noValidate>
          <div className={styles.fields}>
            <label>
              <span>Trade direction</span>
              <select
                value={direction}
                onChange={(event) =>
                  changeDirection(event.target.value as Direction)
                }
              >
                <option value="long">Long / Buy</option>
                <option value="short">Short / Sell</option>
              </select>
            </label>
            <label>
              <span>Entry price</span>
              <input
                type="number"
                min="0.000001"
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
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={stopLossPrice}
                onChange={(event) => setStopLossPrice(event.target.value)}
              />
            </label>
            <label>
              <span>Target price</span>
              <input
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={targetPrice}
                onChange={(event) => setTargetPrice(event.target.value)}
              />
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
          <h2>Risk-to-reward ratio</h2>
          <p>1 : {result.ratio.toFixed(2)}</p>
          <div>
            Potential reward is {result.ratio.toFixed(2)} times the planned risk
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Risk distance</dt>
              <dd>{result.riskDistance.toFixed(4)}</dd>
            </div>
            <div>
              <dt>Reward distance</dt>
              <dd>{result.rewardDistance.toFixed(4)}</dd>
            </div>
            <div>
              <dt>Break-even win rate</dt>
              <dd>{result.breakEvenWinRate.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Direction</dt>
              <dd>{result.direction === "long" ? "Long" : "Short"}</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          The calculation compares price distance only. It does not include
          spread, fees, slippage, financing costs or position size.
        </aside>

        <aside className={styles.disclaimer}>
          This is an educational estimate only, not a prediction or guarantee. A
          favourable ratio does not mean a trade will succeed.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
