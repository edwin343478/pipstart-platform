"use client";

import { FormEvent, useState } from "react";

import {
  formatCalculatorNumber,
  parseCalculatorNumber,
} from "../../../lib/calculator-format";

import { CalculatorHeader } from "../../../components/calculator-header";
import { Alert, Button } from "@repo/ui";

import ConversionRateField from "../components/conversion-rate-field";
import CalculatorError from "../components/calculator-error";
import InstrumentSpecification from "../components/instrument-specification";
import RelatedLesson from "../components/related-lesson";
import CalculatorLearning from "../components/calculator-learning";
import {
  type CalculatorFormError,
  inputErrorProps,
  safeCalculation,
  validateNumericFields,
} from "../calculator-validation";
import {
  accountCurrencies,
  instrumentGroups,
  instruments,
} from "./instruments";
import {
  calculatePositionSize,
  type PositionSizeResult,
} from "../../../lib/calculator-engine";
import styles from "./page.module.css";

export default function PositionSizeCalculatorPage() {
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [balance, setBalance] = useState("1000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [stopLoss, setStopLoss] = useState("25");
  const [instrument, setInstrument] = useState("EUR/USD");
  const [conversionRate, setConversionRate] = useState("1");
  const [error, setError] = useState<CalculatorFormError | null>(null);
  const [result, setResult] = useState<PositionSizeResult>(() =>
    calculatePositionSize(1000, 1, 25, 1, "EUR/USD", "USD"),
  );
  const selectedInstrument =
    instruments.find((item) => item.label === instrument) ?? instruments[0];
  const resultMatchesInputs =
    accountCurrency === result.accountCurrency &&
    instrument === result.instrument &&
    parseCalculatorNumber(balance) === result.balance &&
    parseCalculatorNumber(riskPercent) === result.riskPercent &&
    parseCalculatorNumber(stopLoss) === result.stopLoss &&
    parseCalculatorNumber(conversionRate) === result.conversionRate;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = [
      parseCalculatorNumber(balance),
      parseCalculatorNumber(riskPercent),
      parseCalculatorNumber(stopLoss),
      parseCalculatorNumber(conversionRate),
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
      { field: "stop", label: "stop loss", minimum: 0.1, value: values[2] },
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

    const calculation = safeCalculation(() =>
      calculatePositionSize(
        values[0],
        values[1],
        values[2],
        values[3],
        instrument,
        accountCurrency,
      ),
    );
    setError(calculation.error);
    if (calculation.result) setResult(calculation.result);
  }

  return (
    <main className={styles.page}>
      <CalculatorHeader
        className={styles.header}
        currentLabel="Position Size"
      />

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Position Size Calculator</h1>
          <p>
            Find the maximum position size that keeps your risk within your own
            limit.
          </p>
        </section>

        <form className={styles.calculator} onSubmit={submit} noValidate>
          <div className={styles.fields}>
            <label>
              <span>Account currency</span>
              <select
                value={accountCurrency}
                onChange={(event) => {
                  if (event.target.value === accountCurrency) return;
                  setAccountCurrency(event.target.value);
                  setBalance("");
                  setError({
                    field: "balance",
                    message: `Currency changed to ${event.target.value}. Enter fresh monetary amounts in ${event.target.value}, then calculate again. Amounts are not converted automatically.`,
                  });
                }}
              >
                {accountCurrencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
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
              <small>
                Balance in {accountCurrency}. Changing currency does not convert
                this amount.
              </small>
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
              <span>Stop loss (pips)</span>
              <input
                {...inputErrorProps(error, "stop")}
                type="number"
                min="0.1"
                step="0.1"
                inputMode="decimal"
                value={stopLoss}
                onChange={(event) => setStopLoss(event.target.value)}
              />
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
            <InstrumentSpecification instrument={selectedInstrument} />
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
          <h2>Maximum position size</h2>
          {!resultMatchesInputs ? (
            <div>Previous result. Inputs have changed — calculate again.</div>
          ) : null}
          <p>
            {result.meetsMinimumVolume
              ? `${result.positionSize.toLocaleString("en-US")} units`
              : "No position fits"}
          </p>
          <div>
            {result.meetsMinimumVolume ? (
              <>
                Risking {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.riskAmount, 2)} of your{" "}
                {result.accountCurrency}{" "}
                {result.balance.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}{" "}
                balance, within your {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.riskLimit, 2)} risk limit
              </>
            ) : (
              <>
                Your risk limit is {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.riskLimit, 2, 8)}. At this stop
                distance, the {formatCalculatorNumber(result.minimumVolume, 2)}
                -lot minimum would risk {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.minimumRiskAmount, 2)}. No order
                fits that limit with these instrument specifications. With your
                selected risk percentage, stop distance and conversion rate, the
                calculated minimum account balance is {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.minimumRequiredBalance, 2)}. This
                is a calculation threshold, not a recommendation to add funds or
                increase risk.
              </>
            )}
          </div>
          <div>
            Rounded down to the {formatCalculatorNumber(result.volumeStep, 2)}
            -lot volume step.
            {!result.meetsMinimumVolume
              ? ` This is below the ${formatCalculatorNumber(result.minimumVolume, 2)}-lot minimum, so no executable position is shown.`
              : ""}
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>Amount at risk</dt>
              <dd>
                {result.accountCurrency}{" "}
                {formatCalculatorNumber(result.riskAmount, 2)}
              </dd>
            </div>
            <div>
              <dt>Standard lots</dt>
              <dd>{formatCalculatorNumber(result.lots, 4)}</dd>
            </div>
            <div>
              <dt>Mini lots</dt>
              <dd>{formatCalculatorNumber(result.lots * 10, 3)}</dd>
            </div>
            <div>
              <dt>Micro lots</dt>
              <dd>{formatCalculatorNumber(result.lots * 100, 2)}</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.assumption}>
          Forex uses 100,000 units per standard lot. Metal calculations use 100
          oz for XAU/USD and 5,000 oz for XAG/USD; confirm specifications with
          your broker.
        </aside>

        <CalculatorLearning
          route="position-size-calculator"
          className={styles.assumption}
        />

        <RelatedLesson
          description="Learn how Forex prices, pips and currency pairs work before sizing a trade."
          href="/learn/forex/level-1"
          title="Forex Kindergarten"
        />

        <Alert className={styles.disclaimer} variant="warning">
          This is an educational estimate only, not a guarantee of outcome.
          Actual broker execution, spreads and slippage will affect real
          results.
        </Alert>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
