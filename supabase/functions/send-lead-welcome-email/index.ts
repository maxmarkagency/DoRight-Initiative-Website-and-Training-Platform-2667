// Supabase Edge Function: send-lead-welcome-email
//
// Fired by an AFTER INSERT trigger on public.leads (see
// supabase/migrations/20260721210000_add_lead_welcome_email_trigger.sql). Sends one of the two
// DRAFT welcome-email templates (templates.ts) via Resend, branching on `record.source`
// ('website' -> Pathway 1, 'referral' -> Pathway 2).
//
// Auth: deployed with --no-verify-jwt, since the pg_net trigger has no end-user JWT to send.
// Instead the trigger signs its request with a shared secret stored in Supabase Vault
// ('lead_webhook_secret') and checked here against the LEAD_WEBHOOK_SECRET env var, so this
// endpoint isn't a fully open public email-send relay once --no-verify-jwt is set.
//
// Deployment steps: docs/superpowers/specs/2026-07-21-welcome-email-automation-design.md.

import { createClient } from "npm:@supabase/supabase-js@2";
import { referralWelcomeEmail, websiteWelcomeEmail } from "./templates.ts";

const SUB_COMMITTEES_URL = "https://doright.ng/#/sub-committees";

interface LeadRecord {
  id: string;
  full_name: string;
  email: string;
  sub_committee_id: string | null;
  source: string;
  referred_by: string | null;
}

interface LeadWebhookPayload {
  type: string;
  table: string;
  schema: string;
  record: LeadRecord;
  old_record: LeadRecord | null;
}

async function lookupSubCommitteeName(subCommitteeId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("send-lead-welcome-email: missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY");
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from("sub_committees")
      .select("name")
      .eq("id", subCommitteeId)
      .maybeSingle();
    if (error) throw error;
    return data?.name ?? null;
  } catch (err) {
    // Personalization detail only — a lookup failure should never block the welcome email.
    console.error(`send-lead-welcome-email: sub-committee lookup failed for ${subCommitteeId}`, err);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const webhookSecret = Deno.env.get("LEAD_WEBHOOK_SECRET");
  const authHeader = req.headers.get("Authorization");
  if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: LeadWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload?.type !== "INSERT" || payload?.table !== "leads" || !payload.record) {
    // Not the event this function handles (e.g. trigger later fires on UPDATE too).
    // Acknowledge cleanly rather than erroring the caller.
    return new Response(JSON.stringify({ skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const lead = payload.record;

  if (!lead.email) {
    console.error(`send-lead-welcome-email: lead ${lead.id} has no email, skipping send`);
    return new Response(JSON.stringify({ skipped: true, reason: "no email on lead" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("send-lead-welcome-email: RESEND_API_KEY is not configured");
    return new Response(JSON.stringify({ error: "Email provider not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subCommitteeName = lead.sub_committee_id
    ? await lookupSubCommitteeName(lead.sub_committee_id)
    : null;

  const templateInput = {
    fullName: lead.full_name,
    subCommitteeName,
    referredBy: lead.referred_by,
    onboardingUrl: SUB_COMMITTEES_URL,
  };

  const { subject, html, text } =
    lead.source === "referral" ? referralWelcomeEmail(templateInput) : websiteWelcomeEmail(templateInput);

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DoRight Initiative <onboarding@doright.ng>",
        to: [lead.email],
        subject,
        html,
        text,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error(
        `send-lead-welcome-email: Resend API error for lead ${lead.id}: ${resendResponse.status} ${errorBody}`,
      );
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Never let a provider outage or network blip surface as an unhandled exception.
    console.error(`send-lead-welcome-email: unexpected error sending email for lead ${lead.id}`, err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
