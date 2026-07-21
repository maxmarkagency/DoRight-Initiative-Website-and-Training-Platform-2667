# Automated Welcome Emails (Phase 6 — final phase)

Status: Approved
Date: 2026-07-21
Depends on: `docs/superpowers/specs/2026-07-17-member-onboarding-pipeline-design.md` (Phase 1, merged), `supabase/migrations/20260717090000_create_onboarding_leads_schema.sql`, `docs/superpowers/specs/2026-07-18-sub-committee-page-design.md` (Phase 3, merged — `/sub-committees` is the real onboarding-link destination), `docs/superpowers/specs/2026-07-21-referral-lead-path-design.md` (Phase 5, merged)

## Background

The DRAI onboarding process plan specifies two welcome-email templates — automated web welcome (Pathway 1, `source = 'website'`) and direct referral welcome (Pathway 2, `source = 'referral'`) — sent as soon as a lead lands in `leads`, both linking to an onboarding destination that (per Phase 3) is now the public `/sub-committees` responsibilities page. No transactional email integration exists anywhere in this codebase today. This phase closes the loop: every `INSERT` into `leads` (either pathway) now triggers a real email send.

**Update (2026-07-21, later same day):** the original template copy, initially thought lost, was provided directly by the user and now lives in `supabase/functions/send-lead-welcome-email/templates.ts` verbatim (one typo fix: "were" → "where" in the mission statement). The two placeholder links in the source copy are wired to real destinations: sub-committee responsibilities → `/sub-committees` (Phase 3), and the website template's onboarding-form link → `/join` (Phase 2). The direct-referral template has no form-link CTA, matching the source copy exactly, since Phase 5's admin flow already captures the lead's details directly.

## Scope

1. `supabase/functions/send-lead-welcome-email/index.ts` — Deno Edge Function, receives the Database Webhook payload, branches on `record.source`, looks up the sub-committee name if present, sends via Resend.
2. `supabase/functions/send-lead-welcome-email/templates.ts` — the two draft templates as plain template-literal functions (no templating engine needed for two static templates).
3. `supabase/migrations/20260721210000_add_lead_welcome_email_trigger.sql` — enables `pg_net` and `supabase_vault` (idempotent; both ship enabled by default on hosted Supabase) and creates an `AFTER INSERT ON leads` trigger that POSTs to the Edge Function.

## Decisions

### Trigger mechanism: custom Vault-backed function, not Dashboard-generated `supabase_functions.http_request`

Supabase's Dashboard "Webhooks" UI generates a trigger that calls `supabase_functions.http_request(url, method, headers, body, timeout_ms)` directly, with the caller's bearer token baked into the `headers` argument as a literal string. That's exactly the pattern the task background pointed at as the standard mechanism — but it means a real secret would sit in a migration file checked into git forever (this is a [known, acknowledged complaint](https://github.com/orgs/supabase/discussions/41521) about the Dashboard's default behavior, not a misreading on my part).

Instead, the migration defines a small custom trigger function, `notify_lead_welcome_email()`, that:
- Reads a shared secret from Supabase Vault (`vault.decrypted_secrets`, keyed `'lead_webhook_secret'`) at call time.
- Calls `net.http_post(...)` directly (the same pg_net primitive `supabase_functions.http_request` wraps), building the request body itself in the documented Database Webhook shape (`{ type, table, schema, record, old_record }`) so the Edge Function sees exactly the payload the task specified.

This is still fully migration-expressible — no Dashboard-only step was needed. **Update (2026-07-21, security fix):** the migration originally seeded a *placeholder* Vault secret via `vault.create_secret('replace-me-with-a-real-random-secret', ...)`, with instructions to hand-edit that literal to a real value before deploying. In practice, someone did exactly that in the working tree — pasted a real generated secret directly into the tracked migration file — which is precisely the risk the Vault-based design was meant to avoid (a real secret sitting in a file that's one `git add` away from being burned into history forever). The migration no longer seeds the secret at all: it only enables the extensions and defines the trigger function/trigger, which read `vault.decrypted_secrets` at call time. The secret itself is seeded entirely out-of-band (see Deployment, step 1) via a one-off `psql` command that is never saved to a file. Until it's seeded, `v_shared_secret` is `NULL` and the Edge Function correctly 401s — fails closed, not open.

### Edge Function auth: shared secret, not `--no-verify-jwt` left wide open

A pg_net trigger has no end-user JWT to attach, so the function must be deployed with `--no-verify-jwt` (disabling Supabase's own gate) — but doing that with no other check makes the endpoint a public, unauthenticated "send an email to any address" relay to anyone who finds the URL. To close that gap, the function checks the incoming `Authorization: Bearer <token>` header against a `LEAD_WEBHOOK_SECRET` env var, and the trigger function signs its own request with the same value read from Vault. Requests without a matching header get `401` before any email logic runs.

### Sub-committee lookup: best-effort, never blocking

If `record.sub_committee_id` is present, the function queries `sub_committees` for the name (service-role client, since this runs server-side with no user session) to personalize the copy ("You noted an interest in our X sub-committee..."). A lookup failure (network blip, row deleted) is logged and treated as "no personalization," not a failed send — the email still goes out with the generic copy. Same posture for the send itself: Resend API errors and unexpected exceptions are caught, logged with the lead id, and returned as an HTTP error status from the function — never an unhandled throw that would crash the function or (via `pg_net`, though it doesn't retry on non-2xx today) risk being misread as a signal to retry indefinitely.

### Onboarding link: `https://doright.ng/#/sub-committees`

Per Phase 3, this route now exists and is exactly the destination both original templates needed. `VITE_APP_URL` in `.env.production.example` confirms `https://doright.ng` as the production domain; since this app uses `HashRouter`, the real link needs the `/#/` segment — a bare `/sub-committees` path would 404 on a static host with no rewrite rule for it.

### Two templates as plain functions in one file, not a templating library

Two static templates with a handful of interpolated values (name, sub-committee, referrer, link) don't justify pulling in a templating engine. `templates.ts` exports `websiteWelcomeEmail()` and `referralWelcomeEmail()`, each returning `{ subject, html, text }`. User-controlled strings (`full_name`, `referred_by`, the looked-up sub-committee name) are HTML-escaped before interpolation into the HTML body — the same XSS-prevention posture as everywhere else in this codebase applies here too, even though the "attacker" surface is a self-submitted join form rather than a rendered page.

### No changes to `Join.jsx` / `LeadsManagement.jsx`

Both already insert into `leads` exactly as Phases 2 and 5 designed. The trigger fires on the `INSERT` itself, regardless of which code path produced it — no client-side change needed or wanted (the entire point of the DB-trigger design is that neither page, nor any browser-shipped code, ever sees `RESEND_API_KEY`).

## Non-goals

- No email-open/click tracking, no unsubscribe management, no bounce-handling beyond logging a failed send.
- No de-duplication of repeat sends (Phase 1 already decided leads aren't de-duplicated at the row level; a duplicate `leads` row still fires a second welcome email — consistent with existing behavior, not a regression introduced here).
- No admin UI for previewing/editing templates. Template copy lives in code, is a draft, and is expected to be replaced by editing `templates.ts` directly once the real DRAI copy exists.
- No changes to the `leads` / `sub_committees` schema beyond what the trigger mechanism strictly requires (`pg_net`, `supabase_vault`, one trigger function, one trigger).
- No retry logic beyond what `pg_net` and Resend do on their own.

## Verification performed

- `npm run build` — succeeds (the Edge Function lives entirely under `supabase/functions/`, outside the Vite build graph, so this only confirms no other file was disturbed).
- No `deno` binary and no working `npx deno` were available in this environment (attempted; `npx deno@2 --version` timed out fetching rather than running). **The Edge Function's syntax was not verified by any compiler or runtime — only by careful manual read-back** against current Supabase Edge Function conventions (`Deno.serve`, `npm:@supabase/supabase-js@2` specifier, `Deno.env.get`), cross-checked against Supabase's own docs/search results for those exact APIs. Treat this as unverified-by-tooling code until it's actually deployed and exercised.
- The migration's `net.http_post(...)` parameter names and `vault.create_secret(...)` signature were checked against Supabase/pg_net's published API reference rather than assumed, since getting either wrong would only surface as a silent trigger failure in production (pg_net dispatches asynchronously — a malformed call doesn't fail the `INSERT`, it just never delivers an email). The SQL file was then read start to finish for balanced parentheses, terminated statements, and idempotency (`IF NOT EXISTS` / `DROP ... IF EXISTS` throughout, matching this repo's existing migration convention).
- No local Supabase instance exists in this environment to actually run the migration or invoke the function against, per the project's established pattern for this phase decomposition (see the Phase 1 plan's own verification note).

## Deployment

None of the following was run in this environment — no live Supabase project or credentials are available here. Run these, in order, against the real project:

1. **Seed the Vault secret out-of-band** — never by editing the migration file:

   ```bash
   openssl rand -hex 32 | tr -d '\n' > /tmp/lead_webhook_secret.txt
   psql "$DATABASE_URL" \
     -v secret="$(cat /tmp/lead_webhook_secret.txt)" \
     -c "SELECT vault.create_secret(:'secret', 'lead_webhook_secret');"
   ```

   Keep `/tmp/lead_webhook_secret.txt`'s contents handy for step 3, then `rm` it. (`tr -d '\n'` matters — a stray trailing newline in the secret will silently mismatch step 3's value and every send will 401.) If the project ref (currently `jqekzavaerbxjzyeihvv` in the migration's trigger function) ever changes, update that URL too — it's a public project ref, not a secret, safe to edit directly in the file.
2. **Set the Resend key:** `supabase secrets set RESEND_API_KEY=<your real Resend API key>`
3. **Set the shared webhook secret** (must exactly match the value from step 1): `supabase secrets set LEAD_WEBHOOK_SECRET=<the same value>`
4. **Deploy the function with JWT verification disabled** (the pg_net trigger has no user JWT to present — the shared-secret check in the function is the real auth gate): `supabase functions deploy send-lead-welcome-email --no-verify-jwt`
5. **Apply the migration:** `supabase db push` (or paste the file into the Supabase Studio SQL editor for the linked project — matching how Phase 1's migration was applied, per `docs/plans/2026-07-17-member-onboarding-data-model.md`).
6. **Verify in Resend:** confirm the sending domain (`doright.ng`, used as the `from` address in `index.ts`) is a verified domain in the Resend dashboard — an unverified `from` domain will cause every send to fail at the Resend API, not just silently under-deliver.
7. **Verify end-to-end:** submit a test lead through `/join` in the real environment and confirm a real email arrives; separately, create a "New Referral" lead in `/admin/leads` and confirm the referral-template email arrives with the referrer's name mentioned.

## Concerns for a human to double-check before this goes near production

- **This sends real email to real people once deployed.** The template copy is now the real DRAI-authored text (see Background update above) — no draft-copy blocker remains, but double-check the rendered HTML/text output once against the source before the first real send.
- **The trigger fires on every `INSERT`, not `UPDATE`** (`AFTER INSERT ON leads FOR EACH ROW`) — a status change (`new` → `contacted`, etc.) does not re-fire the email. Confirm this matches intent: a lead's status is updated via `UPDATE`, never re-inserted, so this should not double-send under normal admin use. The one way to accidentally double-send is inserting the same person twice (Phase 1 explicitly chose no de-duplication), which is an existing, known, accepted risk carried into this phase unchanged.
- **The migration no longer seeds any secret at all — it must be seeded out-of-band (Deployment step 1) before anything sends.** Applying the migration unseeded is safe (fails closed: `v_shared_secret` is `NULL`, the Edge Function 401s, no email sends) but it is still a manual step a human must not skip. The project ref in the trigger's URL (`jqekzavaerbxjzyeihvv`) is already filled in and is not sensitive — only the secret-seeding step remains manual, and it must never be done by editing a tracked file.
- **The `from` address (`onboarding@doright.ng`) assumes that domain is verified in Resend.** If it isn't, every send fails at the Resend API step (logged, not silent, per the error handling above) — but it means zero emails go out until someone completes Resend's domain verification, unrelated to anything in this codebase.
- **No rate limiting on the Edge Function itself.** The shared-secret check keeps out casual unauthenticated requests, but if `LEAD_WEBHOOK_SECRET` ever leaked, nothing in this function limits how many emails a leaked secret could be used to send. Acceptable for a v1 internal-trigger-only endpoint; revisit if this pattern gets reused for more Edge Functions.
