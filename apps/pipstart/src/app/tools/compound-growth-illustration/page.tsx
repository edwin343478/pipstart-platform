"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alert, Button } from "@repo/ui";

import { accountCurrencies } from "../position-size-calculator/instruments";
import {
  calculateCompoundGrowth,
  type CompoundGrowthResult,
  type ContributionTiming,
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

export default function CompoundGrowthIllustrationPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [startingAmount, setStartingAmount] = useState("1000");
  const [contributionPerPeriod, setContributionPerPeriod] = useState("100");
  const [periods, setPeriods] = useState("24");
  const [growthPerPeriod, setGrowthPerPeriod] = useState("1");
  const [contributionTiming, setContributionTiming] =
    useState<ContributionTiming>("end");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<CompoundGrowthResult>(() =>
    calculateCompoundGrowth("USD", 1_000, 100, 24, 1, "end"),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(startingAmount),
      Number(contributionPerPeriod),
      Number(periods),
      Number(growthPerPeriod),
    ];

    const validationError = validateNumericFields([
      {
        field: "startingAmount",
        label: "starting amount",
        minimum: 0,
        value: values[0],
      },
      {
        field: "contribution",
        label: "contribution per period",
        minimum: 0,
        value: values[1],
      },
      {
        field: "periods",
        label: "number of periods",
        maximum: 1_200,
        minimum: 1,
        value: values[2],
      },
      {
        field: "growth",
        label: "illustrative growth per period",
        minimum: 0,
        value: values[3],
      },
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (values[0] === 0 && values[1] === 0) {
      setError({
        field: "startingAmount",
        message: "Enter a starting amount, a recurring contribution, or both.",
      });
      return;
    }

    if (!Number.isInteger(values[2])) {
      setError({
        field: "periods",
        message: "Number of periods must be a whole number.",
      });
      return;
    }

    const calculation = safeCalculation(() =>
      calculateCompoundGrowth(
        accountCurrency,
        values[0],
        values[1],
        values[2],
        values[3],
        contributionTiming,
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
          <span>Compound Growth</span>
        </nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Compound-Growth Illustration</h1>
          <p>
            Explore how a starting amount and equal contributions change under a
            constant hypothetical growth rate.
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
              <span>Starting amount</span>
              <input
                {...inputErrorProps(error, "startingAmount")}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={startingAmount}
                onChange={(event) => setStartingAmount(event.target.value)}
              />
            </label>
            <label>
              <span>Contribution per period</span>
              <input
                {...inputErrorProps(error, "contribution")}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={contributionPerPeriod}
                onChange={(event) =>
                  setContributionPerPeriod(event.target.value)
                }
              />
            </label>
            <label>
              <span>Number of periods</span>
              <input
                {...inputErrorProps(error, "periods")}
                type="number"
                min="1"
                max="1200"
                step="1"
                inputMode="numeric"
                value={periods}
                onChange={(event) => setPeriods(event.target.value)}
              />
            </label>
            <label>
              <span>Illustrative growth per period (%)</span>
              <input
                {...inputErrorProps(error, "growth")}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={growthPerPeriod}
                onChange={(event) => setGrowthPerPeriod(event.target.value)}
              />
              <small>A mathematical assumption, not an expected return.</small>
            </label>
            <label>
              <span>Contribution timing</span>
              <select
                value={contributionTiming}
                onChange={(event) =>
                  setContributionTiming(
                    event.target.value as ContributionTiming,
                  )
                }
              >
                <option value="end">End of each period</option>
                <option value="start">Start of each period</option>
              </select>
            </label>
          </div>

          <CalculatorError className={styles.error} error={error} />
          <Button type="submit">Calculate</Button>
        </form>

        <section className={styles.result} aria-live="polite">
          <h2>Illustrated ending balance</h2>
          <p>
            {result.accountCurrency} {result.endingBalance.toFixed(2)}
          </p>
          <div>
            After {result.periods} period{result.periods === 1 ? "" : "s"} at a
            constant {result.growthPerPeriod.toFixed(2)}% per period
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Starting amount</dt>
              <dd>
                {result.accountCurrency} {result.startingAmount.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Added contributions</dt>
              <dd>
                {result.accountCurrency} {result.addedContributions.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Total contributed</dt>
              <dd>
                {result.accountCurrency} {result.totalContributed.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Illustrated growth</dt>
              <dd>
                {result.accountCurrency} {result.illustratedGrowth.toFixed(2)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Growth is applied once per period at the same selected rate.
          Contributions are added at the selected point in each period.
        </aside>

        <RelatedLesson
          description="Build a foundation before interpreting hypothetical long-term growth."
          href="/learn/crypto/level-1"
          title="Cryptocurrency Foundation Path"
        />

        <Alert className={styles.disclaimer} variant="warning">
          This is an educational mathematical illustration, not a forecast,
          promise or investment recommendation. Real returns vary and may be
          negative.
        </Alert>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
