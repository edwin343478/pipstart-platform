import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);
const repositoryRoot = path.resolve(appRoot, "../../../..");
const migrationPath = path.join(
  repositoryRoot,
  "supabase/migrations/20260915143000_pipstart_learner_accounts.sql",
);
const supabaseConfigPath = path.join(repositoryRoot, "supabase/config.toml");
const read = (relativePath: string) =>
  fs.readFileSync(path.join(appRoot, relativePath), "utf8");

describe("Milestone 11 learner accounts", () => {
  it.each([
    "register/page.tsx",
    "welcome/page.tsx",
    "login/page.tsx",
    "forgot-password/page.tsx",
    "reset-password/page.tsx",
    "account/profile/page.tsx",
    "account/settings/page.tsx",
    "account/email-preferences/page.tsx",
    "account/security/page.tsx",
    "account/delete/page.tsx",
    "admin/page.tsx",
    "auth/callback/route.ts",
  ])("publishes the account surface %s", (relativePath) => {
    expect(fs.existsSync(path.join(appRoot, relativePath))).toBe(true);
  });

  it("uses a neutral login error and forgot-password response", () => {
    const actions = read("account/actions.ts");
    expect(actions).toContain("Email or password is incorrect.");
    expect(actions).toContain("If an account matches that email");
    expect(actions).not.toContain("No account exists");
  });

  it("creates accounts immediately without an email-confirmation step", () => {
    const actions = read("account/actions.ts");
    const form = read("../components/account-forms.tsx");
    const config = fs.readFileSync(supabaseConfigPath, "utf8");
    expect(actions).toContain('redirect("/welcome")');
    expect(actions).not.toContain("resendVerificationAction");
    expect(form).not.toContain("ResendVerificationForm");
    expect(config).toContain("enable_confirmations = false");
  });

  it("welcomes new learners with friendly next actions", () => {
    const welcome = read("welcome/page.tsx");
    expect(welcome).toContain("You’re all set!");
    expect(welcome).toContain("Start learning");
    expect(welcome).toContain("View my account");
    expect(welcome).toContain("index: false");
  });

  it("keeps registration values in client state after validation errors", () => {
    const form = read("../components/account-forms.tsx");
    expect(form).toContain(
      'const [displayName, setDisplayName] = useState("")',
    );
    expect(form).toContain('const [email, setEmail] = useState("")');
    expect(form).toContain('const [password, setPassword] = useState("")');
    expect(form).toContain("value={passwordConfirmation}");
    expect(form).toContain("checked={termsAccepted}");
  });

  it("uses the approved font tokens and a responsive sticky footer on account pages", () => {
    const shell = read("../components/reference-page-shell.module.css");
    const accountShell = read("../components/account-shell.module.css");
    expect(shell).toContain("display: flex");
    expect(shell).toContain("flex-direction: column");
    expect(shell).toContain("flex: 1 0 auto");
    expect(shell).toContain("calc(100dvh - var(--mobile-tab-height))");
    expect(shell).toContain("var(--font-pipstart-body)");
    expect(accountShell).toContain("var(--font-pipstart-heading)");
  });

  it("logs only privacy-safe registration diagnostics", () => {
    const actions = read("account/actions.ts");
    const diagnostic = actions.match(
      /console\.error\("PipStart registration failed", \{[\s\S]*?\n\s+\}\);/,
    )?.[0];
    expect(diagnostic).toContain("code: error.code");
    expect(diagnostic).toContain("status: error.status");
    expect(diagnostic).not.toContain("email");
    expect(diagnostic).not.toContain("password");
  });

  it("protects user pages and the administrator boundary on the server", () => {
    expect(read("account/settings/page.tsx")).toContain("requireUser()");
    expect(read("admin/page.tsx")).toContain("requireAdministrator()");
    expect(read("../lib/auth/session.ts")).toContain('data?.role !== "admin"');
  });

  it("keeps all account and authentication pages out of search indexes", () => {
    expect(read("account/layout.tsx")).toContain("index: false");
    for (const route of [
      "register/page.tsx",
      "login/page.tsx",
      "forgot-password/page.tsx",
      "reset-password/page.tsx",
      "welcome/page.tsx",
      "account-deleted/page.tsx",
    ]) {
      expect(read(route)).toContain("index: false");
    }
  });

  it("keeps administrative deletion credentials server-only", () => {
    const admin = read("../lib/supabase/admin.ts");
    expect(admin).toContain('import "server-only"');
    expect(admin).toContain("SUPABASE_SECRET_KEY");
    expect(admin).not.toContain("NEXT_PUBLIC_SUPABASE_SECRET_KEY");
  });

  it("validates claims in the session-refresh proxy", () => {
    const proxy = read("../lib/supabase/proxy.ts");
    expect(proxy).toContain("supabase.auth.getClaims()");
    expect(proxy).not.toContain("supabase.auth.getSession()");
  });

  it("defines owned account records, RLS, protected roles and deletion cascades", () => {
    const migration = fs.readFileSync(migrationPath, "utf8");
    expect(migration).toContain("create table public.pipstart_profiles");
    expect(migration).toContain(
      "create table public.pipstart_email_preferences",
    );
    expect(migration.match(/enable row level security/g)).toHaveLength(2);
    expect(migration.match(/\(select auth\.uid\(\)\) = user_id/g)).toHaveLength(
      6,
    );
    expect(migration).toContain("grant update (display_name)");
    expect(migration).not.toContain("grant update (role)");
    expect(
      migration.match(/references auth\.users\(id\) on delete cascade/g),
    ).toHaveLength(2);
  });

  it("creates every new account as a learner with default email preferences", () => {
    const migration = fs.readFileSync(migrationPath, "utf8");
    expect(migration).toContain("default 'learner'");
    expect(migration).toContain(
      "educational_emails boolean not null default true",
    );
    expect(migration).toContain(
      "marketing_emails boolean not null default false",
    );
    expect(migration).toContain("after insert on auth.users");
  });

  it("requires reauthentication and explicit confirmation before deletion", () => {
    const actions = read("account/actions.ts");
    expect(actions).toContain('formData.get("confirmation") !== "DELETE"');
    expect(actions).toContain("signInWithPassword");
    expect(actions).toContain("admin.auth.admin.deleteUser(user.id)");
    expect(actions).toContain('signOut({ scope: "global" })');
  });
});
