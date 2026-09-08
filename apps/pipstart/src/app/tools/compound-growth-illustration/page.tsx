"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { accountCurrencies } from "../position-size-calculator/instruments";
import styles from "../position-size-calculator/page.module.css";

type ContributionTiming = "end" | "start";

type Result = {
  accountCurrency: string;
  addedContributions: number;
  endingBalance: number;
  growthPerPeriod: number;
  illustratedGrowth: number;
  periods: number;
  startingAmount: number;
  totalContributed: number;
};

function calculate(
  accountCurrency: string,
  startingAmount: number,
  contributionPerPeriod: number,
  periods: number,
  growthPerPeriod: number,
  contributionTiming: ContributionTiming,
): Result {
  const rate = growthPerPeriod / 100;
  let endingBalance = startingAmount;

  for (let index = 0; index < periods; index += 1) {
    if (contributionTiming === "start") {
      endingBalance += contributionPerPeriod;
    }
    endingBalance *= 1 + rate;
    if (contributionTiming === "end") {
      endingBalance += contributionPerPeriod;
    }
  }

  const addedContributions = contributionPerPeriod * periods;
  const totalContributed = startingAmount + addedContributions;

  return {
    accountCurrency,
    addedContributions,
    endingBalance,
    growthPerPeriod,
    illustratedGrowth: endingBalance - totalContributed,
    periods,
    startingAmount,
    totalContributed,
  };
}

export default function CompoundGrowthIllustrationPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [startingAmount, setStartingAmount] = useState("1000");
  const [contributionPerPeriod, setContributionPerPeriod] = useState("100");
  const [periods, setPeriods] = useState("24");
  const [growthPerPeriod, setGrowthPerPeriod] = useState("1");
  const [contributionTiming, setContributionTiming] =
    useState<ContributionTiming>("end");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(() =>
    calculate("USD", 1_000, 100, 24, 1, "end"),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      Number(startingAmount),
      Number(contributionPerPeriod),
      Number(periods),
      Number(growthPerPeriod),
    ];

    if (
      !values.every(Number.isFinite) ||
      values.some((value) => value < 0) ||
      values[2] < 1 ||
      !Number.isInteger(values[2])
    ) {
      setError(
        "Use non-negative amounts and rates, plus a whole number of periods.",
      );
      return;
    }

    if (values[0] === 0 && values[1] === 0) {
      setError("Enter a starting amount, a recurring contribution, or both.");
      return;
    }

    if (values[2] > 1_200) {
      setError("Choose no more than 1,200 periods.");
      return;
    }

    setError("");
    setResult(
      calculate(
        accountCurrency,
        values[0],
        values[1],
        values[2],
        values[3],
        contributionTiming,
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

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit">Calculate</button>
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

        <aside className={styles.disclaimer}>
          This is an educational mathematical illustration, not a forecast,
          promise or investment recommendation. Real returns vary and may be
          negative.
        </aside>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
