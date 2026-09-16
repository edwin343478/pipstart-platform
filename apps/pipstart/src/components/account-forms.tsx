"use client";

import Link from "next/link";
import { useActionState, useState, type ChangeEventHandler } from "react";
import { useFormStatus } from "react-dom";

import {
  changePasswordAction,
  deleteAccountAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
  updateEmailPreferencesAction,
  updateProfileAction,
  type AccountActionState,
} from "@/app/account/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/validation";

import styles from "./account-forms.module.css";

const initialAccountActionState: AccountActionState = { status: "idle" };

function Status({ state }: { state: AccountActionState }) {
  if (!state.message && !state.fieldErrors) return null;
  return (
    <div
      className={state.status === "success" ? styles.success : styles.error}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message ?? "Please correct the highlighted fields."}
    </div>
  );
}

function FieldError({
  name,
  state,
}: {
  name: string;
  state: AccountActionState;
}) {
  const message = state.fieldErrors?.[name];
  return message ? <span className={styles.fieldError}>{message}</span> : null;
}

function PasswordField({
  autocomplete = "new-password",
  label,
  name,
  onChange,
  state,
  value,
}: {
  autocomplete?: "current-password" | "new-password";
  label: string;
  name: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  state: AccountActionState;
  value?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.passwordControl}>
        <input
          aria-invalid={Boolean(state.fieldErrors?.[name])}
          autoComplete={autocomplete}
          name={name}
          onChange={onChange}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button type="button" onClick={() => setVisible((current) => !current)}>
          {visible ? "Hide" : "Show"}
        </button>
      </span>
      <FieldError name={name} state={state} />
    </label>
  );
}

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={styles.submit} disabled={pending} type="submit">
      {pending ? "Working…" : children}
    </button>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.danger} disabled={pending} type="submit">
      {pending ? "Deleting…" : "Delete my account"}
    </button>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(
    registerAction,
    initialAccountActionState,
  );
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  return (
    <form action={action} className={styles.form} noValidate>
      <Status state={state} />
      <label className={styles.field}>
        <span>Display name</span>
        <input
          aria-invalid={Boolean(state.fieldErrors?.displayName)}
          autoComplete="name"
          name="displayName"
          onChange={(event) => setDisplayName(event.target.value)}
          required
          value={displayName}
        />
        <FieldError name="displayName" state={state} />
      </label>
      <label className={styles.field}>
        <span>Email address</span>
        <input
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <FieldError name="email" state={state} />
      </label>
      <PasswordField
        label={`Password (${PASSWORD_MIN_LENGTH}+ characters)`}
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        state={state}
        value={password}
      />
      <p className={styles.hint}>
        Letters, numbers and symbols are all accepted. Use any combination.
      </p>
      <PasswordField
        label="Confirm password"
        name="passwordConfirmation"
        onChange={(event) => setPasswordConfirmation(event.target.value)}
        state={state}
        value={passwordConfirmation}
      />
      <label className={styles.checkbox}>
        <input
          checked={termsAccepted}
          name="terms"
          onChange={(event) => setTermsAccepted(event.target.checked)}
          type="checkbox"
          value="accepted"
        />
        <span>
          I accept the <Link href="/legal/terms">Terms</Link> and{" "}
          <Link href="/legal/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>
      <FieldError name="terms" state={state} />
      <SubmitButton>Create account</SubmitButton>
      <p className={styles.alternative}>
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(
    loginAction,
    initialAccountActionState,
  );
  return (
    <form action={action} className={styles.form} noValidate>
      <Status state={state} />
      <input name="next" type="hidden" value={next ?? ""} />
      <label className={styles.field}>
        <span>Email address</span>
        <input
          autoComplete="email"
          inputMode="email"
          name="email"
          required
          type="email"
        />
      </label>
      <PasswordField
        autocomplete="current-password"
        label="Password"
        name="password"
        state={state}
      />
      <Link className={styles.forgot} href="/forgot-password">
        Forgot password?
      </Link>
      <SubmitButton>Log in</SubmitButton>
      <p className={styles.alternative}>
        New to PipStart? <Link href="/register">Create an account</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(
    forgotPasswordAction,
    initialAccountActionState,
  );
  return (
    <form action={action} className={styles.form} noValidate>
      <Status state={state} />
      <label className={styles.field}>
        <span>Email address</span>
        <input
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          name="email"
          required
          type="email"
        />
        <FieldError name="email" state={state} />
      </label>
      <SubmitButton>Send reset link</SubmitButton>
      <p className={styles.alternative}>
        <Link href="/login">Return to login</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(
    resetPasswordAction,
    initialAccountActionState,
  );
  return (
    <form action={action} className={styles.form} noValidate>
      <Status state={state} />
      <PasswordField
        label={`New password (${PASSWORD_MIN_LENGTH}+ characters)`}
        name="password"
        state={state}
      />
      <PasswordField
        label="Confirm new password"
        name="passwordConfirmation"
        state={state}
      />
      <SubmitButton>Update password</SubmitButton>
    </form>
  );
}

export function ProfileForm({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const [state, action] = useActionState(
    updateProfileAction,
    initialAccountActionState,
  );
  return (
    <form action={action} className={styles.form} noValidate>
      <Status state={state} />
      <label className={styles.field}>
        <span>Display name</span>
        <input
          aria-invalid={Boolean(state.fieldErrors?.displayName)}
          defaultValue={displayName}
          name="displayName"
          required
        />
        <FieldError name="displayName" state={state} />
      </label>
      <label className={styles.field}>
        <span>Email address</span>
        <input disabled value={email} />
      </label>
      <p className={styles.hint}>
        Email changes require a separate verified workflow and are not available
        yet.
      </p>
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}

export function EmailPreferencesForm({
  educational,
  marketing,
}: {
  educational: boolean;
  marketing: boolean;
}) {
  const [state, action] = useActionState(
    updateEmailPreferencesAction,
    initialAccountActionState,
  );
  return (
    <form action={action} className={styles.form}>
      <Status state={state} />
      <label className={styles.preference}>
        <input
          defaultChecked={educational}
          name="educationalEmails"
          type="checkbox"
        />
        <span>
          <strong>Learning emails</strong>
          <small>Course guidance and educational updates.</small>
        </span>
      </label>
      <label className={styles.preference}>
        <input
          defaultChecked={marketing}
          name="marketingEmails"
          type="checkbox"
        />
        <span>
          <strong>Product news</strong>
          <small>Optional PipStart announcements and offers.</small>
        </span>
      </label>
      <div className={styles.serviceNotice}>
        <strong>Service and security emails</strong>
        <span>
          Required messages such as verification, password resets and security
          notices cannot be disabled.
        </span>
      </div>
      <SubmitButton>Save preferences</SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(
    changePasswordAction,
    initialAccountActionState,
  );
  return (
    <form action={action} className={styles.form} noValidate>
      <Status state={state} />
      <PasswordField
        autocomplete="current-password"
        label="Current password"
        name="currentPassword"
        state={state}
      />
      <PasswordField
        label={`New password (${PASSWORD_MIN_LENGTH}+ characters)`}
        name="password"
        state={state}
      />
      <PasswordField
        label="Confirm new password"
        name="passwordConfirmation"
        state={state}
      />
      <SubmitButton>Change password</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(
    deleteAccountAction,
    initialAccountActionState,
  );
  return (
    <form
      action={action}
      className={`${styles.form} ${styles.dangerForm}`}
      noValidate
    >
      <Status state={state} />
      <label className={styles.field}>
        <span>Type DELETE to confirm</span>
        <input
          aria-invalid={Boolean(state.fieldErrors?.confirmation)}
          autoComplete="off"
          name="confirmation"
          required
        />
        <FieldError name="confirmation" state={state} />
      </label>
      <PasswordField
        autocomplete="current-password"
        label="Password"
        name="password"
        state={state}
      />
      <DeleteSubmitButton />
    </form>
  );
}
