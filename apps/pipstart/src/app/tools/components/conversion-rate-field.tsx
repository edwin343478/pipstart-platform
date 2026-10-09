"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, Input, PageState } from "@repo/ui";

import type { ReferenceRate } from "../../../lib/exchange-rate";
import { loadCalculatorRate } from "../../../lib/calculator-reference-rate";
import type { CalculatorFormError } from "../calculator-validation";

import styles from "./conversion-rate-field.module.css";

type ConversionRateFieldProps = {
  accountCurrency: string;
  error?: CalculatorFormError | null;
  onChange: (value: string) => void;
  quoteCurrency: string;
  value: string;
};

type RateStatus = "loading" | "automatic" | "manual" | "error";

export default function ConversionRateField({
  accountCurrency,
  error,
  onChange,
  quoteCurrency,
  value,
}: ConversionRateFieldProps) {
  const descriptionId = useId();
  const activeRequest = useRef<AbortController | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [referenceRate, setReferenceRate] = useState<ReferenceRate | null>(
    null,
  );
  const [status, setStatus] = useState<RateStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;

    async function loadRate() {
      setStatus("loading");
      setReferenceRate(null);
      onChange("");
      try {
        const rate = await loadCalculatorRate(
          quoteCurrency,
          accountCurrency,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setReferenceRate(rate);
        onChange(String(rate.rate));
        setStatus("automatic");
      } catch {
        if (controller.signal.aborted) return;
        onChange("");
        setStatus("error");
      }
    }

    void loadRate();
    return () => {
      controller.abort();
      if (activeRequest.current === controller) activeRequest.current = null;
    };
  }, [accountCurrency, onChange, quoteCurrency, requestVersion]);

  function useManualRate() {
    activeRequest.current?.abort();
    onChange(referenceRate ? String(referenceRate.rate) : "");
    setStatus("manual");
  }

  function useLatestRate() {
    setRequestVersion((version) => version + 1);
  }

  const automatic = status === "automatic";
  const unavailable = status === "error";
  const externallyInvalid = error?.field === "conversion";

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={descriptionId}>Quote-to-account conversion rate</label>
        <Button
          variant="secondary"
          className={styles.modeButton}
          type="button"
          onClick={status === "manual" ? useLatestRate : useManualRate}
        >
          {status === "manual" ? "Use latest rate" : "Use my own rate"}
        </Button>
      </div>
      <Input
        aria-describedby={
          externallyInvalid
            ? "calculator-error-conversion"
            : descriptionId + "-status"
        }
        aria-invalid={
          unavailable && !value ? "true" : externallyInvalid || undefined
        }
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
        onChange={(event) => {
          activeRequest.current?.abort();
          onChange(event.target.value);
          setStatus("manual");
        }}
      />
      <PageState
        kind={
          unavailable ? "error" : status === "loading" ? "loading" : "empty"
        }
        className={styles.status}
        id={descriptionId + "-status"}
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
      </PageState>
    </div>
  );
}
