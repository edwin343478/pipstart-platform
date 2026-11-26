"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getSupabasePublicConfiguration } from "@/lib/supabase/config";
import { STAFF_FACTOR_NAME_MAX_CHARACTERS } from "@/lib/auth/staff-entry";
import {
  enrollStaffFactor,
  readStaffFactors,
  verifyStaffFactor,
  type StaffFactor,
  type StaffSetup,
} from "@/lib/auth/staff-mfa-flow";
import { Icon } from "@/components/admin-preview/icons";
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
  const [factorName, setFactorName] = useState("");
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
      const result = await enrollStaffFactor(
        client.current,
        userId,
        factorName,
      );
      if (result.kind === "setup") {
        setSetup(result.setup);
        setCode("");
        setMessage(
          "Scan the code or enter the key, then confirm a code from your authenticator.",
        );
      } else if (result.kind === "invalid") {
        // Refused before any provider call; nothing was created.
        setMessage(
          "Name this authenticator using up to 40 letters, numbers and spaces.",
        );
      } else if (result.kind === "name-taken") {
        setMessage(
          "You already use this name for another authenticator. Choose a different name.",
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

  const choosing = !setup && factors.length > 0 && !backup;
  const naming = !setup && (backup || factors.length === 0);
  const codeFields = (
    <>
      <label>
        Six-digit authenticator code
        <input
          className={styles.codeInput}
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
      <p className={styles.help} id="staff-code-help">
        Only enter codes on PipStart. We will not ask for your key or code by
        email.
      </p>
      <button
        className={styles.primary}
        disabled={busy || uncertain || !ready}
        type="submit"
      >
        {busy ? "Verifying…" : "Verify and continue"}
        <Icon name="chevR" />
      </button>
    </>
  );

  return (
    <div className={styles.access}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Staff access</p>
        <h1>
          {setup
            ? "Set up two-step verification"
            : backup
              ? "Add a backup authenticator"
              : "Verify to continue"}
        </h1>
        <p className={styles.lead}>
          {setup || naming
            ? "Link an authenticator app to this account, then confirm it with a code."
            : "Enter a code from your authenticator app to open the staff area."}
        </p>
      </div>
      <div className={styles.accessGrid}>
        <section className={styles.card} aria-labelledby="staff-mfa-card">
          {!setup && (
            <div className={styles.cardHead}>
              <span className={styles.badge}>
                <Icon name={naming ? "key" : "device"} />
              </span>
              <h2 className={styles.cardTitle} id="staff-mfa-card">
                {naming ? "Set up an authenticator" : "Authenticator code"}
              </h2>
            </div>
          )}
          {message && (
            <p className={styles.status} role="status" aria-live="polite">
              <Icon name="info" />
              <span>{message}</span>
            </p>
          )}
          <form className={styles.form} onSubmit={verify} aria-busy={busy}>
            {setup ? (
              <>
                <div className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    1
                  </span>
                  <div className={styles.stepBody}>
                    <h2 className={styles.cardTitle} id="staff-mfa-card">
                      Scan the setup code
                    </h2>
                    <div className={styles.setupRow}>
                      {/* Provider-generated local data URI; never an external image request. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className={styles.qr}
                        src={setup.qr}
                        width={180}
                        height={180}
                        alt="Scan this setup code in your authenticator app"
                      />
                      <div className={styles.keyBlock}>
                        <label>
                          Can’t scan? Enter this key instead
                          <input
                            className={styles.field}
                            value={setup.secret}
                            readOnly
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </label>
                        <p className={styles.warning}>
                          <Icon name="alert" />
                          <span>
                            Keep this key private. It is cleared from this page
                            after verification or navigation.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    2
                  </span>
                  <div className={styles.stepBody}>
                    <h2 className={styles.cardTitle}>Confirm a code</h2>
                    {codeFields}
                  </div>
                </div>
              </>
            ) : choosing ? (
              <>
                <label>
                  Authenticator
                  <select
                    className={styles.field}
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
                {codeFields}
              </>
            ) : (
              <p className={styles.muted}>
                {ready
                  ? backup
                    ? "Set up a second authenticator on a separate device."
                    : "No verified authenticator was found. Set one up to continue."
                  : "Checking your session…"}
              </p>
            )}
            {naming && (
              <>
                <label>
                  Name this authenticator
                  <input
                    className={styles.field}
                    name="factor-name"
                    value={factorName}
                    onChange={(event) => setFactorName(event.target.value)}
                    onKeyDown={(event) => {
                      // Enter names the device; it must not submit the code form.
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      void enroll();
                    }}
                    maxLength={STAFF_FACTOR_NAME_MAX_CHARACTERS}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={busy || uncertain || !canEnroll}
                    required
                    aria-describedby="staff-factor-name-help"
                  />
                </label>
                <p className={styles.help} id="staff-factor-name-help">
                  {backup
                    ? "For example “Backup phone” or “Tablet”. Choose a name that tells it apart from your first authenticator."
                    : "For example “Phone”. You will choose it by this name when you sign in."}
                </p>
                <button
                  className={styles.primary}
                  disabled={busy || uncertain || !ready || !canEnroll}
                  type="button"
                  onClick={() => void enroll()}
                >
                  {backup
                    ? "Add a backup authenticator"
                    : "Set up an authenticator"}
                </button>
              </>
            )}
          </form>
        </section>
        <aside className={styles.infoCard} aria-labelledby="staff-mfa-info">
          <h2 className={styles.infoTitle} id="staff-mfa-info">
            Good to know
          </h2>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <Icon name="shield" />
            </span>
            <div>
              <h3>Verification is not a staff role</h3>
              <p>
                Staff access needs an authenticator code and an active staff
                grant. Verification does not give this account a staff role.
              </p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <Icon name="device" />
            </span>
            <div>
              <h3>Keep a backup authenticator</h3>
              <p>
                Keep a second verified authenticator on a separate device. This
                version does not issue recovery codes. If all factors are lost,
                contact the Owner; staff access stays closed during recovery.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
