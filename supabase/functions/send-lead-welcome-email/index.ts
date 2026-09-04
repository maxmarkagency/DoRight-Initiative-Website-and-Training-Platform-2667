// Supabase Edge Function: send-lead-welcome-email
//
// Handles:
// 1. Initial welcome email on lead registration (INSERT trigger on public.leads) with virtual membership card link
// 2. Member Tier Transition email when promoted/moved between Tier 1, Tier 2, and Tier 3 with updated card link.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  adminNotificationEmail,
  adminPaymentNotificationEmail,
  contactFormAcknowledgementEmail,
  referralWelcomeEmail,
  websiteWelcomeEmail,
  tierTransitionEmail,
  donorInquiryEmail,
  donorContributionAcknowledgementEmail,
  partnershipInquiryEmail,
  advocacyCardReminderEmail,
  monthlyImpactStoryReminderEmail,
  annualRenewalCheckinEmail,
  tier2RenewalReminderEmail,
  tier3RenewalReminderEmail,
} from "./templates.ts";

const SUB_COMMITTEES_URL = "https://doright.ng/sub-committees";
const JOIN_FORM_URL = "https://doright.ng/join";
const MEMBERSHIP_CARD_BASE_URL = "https://doright.ng/membership-card";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("send-lead-welcome-email: RESEND_API_KEY is not configured");
    return new Response(JSON.stringify({ error: "Email provider not configured (RESEND_API_KEY missing)" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const defaultFrom = Deno.env.get("RESEND_FROM_EMAIL") || "DoRight Initiative <onboarding@doright.ng>";

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

    const membershipCardUrl = membershipId
      ? `${MEMBERSHIP_CARD_BASE_URL}?id=${encodeURIComponent(membershipId)}`
      : `${MEMBERSHIP_CARD_BASE_URL}`;

    const { subject, html, text } = tierTransitionEmail({
      fullName: recipientName,
      membershipId,
      fromTier,
      toTier,
      customNotes,
      membershipCardUrl,
      whatsappGroupUrl,
      paymentPortalUrl: Deno.env.get("PAYMENT_PORTAL_URL") || "https://doright.ng/donate",
      socialMediaUrl: Deno.env.get("SOCIAL_MEDIA_URL") || "https://doright.ng/contact",
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom,
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, tier: toTier, recipient: recipientEmail }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("send-lead-welcome-email: error sending tier transition email", err);
      return new Response(JSON.stringify({ error: "Failed to send email", details: err?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // --- Branch: Advocacy Card Download Reminder ---
  if (payload?.action === "CARD_DOWNLOAD_REMINDER" || payload?.type === "CARD_DOWNLOAD_REMINDER") {
    const recipientEmail = payload.lead?.email || payload.record?.email || (payload as any).email;
    const recipientName = payload.lead?.full_name || payload.record?.full_name || (payload as any).fullName || "Advocate";
    const membershipId = payload.lead?.membership_id || payload.record?.membership_id || (payload as any).membershipId || null;
    const tier = payload.lead?.tier || payload.record?.tier || (payload as any).tier || "tier_1";

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const membershipCardUrl = membershipId
      ? `${MEMBERSHIP_CARD_BASE_URL}?id=${encodeURIComponent(membershipId)}`
      : MEMBERSHIP_CARD_BASE_URL;

    const { subject, html, text } = advocacyCardReminderEmail({
      fullName: recipientName,
      membershipId,
      membershipCardUrl,
      tier,
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom,
          to: [recipientEmail],
          subject,
          html,
          text,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("send-lead-welcome-email: failed sending card reminder via Resend", errText);
        return new Response(JSON.stringify({ error: "Failed sending email via provider", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, recipient: recipientEmail, action: "CARD_DOWNLOAD_REMINDER" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("send-lead-welcome-email: error sending card reminder email", err);
      return new Response(JSON.stringify({ error: "Failed to send email", details: err?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // --- Branch: Monthly Impact Story Reminder ---
  if (payload?.action === "MONTHLY_STORY_REMINDER" || payload?.type === "MONTHLY_STORY_REMINDER") {
    const recipientEmail = payload.lead?.email || payload.record?.email || (payload as any).email;
    const recipientName = payload.lead?.full_name || payload.record?.full_name || (payload as any).fullName || "Advocate";
    const membershipId = payload.lead?.membership_id || payload.record?.membership_id || (payload as any).membershipId || null;
    const customMessage = (payload as any).customMessage || payload.customNotes || null;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tierLinks = await lookupTierWhatsAppLinks();
    const whatsappGroupUrl =
      (payload as any).whatsappGroupUrl ||
      tierLinks.tier_1 ||
      Deno.env.get("TIER_1_WHATSAPP_URL") ||
      "https://chat.whatsapp.com/CuwrXFIM8Ry2DZUImaHIxn?s=cl&p=i&ilr=4&amv=1";

    const { subject, html, text } = monthlyImpactStoryReminderEmail({
      fullName: recipientName,
      membershipId,
      whatsappGroupUrl,
      customMessage,
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom,
          to: [recipientEmail],
          subject,
          html,
          text,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("send-lead-welcome-email: failed sending monthly story reminder via Resend", errText);
        return new Response(JSON.stringify({ error: "Failed sending email via provider", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, recipient: recipientEmail, action: "MONTHLY_STORY_REMINDER" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("send-lead-welcome-email: error sending monthly story reminder email", err);
      return new Response(JSON.stringify({ error: "Failed to send email", details: err?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // --- Branch: Annual Renewal & Engagement Check-in ---
  if (payload?.action === "ANNUAL_RENEWAL_CHECKIN" || payload?.type === "ANNUAL_RENEWAL_CHECKIN") {
    const recipientEmail = payload.lead?.email || payload.record?.email || (payload as any).email;
    const recipientName = payload.lead?.full_name || payload.record?.full_name || (payload as any).fullName || "Advocate";
    const membershipId = payload.lead?.membership_id || payload.record?.membership_id || (payload as any).membershipId || null;
    const completionRate = (payload as any).completionRate;
    const submittedCount = (payload as any).submittedCount;
    const customNotes = payload.customNotes || (payload as any).customNotes || null;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html, text } = annualRenewalCheckinEmail({
      fullName: recipientName,
      membershipId,
      completionRate,
      submittedCount,
      customNotes,
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom,
          to: [recipientEmail],
          subject,
          html,
          text,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("send-lead-welcome-email: failed sending annual checkin via Resend", errText);
        return new Response(JSON.stringify({ error: "Failed sending email via provider", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, recipient: recipientEmail, action: "ANNUAL_RENEWAL_CHECKIN" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("send-lead-welcome-email: error sending annual renewal checkin email", err);
      return new Response(JSON.stringify({ error: "Failed to send email", details: err?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // --- Branch: Tier 2 Movement Champions Renewal Reminder ---
  if (payload?.action === "TIER2_RENEWAL_REMINDER" || payload?.type === "TIER2_RENEWAL_REMINDER") {
    const recipientEmail = payload.lead?.email || payload.record?.email || (payload as any).email;
    const recipientName = payload.lead?.full_name || payload.record?.full_name || (payload as any).fullName || "Movement Champion";
    const membershipId = payload.lead?.membership_id || payload.record?.membership_id || (payload as any).membershipId || null;
    const renewalDate = (payload as any).renewalDate || null;
    const reminderStage = (payload as any).reminderStage || "1_month";
    const weeksLeft = (payload as any).weeksLeft || 3;
    const paymentUrl = (payload as any).paymentUrl || null;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html, text } = tier2RenewalReminderEmail({
      fullName: recipientName,
      membershipId,
      renewalDate,
      reminderStage,
      weeksLeft,
      paymentUrl,
      email: recipientEmail,
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom,
          to: [recipientEmail],
          subject,
          html,
          text,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("send-lead-welcome-email: failed sending tier 2 renewal reminder via Resend", errText);
        return new Response(JSON.stringify({ error: "Failed sending email via provider", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, recipient: recipientEmail, action: "TIER2_RENEWAL_REMINDER", reminderStage }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("send-lead-welcome-email: error sending tier 2 renewal reminder email", err);
      return new Response(JSON.stringify({ error: "Failed to send email", details: err?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // --- Branch: Tier 3 and Above Strategic Leaders Renewal Reminder ---
  if (payload?.action === "TIER3_RENEWAL_REMINDER" || payload?.type === "TIER3_RENEWAL_REMINDER") {
    const recipientEmail = payload.lead?.email || payload.record?.email || (payload as any).email;
    const recipientName = payload.lead?.full_name || payload.record?.full_name || (payload as any).fullName || "Strategic Leader";
    const membershipId = payload.lead?.membership_id || payload.record?.membership_id || (payload as any).membershipId || null;
    const renewalDate = (payload as any).renewalDate || null;
    const reminderStage = (payload as any).reminderStage || "3_months";
    const weeksLeft = (payload as any).weeksLeft || 3;
    const paymentUrl = (payload as any).paymentUrl || null;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html, text } = tier3RenewalReminderEmail({
      fullName: recipientName,
      membershipId,
      renewalDate,
      reminderStage,
      weeksLeft,
      paymentUrl,
      email: recipientEmail,
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom,
          to: [recipientEmail],
          subject,
          html,
          text,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("send-lead-welcome-email: failed sending tier 3 renewal reminder via Resend", errText);
        return new Response(JSON.stringify({ error: "Failed sending email via provider", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, recipient: recipientEmail, action: "TIER3_RENEWAL_REMINDER", reminderStage }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("send-lead-welcome-email: error sending tier 3 renewal reminder email", err);
      return new Response(JSON.stringify({ error: "Failed to send email", details: err?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Target administrative email recipients - info@doright.ng is always included
  const adminRecipients = Array.from(
    new Set([
      "info@doright.ng",
      ...(Deno.env.get("ADMIN_EMAIL") ? [Deno.env.get("ADMIN_EMAIL")!.trim()] : []),
      ...(Deno.env.get("ENQUIRIES_EMAIL") ? [Deno.env.get("ENQUIRIES_EMAIL")!.trim()] : []),
    ])
  ).filter(Boolean);

  // --- Branch 2: Payment Contribution Acknowledgement ---
  if (payload?.action === "PAYMENT_ACKNOWLEDGEMENT" || payload?.type === "PAYMENT_ACKNOWLEDGEMENT") {
    const recipientEmail = payload.record?.email || (payload as any).email;
    const recipientName = payload.record?.customer_name || payload.record?.full_name || (payload as any).fullName || "Supporter";
    const amount = payload.record?.amount || (payload as any).amount;
    const phone = payload.record?.phone || (payload as any).phone || null;
    const organization = payload.record?.organization || (payload as any).organization || null;
    const purpose = payload.record?.purpose || (payload as any).purpose || "Civic Contribution";
    const channel = payload.record?.channel || (payload as any).channel || "paystack";
    const status = payload.record?.status || (payload as any).status || "successful";
    const reference = payload.record?.reference || (payload as any).reference || null;
    const bankUsed = payload.record?.metadata?.bank_used || (payload as any).bankUsed || null;
    const notes = payload.record?.notes || (payload as any).notes || null;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Recipient email is missing" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userReceipt = donorContributionAcknowledgementEmail({
      fullName: recipientName,
      amount,
    });

    const adminPayment = adminPaymentNotificationEmail({
      customerName: recipientName,
      email: recipientEmail,
      phone,
      organization,
      purpose,
      amount,
      channel,
      status,
      reference,
      bankUsed,
      notes,
    });

    try {
      const emailPromises = [
        // 1. Send receipt/acknowledgement to contributor
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: defaultFrom,
            to: [recipientEmail],
            subject: userReceipt.subject,
            html: userReceipt.html,
            text: userReceipt.text,
          }),
        }),
        // 2. Send instant notification to info@doright.ng
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: defaultFrom,
            to: adminRecipients,
            subject: adminPayment.subject,
            html: adminPayment.html,
            text: adminPayment.text,
          }),
        }),
      ];

      const [userRes, adminRes] = await Promise.all(emailPromises);

      if (!userRes.ok) {
        const errText = await userRes.text();
        console.error("send-lead-welcome-email: failed sending payment receipt to user via Resend", errText);
      }
      if (!adminRes.ok) {
        const errText = await adminRes.text();
        console.error("send-lead-welcome-email: failed sending payment notice to info@doright.ng via Resend", errText);
      }

      return new Response(JSON.stringify({ success: true, recipient: recipientEmail, adminRecipients }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("send-lead-welcome-email: error sending donation acknowledgement email", err);
      return new Response(JSON.stringify({ error: "Failed to send email", details: err?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // --- Branch 3: New Lead Welcome / Inquiry Email (Trigger or Direct Invoke) ---
  if (!payload?.record && payload?.lead) {
    payload.record = payload.lead as any;
  }

  if (!payload?.record) {
    return new Response(JSON.stringify({ skipped: true, reason: "No lead record in payload" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const lead = payload.record;

  if (!lead.email) {
    console.error(`send-lead-welcome-email: lead ${lead.id || 'unknown'} has no email, skipping send`);
    return new Response(JSON.stringify({ skipped: true, reason: "no email on lead" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const subCommitteeName = lead.sub_committee_id
    ? await lookupSubCommitteeName(lead.sub_committee_id)
    : null;

  const membershipCardUrl = lead.membership_id
    ? `${MEMBERSHIP_CARD_BASE_URL}?id=${encodeURIComponent(lead.membership_id)}`
    : `${MEMBERSHIP_CARD_BASE_URL}?leadId=${encodeURIComponent(lead.id || '')}`;

  const tierLinks = await lookupTierWhatsAppLinks();
  const whatsappGroupUrl =
    tierLinks.tier_1 || Deno.env.get("TIER_1_WHATSAPP_URL") || "https://chat.whatsapp.com/CuwrXFIM8Ry2DZUImaHIxn?s=cl&p=i&ilr=4&amv=1";

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

  // Determine user interest and details
  const interestMatch = lead.admin_notes?.match(/Interest:\s*([^\n\r]+)/i);
  const detectedInterest = ((lead as any).interest || (interestMatch ? interestMatch[1].trim() : '')).toLowerCase();
  const orgMatch = lead.admin_notes?.match(/Organization:\s*([^\n\r]+)/i);
  const detectedOrganization = (lead as any).organization || (orgMatch ? orgMatch[1].trim() : null);
  const subjectMatch = lead.admin_notes?.match(/Subject:\s*([^\n\r]+)/i);
  const detectedSubject = (lead as any).subject || (subjectMatch ? subjectMatch[1].trim() : null);

  let composed: { subject: string; html: string; text: string };
  if (lead.source === "contact_page" || lead.source === "contact_form") {
    composed = contactFormAcknowledgementEmail({
      fullName: lead.full_name,
      subject: detectedSubject,
    });
  } else if (detectedInterest.includes('donat') || detectedInterest === 'donating') {
    composed = donorInquiryEmail({
      fullName: lead.full_name,
      paymentPortalUrl: "https://doright.ng/pay?purpose=donation",
    });
  } else if (detectedInterest.includes('partner') || detectedInterest.includes('sponsor')) {
    composed = partnershipInquiryEmail({
      fullName: lead.full_name,
      organizationName: detectedOrganization,
    });
  } else if (lead.source === "referral") {
    composed = referralWelcomeEmail(templateInput);
  } else {
    composed = websiteWelcomeEmail(templateInput);
  }

  const { subject, html, text } = composed;

  const adminEmail = adminNotificationEmail({
    fullName: lead.full_name,
    email: lead.email,
    phone: lead.phone ?? null,
    membershipId: lead.membership_id,
    subCommitteeName,
    source: lead.source,
    referredBy: lead.referred_by,
    adminNotes: lead.admin_notes ?? null,
    interest: detectedInterest,
    organization: detectedOrganization,
    subject: detectedSubject,
  });

  const sendPromises = [
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: defaultFrom,
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
        from: defaultFrom,
        to: adminRecipients,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
      }),
    }),
  ];

  try {
    const [welcomeRes, adminRes] = await Promise.all(sendPromises);
    let welcomeError = null;
    let adminError = null;

    if (!welcomeRes.ok) {
      welcomeError = await welcomeRes.text();
      console.error(`send-lead-welcome-email: failed to send welcome email to ${lead.email}:`, welcomeError);
    }

    if (!adminRes.ok) {
      adminError = await adminRes.text();
      console.error(`send-lead-welcome-email: failed to send admin notification to info@doright.ng:`, adminError);
    }

    return new Response(
      JSON.stringify({
        success: !welcomeError,
        lead_id: lead.id,
        welcome_status: welcomeRes.status,
        welcome_error: welcomeError,
        admin_status: adminRes.status,
        admin_error: adminError,
        admin_recipients: adminRecipients,
      }),
      {
        status: welcomeError ? 500 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("send-lead-welcome-email: error dispatching emails via Resend:", err);
    return new Response(JSON.stringify({ error: "Failed to dispatch email", details: err?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
