// DRAFT COPY — replace before sending real emails to real leads.
//
// The original template copy came from the "New Member Onboarding Process Plan" PDF cited in
// docs/superpowers/specs/2026-07-17-member-onboarding-pipeline-design.md. That PDF is no longer
// accessible to this implementation pass, so everything below is a reasonable placeholder in the
// DRAI "Civic Standard-Bearer" voice (bold, dignified, institutional) — NOT the real DRAI-authored
// copy. Swap it out for the authored version before this goes anywhere near a live inbox.

export interface WelcomeEmailInput {
  fullName: string;
  subCommitteeName: string | null;
  referredBy: string | null;
  onboardingUrl: string;
}

export interface ComposedEmail {
  subject: string;
  html: string;
  text: string;
}

const DRAFT_BANNER_HTML =
  '<p style="text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: #9a7b1a; margin-bottom: 24px;">DRAFT COPY — pending real DRAI-authored template</p>';
const DRAFT_BANNER_TEXT = "DRAFT COPY — pending real DRAI-authored template\n";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapHtml(bodyHtml: string): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.5;">
      ${DRAFT_BANNER_HTML}
      ${bodyHtml}
    </div>
  `;
}

/** Pathway 1 — website self-serve (`source = 'website'`). */
export function websiteWelcomeEmail({
  fullName,
  subCommitteeName,
  onboardingUrl,
}: WelcomeEmailInput): ComposedEmail {
  const name = escapeHtml(fullName);
  const committeeHtml = subCommitteeName
    ? `<p>You noted an interest in our <strong>${escapeHtml(subCommitteeName)}</strong> sub-committee — take a look at what that team does using the link below.</p>`
    : `<p>Take a look at what each of our sub-committees does using the link below, and let us know which one speaks to you.</p>`;
  const committeeText = subCommitteeName
    ? `You noted an interest in our ${subCommitteeName} sub-committee.\n`
    : "";

  return {
    subject: "Welcome to the DoRight Initiative — thank you for reaching out",
    html: wrapHtml(`
      <h1 style="font-size: 22px; margin-bottom: 4px;">Welcome, ${name}.</h1>
      <p>Thank you for stepping forward to join the DoRight Initiative. We received your submission, and a member of our team will be in touch within 24 hours to welcome you properly.</p>
      ${committeeHtml}
      <p><a href="${onboardingUrl}" style="color: #000; font-weight: bold;">See sub-committee responsibilities &rarr;</a></p>
      <p>In the meantime, if you have any questions, simply reply to this email.</p>
      <p>In service,<br/>The DoRight Initiative Team</p>
    `),
    text:
      `${DRAFT_BANNER_TEXT}\n` +
      `Welcome, ${fullName}.\n\n` +
      `Thank you for stepping forward to join the DoRight Initiative. We received your submission, and a member of our team will be in touch within 24 hours to welcome you properly.\n\n` +
      committeeText +
      `See sub-committee responsibilities: ${onboardingUrl}\n\n` +
      `In service,\nThe DoRight Initiative Team`,
  };
}

/** Pathway 2 — direct referral (`source = 'referral'`). */
export function referralWelcomeEmail({
  fullName,
  subCommitteeName,
  referredBy,
  onboardingUrl,
}: WelcomeEmailInput): ComposedEmail {
  const name = escapeHtml(fullName);
  const referredHtml = referredBy
    ? `<p>${escapeHtml(referredBy)} thought you'd be a strong fit for our work, and passed your details along to us.</p>`
    : `<p>One of our members thought you'd be a strong fit for our work, and passed your details along to us.</p>`;
  const referredText = referredBy
    ? `${referredBy} thought you'd be a strong fit for our work, and passed your details along to us.\n\n`
    : "One of our members thought you'd be a strong fit for our work, and passed your details along to us.\n\n";
  const committeeHtml = subCommitteeName
    ? `<p>We understand you may have an interest in our <strong>${escapeHtml(subCommitteeName)}</strong> sub-committee — read more about it below.</p>`
    : `<p>Read more about each of our sub-committees below, and let us know which one speaks to you.</p>`;
  const committeeText = subCommitteeName
    ? `We understand you may have an interest in our ${subCommitteeName} sub-committee.\n`
    : "";

  return {
    subject: "You've been referred to the DoRight Initiative",
    html: wrapHtml(`
      <h1 style="font-size: 22px; margin-bottom: 4px;">Welcome, ${name}.</h1>
      ${referredHtml}
      <p>We'd be glad to have you formally join the DoRight Initiative. A member of our team will follow up with you directly.</p>
      ${committeeHtml}
      <p><a href="${onboardingUrl}" style="color: #000; font-weight: bold;">See sub-committee responsibilities &rarr;</a></p>
      <p>If you have any questions before then, simply reply to this email.</p>
      <p>In service,<br/>The DoRight Initiative Team</p>
    `),
    text:
      `${DRAFT_BANNER_TEXT}\n` +
      `Welcome, ${fullName}.\n\n` +
      referredText +
      `We'd be glad to have you formally join the DoRight Initiative. A member of our team will follow up with you directly.\n\n` +
      committeeText +
      `See sub-committee responsibilities: ${onboardingUrl}\n\n` +
      `In service,\nThe DoRight Initiative Team`,
  };
}
