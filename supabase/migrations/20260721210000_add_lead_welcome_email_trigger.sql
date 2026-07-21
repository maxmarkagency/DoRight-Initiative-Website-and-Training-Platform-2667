/*
  # Welcome Email Trigger (Phase 6)

  1. Extensions
    - `pg_net` — lets a Postgres trigger dispatch outbound HTTP requests asynchronously
      (does not block or fail the triggering INSERT if the callee is slow/unreachable).
    - `supabase_vault` — backs the `vault.secrets` / `vault.decrypted_secrets` views used below
      so the shared webhook secret never appears as a literal in this file.
    Both ship enabled by default on every Supabase project; `IF NOT EXISTS` makes this a no-op
    safety net rather than a fresh install.

  2. Trigger
    - `notify_lead_welcome_email()` — a SECURITY DEFINER trigger function that POSTs the new
      `leads` row to the `send-lead-welcome-email` Edge Function, shaped exactly like Supabase's
      own Database Webhook payload: `{ type, table, schema, record, old_record }`.
    - `send_lead_welcome_email` — `AFTER INSERT ON leads FOR EACH ROW`, calling the function
      above. Fires for both website (`source = 'website'`) and referral (`source = 'referral'`)
      leads; the Edge Function branches on `record.source` to pick the right template.

  3. Why a custom function instead of Supabase's Dashboard-generated
     `supabase_functions.http_request(...)` trigger:
     The Dashboard's generated SQL bakes the caller's bearer token as a literal string into the
     trigger's arguments, which would mean a secret checked into this migration file forever
     (see github.com/orgs/supabase/discussions/41521). Reading the token from Vault at call time
     via `vault.decrypted_secrets` avoids that — but only if the secret is ever seeded
     out-of-band. This migration deliberately does NOT create the `lead_webhook_secret` Vault
     entry itself, so there is never a real (or placeholder) secret value living in this file or
     in git history. See section 4.

  4. One-time manual setup required before this migration does anything useful (this environment
     has no live Supabase project to run these against):
     a. Seed the Vault secret out-of-band — NOT by editing this file — e.g. from a shell with the
        Supabase CLI/psql configured:
          openssl rand -hex 32 | tr -d '\n' > /tmp/lead_webhook_secret.txt
          psql "$DATABASE_URL" \
            -v secret="$(cat /tmp/lead_webhook_secret.txt)" \
            -c "SELECT vault.create_secret(:'secret', 'lead_webhook_secret');"
          rm /tmp/lead_webhook_secret.txt
        (`tr -d '\n'` matters: a trailing newline in the secret will silently mismatch whatever
        you set as the `LEAD_WEBHOOK_SECRET` Edge Function secret, and every send will 401.)
     b. Set the identical value as the Edge Function secret:
          supabase secrets set LEAD_WEBHOOK_SECRET=<same value as step a>
     c. If this project's ref ever changes, update the hardcoded URL in
        `notify_lead_welcome_email()` below (currently `jqekzavaerbxjzyeihvv` — this is the
        project ref/URL, not a secret; the same value is already public in `.env.example`).
     Full deployment sequence: see
     docs/superpowers/specs/2026-07-21-welcome-email-automation-design.md, "Deployment" section.
*/

-- ============================================================================
-- Extensions (idempotent — both are enabled by default on hosted Supabase)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE SCHEMA IF NOT EXISTS vault;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

-- ============================================================================
-- Trigger function + trigger
--
-- Note: the `lead_webhook_secret` Vault entry is deliberately NOT seeded here. See
-- header note 4a: seed it out-of-band (psql/CLI), never as a literal in this file.
-- Until it's seeded, `v_shared_secret` below is NULL and the Edge Function correctly
-- rejects the request (fails closed, not open).
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_lead_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  v_shared_secret TEXT;
BEGIN
  SELECT decrypted_secret INTO v_shared_secret
  FROM vault.decrypted_secrets
  WHERE name = 'lead_webhook_secret';

  PERFORM net.http_post(
    url := 'https://jqekzavaerbxjzyeihvv.supabase.co/functions/v1/send-lead-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(v_shared_secret, '')
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'schema', 'public',
      'record', to_jsonb(NEW),
      'old_record', NULL
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, vault, net;

DROP TRIGGER IF EXISTS send_lead_welcome_email ON leads;
CREATE TRIGGER send_lead_welcome_email
  AFTER INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION notify_lead_welcome_email();
