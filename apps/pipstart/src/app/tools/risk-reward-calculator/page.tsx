"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alert, Button } from "@repo/ui";

import {
  calculateRiskReward,
  type RiskRewardResult,
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
import styles from "./page.module.css";

export default function RiskRewardCalculatorPage() {
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [entryPrice, setEntryPrice] = useState("1.1000");
  const [stopLossPrice, setStopLossPrice] = useState("1.0950");
  const [targetPrice, setTargetPrice] = useState("1.1100");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<RiskRewardResult>(() =>
    calculateRiskReward("long", 1.1, 1.095, 1.11),
  );

  function changeDirection(nextDirection: TradeDirection) {
    setDirection(nextDirection);
    setError(null);

    if (nextDirection === "short") {
      setStopLossPrice("1.1050");
      setTargetPrice("1.0900");
      setResult(calculateRiskReward("short", 1.1, 1.105, 1.09));
      return;
    }

    setStopLossPrice("1.0950");
    setTargetPrice("1.1100");
    setResult(calculateRiskReward("long", 1.1, 1.095, 1.11));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entry = Number(entryPrice);
    const stop = Number(stopLossPrice);
    const target = Number(targetPrice);

    const validationError = validateNumericFields([
      { field: "entry", label: "entry price", minimum: 0.000001, value: entry },
      {
        field: "stop",
        label: "stop-loss price",
        minimum: 0.000001,
        value: stop,
      },
      {
        field: "target",
        label: "target price",
        minimum: 0.000001,
        value: target,
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    const hasValidLongPrices =
      direction === "long" && stop < entry && target > entry;
    const hasValidShortPrices =
      direction === "short" && stop > entry && target < entry;

    if (!hasValidLongPrices && !hasValidShortPrices) {
      const stopIsInvalid =
        direction === "long" ? stop >= entry : stop <= entry;
      setError({
        field: stopIsInvalid ? "stop" : "target",
        message:
          direction === "long"
            ? "For a long trade, stop loss must be below entry and target above entry."
            : "For a short trade, stop loss must be above entry and target below entry.",
      });
      return;
    }

    const calculation = safeCalculation(() =>
      calculateRiskReward(direction, entry, stop, target),
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
                  changeDirection(event.target.value as TradeDirection)
                }
              >
                <option value="long">Long / Buy</option>
                <option value="short">Short / Sell</option>
              </select>
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
              <span>Stop-loss price</span>
              <input
                {...inputErrorProps(error, "stop")}
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
                {...inputErrorProps(error, "target")}
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                value={targetPrice}
                onChange={(event) => setTargetPrice(event.target.value)}
              />
            </label>
          </div>

          <CalculatorError className={styles.error} error={error} />
          <Button type="submit">Calculate</Button>
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

        <RelatedLesson
          description="Build the Forex foundation needed to understand entries, stops and targets."
          href="/learn/forex/level-1"
          title="Forex Kindergarten"
        />

        <Alert className={styles.disclaimer} variant="warning">
          This is an educational estimate only, not a prediction or guarantee. A
          favourable ratio does not mean a trade will succeed.
        </Alert>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
