"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getSupabasePublicConfiguration } from "@/lib/supabase/config";
import {
  enrollStaffFactor,
  readStaffFactors,
  verifyStaffFactor,
  type StaffFactor,
  type StaffSetup,
} from "@/lib/auth/staff-mfa-flow";
import styles from "./staff.module.css";

export function StaffMfa({
  userId,
  backup = false,
}: {
  userId: string;
  backup?: boolean;
}) {
  const router = useRouter();
  const client = useRef<SupabaseClient | null>(null);
  const locked = useRef(false);
  const [factors, setFactors] = useState<StaffFactor[]>([]);
  const [selected, setSelected] = useState("");
  const [setup, setSetup] = useState<StaffSetup | null>(null);
  const [code, setCode] = useState("");
  const [ready, setReady] = useState(false);
  const [canEnroll, setCanEnroll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const configuration = getSupabasePublicConfiguration();
    if (!configuration) return;
    const supabase = createBrowserClient(
      configuration.url,
      configuration.publishableKey,
    );
    client.current = supabase;
    void readStaffFactors(supabase, userId).then((result) => {
      if (!active) return;
      if (result.kind !== "ready") {
        setMessage(
          "Verification services are unavailable. Reload before trying again.",
        );
        return;
      }
      setFactors(result.factors);
      setSelected(result.factors[0]?.id || "");
      setReady(true);
      setCanEnroll(result.canEnroll);
      if (!result.canEnroll)
        setMessage(
          "An incomplete factor setup already exists. Ask the Owner to reconcile it before adding another authenticator. Existing verified factors can still be used.",
        );
    });
    return () => {
      active = false;
      client.current = null;
    };
  }, [userId]);

  async function enroll() {
    if (
      locked.current ||
      uncertain ||
      setup ||
      !ready ||
      !canEnroll ||
      !client.current
    )
      return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await enrollStaffFactor(client.current, userId);
      if (result.kind === "setup") {
        setSetup(result.setup);
        setCode("");
        setMessage(
          "Scan the code or enter the key, then confirm a code from your authenticator.",
        );
      } else {
        setUncertain(true);
        setMessage(
          "Setup did not complete reliably. Do not add another factor. Reload to check your session; ask the Owner to reconcile an incomplete setup if necessary.",
        );
      }
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || uncertain || !ready || !client.current) return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    const submitted = code;
    setCode("");
    try {
      const result = await verifyStaffFactor(
        client.current,
        userId,
        setup?.id || selected,
        submitted,
        setup?.id,
      );
      if (result.kind === "verified") {
        setSetup(null);
        router.replace("/admin/staff");
        router.refresh();
      } else if (result.kind === "invalid")
        setMessage("Choose an authenticator and enter its six-digit code.");
      else if (result.kind === "rejected")
        setMessage(
          "The code was not accepted. Wait for a new code and try again.",
        );
      else {
        setUncertain(true);
        setSetup(null);
        setMessage(
          "The verification result is uncertain or your session changed. Reload to check your current session before another attempt.",
        );
      }
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <h1>
        {setup
          ? "Set up two-step verification"
          : backup
            ? "Add a backup authenticator"
            : "Verify to continue"}
      </h1>
      <p>
        Staff access needs an authenticator code and an active staff grant.
        Verification does not give this account a staff role.
      </p>
      <p>
        Keep a second verified authenticator on a separate device. This version
        does not issue recovery codes. If all factors are lost, contact the
        Owner; staff access stays closed during recovery.
      </p>
      {message && (
        <p className={styles.notice} role="status" aria-live="polite">
          {message}
        </p>
      )}
      <form className={styles.form} onSubmit={verify} aria-busy={busy}>
        {setup ? (
          <div>
            {/* Provider-generated local data URI; never an external image request. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.qr}
              src={setup.qr}
              width={180}
              height={180}
              alt="Scan this setup code in your authenticator app"
            />
            <label>
              Can’t scan? Enter this key instead
              <input
                className={styles.input}
                value={setup.secret}
                readOnly
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <p className={styles.notice}>
              Keep this key private. It is cleared from this page after
              verification or navigation.
            </p>
          </div>
        ) : factors.length > 0 && !backup ? (
          <label>
            Authenticator
            <select
              className={styles.input}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              disabled={busy || uncertain}
            >
              {factors.map((factor) => (
                <option key={factor.id} value={factor.id}>
                  {factor.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p>
            {ready
              ? backup
                ? "Set up a second authenticator on a separate device."
                : "No verified authenticator was found. Set one up to continue."
              : "Checking your session…"}
          </p>
        )}
        {(setup || (factors.length > 0 && !backup)) && (
          <>
            <label>
              Six-digit authenticator code
              <input
                className={styles.input}
                name="totp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                disabled={busy || uncertain}
                required
                aria-describedby="staff-code-help"
              />
            </label>
            <p id="staff-code-help">
              Only enter codes on PipStart. We will not ask for your key or code
              by email.
            </p>
            <button
              className={styles.button}
              disabled={busy || uncertain || !ready}
              type="submit"
            >
              {busy ? "Verifying…" : "Verify and continue"}
            </button>
          </>
        )}
        {!setup && (backup || factors.length === 0) && (
          <button
            className={styles.button}
            disabled={busy || uncertain || !ready || !canEnroll}
            type="button"
            onClick={() => void enroll()}
          >
            {backup ? "Add a backup authenticator" : "Set up an authenticator"}
          </button>
        )}
      </form>
    </>
  );
}
