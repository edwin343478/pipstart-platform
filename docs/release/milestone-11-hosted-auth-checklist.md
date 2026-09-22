# Milestone 11 hosted authentication release check

Use this checklist for the hosted PipStart Supabase project before promoting Milestone 11. Do not record passwords, API keys, tokens, or learner data in this document or release evidence.

## 1. Hosted Auth configuration

- [ ] Email/password sign-ups are enabled.
- [ ] Email confirmation is disabled. This is the approved product policy because all learning content is public and learner accounts hold no sensitive course material.
- [ ] Minimum password length is **8**.
- [ ] Password composition requirements remain empty so letters, digits, and symbols are accepted independently or in any combination.
- [ ] Anonymous sign-ins and manual account linking are disabled.
- [ ] Refresh-token rotation is enabled with the approved reuse interval.
- [ ] Sign-up/sign-in and token-refresh rate limits match the reviewed production values.
- [ ] CAPTCHA remains deferred as an explicit, documented risk decision.

## 2. URLs and environment separation

- [ ] Site URL is the canonical HTTPS production origin.
- [ ] `NEXT_PUBLIC_SITE_URL` exactly matches the canonical application origin used to start password recovery.
- [ ] Allowed redirect URLs include the exact production recovery callback `/auth/callback?next=/reset-password` and only approved preview callback URLs.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are configured in the public runtime.
- [ ] `SUPABASE_SECRET_KEY` exists only in the server runtime and is not exposed through a `NEXT_PUBLIC_` variable, browser bundle, logs, or release evidence.
- [ ] Local and CI values are separate from production values.

## 3. Database and authorization

- [ ] Migration `20260915143000_pipstart_learner_accounts.sql` is applied.
- [ ] New users receive a `pipstart_profiles` row with role `learner`.
- [ ] New users receive default `pipstart_email_preferences`.
- [ ] Row-level security is enabled on both learner-owned tables.
- [ ] A learner cannot update the protected `role` column.
- [ ] A non-administrator visiting `/admin` is redirected to account settings with the not-authorized notice.
- [ ] Deleting an Auth user cascades to the profile and preference rows.

## 4. Automated release gates

Run the normal repository gates first:

```bash
pnpm --filter pipstart lint
pnpm --filter pipstart typecheck
pnpm --filter pipstart test
pnpm --filter pipstart build
pnpm --filter pipstart test:e2e -- e2e/milestone-11-accounts.spec.ts
```

Then run the destructive real-service lifecycle gate against a non-production hosted project. Use a dedicated disposable test address; the test deletes the account it creates.

```bash
PIPSTART_E2E_ACCOUNT_EMAIL="<disposable-test-address>" \
PIPSTART_E2E_ACCOUNT_PASSWORD="<temporary-8-plus-character-password>" \
pnpm --filter pipstart test:e2e:account-lifecycle
```

- [ ] Registration reaches `/welcome` without email verification.
- [ ] Profile and email preferences persist through the hosted database.
- [ ] Password change succeeds only after current-password reauthentication.
- [ ] Global sign-out returns the learner to login.
- [ ] Login succeeds with the new password.
- [ ] The password-recovery request keeps a neutral response for known and unknown email addresses.
- [ ] A fresh recovery email returns through `/auth/callback`, reaches `/reset-password`, accepts a new password, rejects the old password, and rejects replay of the used link.
- [ ] Account deletion succeeds after password reauthentication and removes the account.
- [ ] Login with the deleted credentials fails.
- [ ] A missing environment variable, hosted-service outage, or backend error fails this dedicated gate; it is not accepted as a passing result.

## 5. Manual release evidence

- [ ] Desktop registration, login, welcome, settings, and deletion pages match the approved visuals.
- [ ] Mobile pages have no horizontal overflow and keep the footer at the viewport edge.
- [ ] Each protected account route preserves its exact `next` destination through login.
- [ ] Registration validation preserves completed field values.
- [ ] Login and password-reset responses do not disclose whether an account exists.
- [ ] Password recovery is tested from the same canonical browser origin that generated the request; local development uses `http://localhost:3000`.
- [ ] Browser developer tools show no secret key or sensitive credential in client requests or bundles.

Record the hosted project identifier, deployment SHA, tester, UTC time, and pass/fail result in the release ticket. Keep credentials and personal data out of that record.

## 6. Failure and rollback

- Stop the release if any checklist item or lifecycle step fails.
- Remove any disposable test user that survives a failed run using the hosted Supabase dashboard.
- Roll back the application deployment if authentication regressions reach production.
- Correct hosted configuration through the approved project owner; do not weaken application validation to mask a hosted mismatch.
