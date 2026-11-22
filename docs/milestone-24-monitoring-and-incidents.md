# M24 monitoring and incident runbook (X01, X02, S12)

Everything alerts through the **existing Healthchecks.io account** (free Hobbyist plan) and its verified email integration, the same inbox that already receives the M21 delivery-sweep alerts. Healthchecks emails only when a check changes state, so a burst of identical failures produces one email.

## Checks

| Healthchecks check                                 | Fed by                                 | Period / grace  | Goes Down when                                                                                                  |
| -------------------------------------------------- | -------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| PipStart production delivery sweep (existing, M21) | Email sweep success pings              | 5 min / 10 min  | Email delivery health fails or the sweep stops                                                                  |
| PipStart site                                      | `m24-uptime.yml` every 10 min          | 10 min / 20 min | `/`, `/start-here`, `/learn/forex` or `/login` is not a complete 200 page, or the runs stop                     |
| Skillcima site                                     | `m24-uptime.yml`                       | 10 min / 20 min | `https://skillcima.com/` is not a complete 200 page                                                             |
| Database (via Skillcima health)                    | `m24-uptime.yml`                       | 10 min / 20 min | `https://skillcima.com/api/v1/health` does not report `"database":"ok"`. It shares PipStart's Supabase project. |
| PipStart errors                                    | App `/fail` pings (server and browser) | 30 days / 1 day | Any reported application error (the period is long, so it only changes on errors)                               |
| Skillcima errors                                   | Worker `/fail` pings                   | 30 days / 1 day | A Worker 5xx response or thrown error                                                                           |

**What a report contains:** app, surface (server, client or worker), route template, status, an error digest or class name, and the UTC time. Never messages, stacks, full URLs, query strings, cookies, user IDs, emails or bodies. Details stay in the Vercel and Cloudflare logs.

**Throttle:** one report per instance per minute. The browser endpoint accepts at most 2 KB, same origin only.

**Limits:**

- GitHub can delay scheduled runs by 5–30 minutes. Expect detection in about 10–40 minutes.
- GitHub disables schedules in public repos after 60 days without activity. Re-enable from the Actions tab.
- Healthchecks keeps the last 100 events per check.
- Re-decide a fuller tool (for example Sentry) at M25 launch.

## Owner setup (one time; values never go into Git, chat or screenshots)

1. In the existing Healthchecks project, create the five new checks above with those periods and graces. Attach the existing email integration to each.
2. Copy each check's ping URL (`https://hc-ping.com/<uuid>`) **into your password manager**, then:
   - **Vercel Production, Secret:** `PIPSTART_ERROR_PING_URL` = the PipStart errors URL. Redeploy.
   - **Cloudflare Worker secret:** `wrangler secret put SKILLCIMA_ERROR_PING_URL` = the Skillcima errors URL. Redeploy the Worker.
   - **GitHub repository secrets:** `HC_UPTIME_PIPSTART`, `HC_UPTIME_SKILLCIMA` and `HC_UPTIME_DATABASE`.
3. A blank or malformed value disables that integration and never breaks the site.

## Alert drill (separately authorized; one at a time)

| Drill                            | How                                                                                                                                                                                                                    | Expected                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Uptime: email path and first run | In Healthchecks, press **"Send test notification"** on the Skillcima site check. Then run the workflow manually (Actions → M24 uptime checks → Run workflow) and confirm all three uptime checks show **up**.          | One test email; checks green after the manual run                                                                            |
| Uptime: real failure path        | From a PowerShell window, send one `/fail` to the _PipStart site_ check with its ping URL from the password manager: `Invoke-WebRequest -Method Post -Body 'drill' (<url> + '/fail')`. Then run the workflow manually. | A **Down** email, then an **Up** email after the run                                                                         |
| PipStart error                   | `Invoke-WebRequest -Method Post -ContentType 'application/json' -Body '{"route":"/drill","kind":"boundary"}' https://pipstart.net/api/client-error`                                                                    | 204 reply; a **Down** email on _PipStart errors_ whose last event shows `/drill`. Then **Resume** the check in Healthchecks. |
| Skillcima error                  | Not drilled by forcing a production 5xx. The Worker path is covered by unit tests. Optionally, press "Send test notification" on _Skillcima errors_ to prove email delivery.                                           | Test email                                                                                                                   |

Record each drill's time and result. Never paste a ping URL anywhere but the password manager and the three secret stores.

## Incident runbook

1. **Detect.** An email arrives from Healthchecks: which check, and Down or Up.
2. **Classify (severity):**
   - **S1:** PipStart or Skillcima site down, or the database down. Learners or visitors are affected.
   - **S2:** error reports are repeating, or email delivery health has failed. Some users are affected.
   - **S3:** a single error report, with the site otherwise fine.
3. **Look:**
   - Open the check's event log (route template, status, code).
   - Then look in Vercel → Deployments → Runtime Logs, or Cloudflare → Workers → Logs, for the same time.
   - For the database, check the Supabase dashboard project status (paused, restoring or healthy).
4. **Contain:**
   - **Bad deploy:** promote the previous deployment (Vercel → Deployments → ⋯ → Promote; Cloudflare → Worker → Deployments → Rollback).
   - **Paused Supabase:** press Restore in the dashboard. Free projects pause when idle.
   - **Leaked secret:** rotate it. Vault-paired tokens follow `Vault-Reprovisioning.md`. Other provider keys are rotated at the provider, then the variable is updated, then you redeploy.
5. **Data recovery** (only if data is lost or corrupted): use the latest verified encrypted backup in `D:\PipStart-Protected-Backups` and the M24-05-03 isolated restore procedure. Never restore over production without a separate, explicit decision.
6. **Communicate:** for S1 lasting more than 1 hour, post a short notice on the site, or contact affected learners through the normal email channel. No learner data in the notice.
7. **Recover and close:**
   - Confirm the checks are back **up**.
   - **Resume** any error check.
   - Note the time to detect, time to recover, cause and follow-up in the operations log.
   - Targets: recovery within **4 hours**, data loss at most **24 hours**, which needs a recent verified backup.
