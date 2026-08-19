// Supabase Edge Function: send-lead-welcome-email
//
// Handles:
// 1. Initial welcome email on lead registration (INSERT trigger on public.leads) with virtual membership card link
// 2. Member Tier Transition email when promoted/moved between Tier 1, Tier 2, and Tier 3 with updated card link.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  adminNotificationEmail,
  referralWelcomeEmail,
  websiteWelcomeEmail,
  tierTransitionEmail
} from "./templates.ts";

const SUB_COMMITTEES_URL = "https://doright.ng/#/sub-committees";
const JOIN_FORM_URL = "https://doright.ng/#/join";
const MEMBERSHIP_CARD_BASE_URL = "https://doright.ng/#/membership-card";

interface LeadRecord {
  id: string;
  membership_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  sub_committee_id: string | null;
  source: string;
  referred_by: string | null;
  admin_notes?: string | null;
  tier?: string | null;
}

interface WebhookPayload {
  type?: string;
  action?: string;
  table?: string;
  schema?: string;
  record?: LeadRecord;
  old_record?: LeadRecord | null;
  // Direct tier transition payload fields:
  toTier?: string;
  fromTier?: string | null;
  customNotes?: string | null;
  lead?: {
    id: string;
    membership_id?: string | null;
    full_name: string;
    email: string;
    tier?: string;
  };
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
    console.error(`send-lead-welcome-email: sub-committee lookup failed for ${subCommitteeId}`, err);
    return null;
  }
}

async function lookupTierWhatsAppLinks(): Promise<{ [key: string]: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return {};

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "tier_whatsapp_links")
      .maybeSingle();
    return (data?.setting_value as { [key: string]: string }) || {};
  } catch (err) {
    console.error("send-lead-welcome-email: error loading tier_whatsapp_links from site_settings", err);
    return {};
  }
}

Deno.serve(async (req: Request) => {
  // Check authorization header
  const webhookSecret = Deno.env.get("LEAD_WEBHOOK_SECRET");
  const authHeader = req.headers.get("Authorization");
  const isAuthorized = !webhookSecret || authHeader === `Bearer ${webhookSecret}`;

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
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

  // --- Branch 1: Tier Transition Email ---
  if (payload?.action === "TIER_TRANSITION" || payload?.type === "TIER_TRANSITION") {
    const recipientEmail = payload.lead?.email || payload.record?.email;
    const recipientName = payload.lead?.full_name || payload.record?.full_name || "Member";
    const membershipId = payload.lead?.membership_id || payload.record?.membership_id || null;
    const toTier = payload.toTier || payload.record?.tier || "tier_1";
    const fromTier = payload.fromTier || payload.old_record?.tier || null;
    const customNotes = payload.customNotes || null;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is missing" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tierLinks = await lookupTierWhatsAppLinks();
    const whatsappGroupUrl =
      payload.whatsappGroupUrl ||
      tierLinks[toTier] ||
      (toTier === 'tier_3'
        ? "https://chat.whatsapp.com/DoRightTier3Leaders"
        : "https://chat.whatsapp.com/DoRightTier2Champions");

    const { subject, html, text } = tierTransitionEmail({
      fullName: recipientName,
      membershipId,
      fromTier,
      toTier,
      customNotes,
      membershipCardUrl,
      whatsappGroupUrl,
      paymentPortalUrl: Deno.env.get("PAYMENT_PORTAL_URL") || "https://doright.ng/#/donate",
      socialMediaUrl: Deno.env.get("SOCIAL_MEDIA_URL") || "https://doright.ng/#/contact",
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DoRight Initiative <onboarding@doright.ng>",
          to: [recipientEmail],
          subject,
          html,
          text,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("send-lead-welcome-email: failed sending tier email via Resend", errText);
        return new Response(JSON.stringify({ error: "Failed sending email via provider", details: errText }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, tier: toTier, recipient: recipientEmail }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("send-lead-welcome-email: error sending tier transition email", err);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // --- Branch 2: Database INSERT Trigger (New Lead Welcome) ---
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload?.type !== "INSERT" || payload?.table !== "leads" || !payload.record) {
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

  const subCommitteeName = lead.sub_committee_id
    ? await lookupSubCommitteeName(lead.sub_committee_id)
    : null;

  const membershipCardUrl = lead.membership_id
    ? `${MEMBERSHIP_CARD_BASE_URL}?id=${encodeURIComponent(lead.membership_id)}`
    : `${MEMBERSHIP_CARD_BASE_URL}?leadId=${encodeURIComponent(lead.id)}`;

  const tierLinks = await lookupTierWhatsAppLinks();
  const whatsappGroupUrl =
    tierLinks.tier_1 || Deno.env.get("TIER_1_WHATSAPP_URL") || "https://chat.whatsapp.com/DoRightTier1Advocates";

  const templateInput = {
    fullName: lead.full_name,
    membershipId: lead.membership_id,
    subCommitteeName,
    referredBy: lead.referred_by,
    subCommitteesUrl: SUB_COMMITTEES_URL,
    joinFormUrl: JOIN_FORM_URL,
    membershipCardUrl,
    whatsappGroupUrl,
  };

  const { subject, html, text } =
    lead.source === "referral" ? referralWelcomeEmail(templateInput) : websiteWelcomeEmail(templateInput);

  const adminEmailRecipient = Deno.env.get("ENQUIRIES_EMAIL") || "enquires@doright.ng";
  const adminEmail = adminNotificationEmail({
    fullName: lead.full_name,
    email: lead.email,
    phone: lead.phone ?? null,
    membershipId: lead.membership_id,
    subCommitteeName,
    source: lead.source,
    referredBy: lead.referred_by,
    adminNotes: lead.admin_notes ?? null,
  });

  const sendPromises = [
    fetch("https://api.resend.com/emails", {
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
    }),
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DoRight Notifications <notifications@doright.ng>",
        to: [adminEmailRecipient],
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
      }),
    }),
  ];

  try {
    const [welcomeRes, adminRes] = await Promise.all(sendPromises);

    if (!welcomeRes.ok) {
      const errText = await welcomeRes.text();
      console.error(`send-lead-welcome-email: failed to send welcome email to ${lead.email}:`, errText);
    }

    if (!adminRes.ok) {
      const errText = await adminRes.text();
      console.error(`send-lead-welcome-email: failed to send admin notification to ${adminEmailRecipient}:`, errText);
    }

    return new Response(JSON.stringify({ success: true, lead_id: lead.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-lead-welcome-email: error dispatching emails via Resend:", err);
    return new Response(JSON.stringify({ error: "Failed to dispatch email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
