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
     via `vault.decrypted_secrets` avoids that: this file contains a placeholder secret value
     only, not a real one.

  4. IMPORTANT — one-time manual edits required before this migration is applied for real
     (this environment has no live Supabase project to fill these in with):
     a. Replace `YOUR_PROJECT_REF` in the trigger function's URL below with this project's
        actual ref (Project Settings > General, or the host in your Supabase project URL).
     b. Replace `'replace-me-with-a-real-random-secret'` below with a real random value, e.g.
        the output of `openssl rand -hex 32` — and set the *same* value as the
        `LEAD_WEBHOOK_SECRET` Edge Function secret (`supabase secrets set`).
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
-- Shared webhook secret (placeholder — see note 4b above)
-- ============================================================================

SELECT vault.create_secret('replace-me-with-a-real-random-secret', 'lead_webhook_secret')
WHERE NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'lead_webhook_secret');

-- ============================================================================
-- Trigger function + trigger
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
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-lead-welcome-email',
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
