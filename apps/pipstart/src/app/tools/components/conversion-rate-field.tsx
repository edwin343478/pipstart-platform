"use client";

import { useEffect, useId, useState } from "react";

import type { ReferenceRate } from "../../../lib/exchange-rate";

import styles from "./conversion-rate-field.module.css";

type ConversionRateFieldProps = {
  accountCurrency: string;
  onChange: (value: string) => void;
  quoteCurrency: string;
  value: string;
};

type RateStatus = "loading" | "automatic" | "manual" | "error";

export default function ConversionRateField({
  accountCurrency,
  onChange,
  quoteCurrency,
  value,
}: ConversionRateFieldProps) {
  const descriptionId = useId();
  const [referenceRate, setReferenceRate] = useState<ReferenceRate | null>(
    null,
  );
  const [status, setStatus] = useState<RateStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRate() {
      setStatus("loading");
      setReferenceRate(null);
      onChange("");

      try {
        const response = await fetch(
          `/api/exchange-rate?base=${encodeURIComponent(quoteCurrency)}&quote=${encodeURIComponent(accountCurrency)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as ReferenceRate & {
          error?: string;
        };

        if (!response.ok || payload.stale) {
          throw new Error(
            payload.error ?? "The reference rate is unavailable.",
          );
        }

        setReferenceRate(payload);
        onChange(String(payload.rate));
        setStatus("automatic");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        onChange("");
        setStatus("error");
      }
    }

    void loadRate();
    return () => controller.abort();
  }, [accountCurrency, onChange, quoteCurrency]);

  function useManualRate() {
    onChange(referenceRate ? String(referenceRate.rate) : "");
    setStatus("manual");
  }

  function useLatestRate() {
    if (!referenceRate) return;
    onChange(String(referenceRate.rate));
    setStatus("automatic");
  }

  const automatic = status === "automatic";
  const unavailable = status === "error";

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={descriptionId}>Quote-to-account conversion rate</label>
        {status !== "loading" ? (
          <button
            className={styles.modeButton}
            type="button"
            onClick={automatic || unavailable ? useManualRate : useLatestRate}
            disabled={!automatic && !unavailable && !referenceRate}
          >
            {automatic || unavailable ? "Use my own rate" : "Use latest rate"}
          </button>
        ) : null}
      </div>
      <input
        aria-describedby={`${descriptionId}-status`}
        aria-invalid={unavailable && !value ? "true" : undefined}
        id={descriptionId}
        type="number"
        min="0.000001"
        step="any"
        inputMode="decimal"
        readOnly={status === "loading" || automatic}
        value={value}
        placeholder={
          status === "loading" ? "Loading latest rate…" : "Enter rate"
        }
        onChange={(event) => onChange(event.target.value)}
      />
      <div
        className={styles.status}
        id={`${descriptionId}-status`}
        aria-live="polite"
      >
        {status === "loading" ? (
          <span>
            Retrieving the latest available indicative reference rate…
          </span>
        ) : null}
        {automatic && referenceRate ? (
          <>
            <strong>Latest available rate applied:</strong> 1 {quoteCurrency} ={" "}
            {referenceRate.rate} {accountCurrency}
            <span>
              {referenceRate.source} · {referenceRate.rateDate} · retrieved{" "}
              {new Date(referenceRate.retrievedAt).toLocaleString()}
            </span>
          </>
        ) : null}
        {status === "manual" ? (
          <>
            <strong>Manual rate override.</strong>
            <span>
              Results will use your rate for 1 {quoteCurrency} in{" "}
              {accountCurrency}.
            </span>
          </>
        ) : null}
        {unavailable ? (
          <>
            <strong>Reference rate unavailable.</strong>
            <span>Enter your own rate to calculate safely.</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
