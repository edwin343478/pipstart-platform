# Approved password email visuals

24 October 2026. Additional owner-requested visual update after audit closeout,
not a reopened audit package or campaign activation. The two supplied designs
are adopted for **Reset Password** and **Password Changed**, not email-address
change confirmation/notification. Sources: `PipStart-Reset-Email.zip` and
`PipStart-Password-Changed-Email.zip`; their scripts were treated as reference,
not executed. Integration is rebased to current `83421c6`, not their old baseline.

The supplied responsive HTML/copy/colors/table layout and font fallbacks are
retained. Source formatting may differ without changing rendered structure.
Mockups show illustrative inbox chrome/avatar/time, not elements controlled by
the HTML. Email clients can substitute fonts, force dark mode or alter CSS;
pixel-identical Gmail/Outlook/Apple Mail rendering is not guaranteed.

## Wiring and safety

| Supabase email                | Subject                            | Version-controlled body                                 |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------- |
| Reset Password / recovery     | Reset your PipStart password       | `supabase/templates/recovery.html`                      |
| Password Changed notification | Your PipStart password was changed | `supabase/templates/password_changed_notification.html` |

Local config adds exactly those two blocks and enables the local password-changed
notice. SMTP, signup confirmation, Auth callback/redirect behavior, OTP lifetime,
monitoring, watchdog and optional-worker settings are untouched. No service is
restarted, database migrated, provider called or real email sent by the patch.
Applying/committing repository config **does not update hosted templates**.

Recovery keeps `{{ .ConfirmationURL }}` unchanged in button and fallback; never
replace it with a fixed sample token or construct a different recovery route.
It uses `{{ .Email }}` and `{{ .SiteURL }}` for the other documented placeholders.
Password Changed uses `{{ .Email }}` and fixed HTTPS PipStart support/security
links; its reset button requests a fresh recovery link, not a pre-issued token.
Do not insert unsubscribe links into these essential security messages.

The templates contain no scripts, images or tracking pixel. They do request
Google Fonts when clients allow it; that can disclose ordinary font-request
metadata to Google. Blocked fonts fall back to Arial. This is not a claim of
zero external resource requests. No tracking/click-rewriting setting is changed.

## Hosted rollout — separate approval and owner checks

1. Preserve the current hosted subjects/bodies privately for rollback (no real
   tokens/account data in the backup). Confirm the correct project.
2. Confirm hosted OTP/reset expiry is **3600 seconds** and Site URL is
   **https://pipstart.net**. Local config is not hosted proof. If different, stop
   and reconcile copy/settings explicitly; do not silently change expiry or URL.
3. Supabase Authentication -> Email Templates: paste the matching external
   `for-supabase-dashboard` HTML/subject into Reset Password and Password Changed.
   Preserve the existing enabled security notification and SMTP/provider settings.
   Do not edit Email Changed. Do not run config push or overwrite all Auth config.
4. After separately authorized controlled account tests, check actual received
   messages on phone/desktop, correct subject, reset button/fallback destination,
   successful reset, subsequent Password Changed notice and authentication headers.
   Never publish a live recovery URL/EML containing its token. Arrival and template
   rendering are separate from provider acceptance and monitor callbacks.
5. If rollback is required, restore only the two saved subjects/bodies; do not
   disable existing security notices or rotate working SMTP/monitor secrets.

Source/placeholder/config regression tests and external visual checks do not prove
hosted deployment or cross-client delivery. Record only checks actually performed.
The official Supabase [template guide](https://supabase.com/docs/guides/auth/auth-email-templates)
and [local configuration guide](https://supabase.com/docs/guides/local-development/customizing-email-templates)
were checked on 24 October 2026; local and hosted editing are different workflows.

Next: owner apply, separate commit/push approval and exact CI; then separately
approved hosted template update and controlled inbox acceptance. Optional sending
stays OFF and the completed C01-C05 closeout is not relabelled as incomplete.
