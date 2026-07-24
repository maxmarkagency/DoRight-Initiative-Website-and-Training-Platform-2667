// Real DRAI-authored copy, from the "New Member Onboarding Process Plan" PDF. The two
// placeholder links the source document called out have been wired to the pages this project
// actually built: the sub-committee responsibilities link -> /sub-committees (Phase 3), and the
// website template's onboarding-form link -> /join (Phase 2). The direct-referral template has no
// form-link CTA in the source copy (the admin already captured the lead's details directly via
// Phase 5's referral form), so none is added here.

export interface WelcomeEmailInput {
  fullName: string;
  subCommitteeName: string | null;
  referredBy: string | null;
  subCommitteesUrl: string;
  joinFormUrl: string;
}

export interface ComposedEmail {
  subject: string;
  html: string;
  text: string;
}

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
      ${bodyHtml}
    </div>
  `;
}

const MISSION_VISION_HTML = `
  <h2 style="font-size: 16px; margin: 20px 0 4px;">Mission and Vision</h2>
  <p>Our vision is to reawaken and entrench uprightness in Nigeria.</p>
  <p>Our mission is to mobilize Nigerians to proactively resist lawlessness and moral decadence, fostering a culture where doing right is the norm.</p>
`;

const MISSION_VISION_TEXT =
  "Mission and Vision\n" +
  "Our vision is to reawaken and entrench uprightness in Nigeria.\n" +
  "Our mission is to mobilize Nigerians to proactively resist lawlessness and moral decadence, fostering a culture where doing right is the norm.\n\n";

function contributeSectionHtml(subCommitteesUrl: string): string {
  return `
    <h2 style="font-size: 16px; margin: 20px 0 4px;">How you can contribute</h2>
    <p><strong>Join a sub-committee</strong> - Contribute your expertise and passion by joining any of our sub-committees focused on communication, community engagement, fundraising, strategy or secretariat duties. For more information on roles of each committee <a href="${subCommitteesUrl}" style="color: #000; font-weight: bold;">click here</a>.</p>
    <p><strong>Spread the word</strong> - Raise awareness by sharing our mission and initiatives with your network, both online and offline.</p>
    <p><strong>Participate in activities</strong> - Get involved in our various activities, from awareness campaigns to mentoring sessions, and make a tangible difference in communities across Nigeria.</p>
    <p><strong>Be an advocate</strong> - Advocate for ethical behavior and values in your personal and professional life, serving as a role model for others to follow.</p>
  `;
}

function contributeSectionText(subCommitteesUrl: string): string {
  return (
    "How you can contribute\n" +
    `Join a sub-committee - Contribute your expertise and passion by joining any of our sub-committees focused on communication, community engagement, fundraising, strategy or secretariat duties. For more information on roles of each committee: ${subCommitteesUrl}\n\n` +
    "Spread the word - Raise awareness by sharing our mission and initiatives with your network, both online and offline.\n\n" +
    "Participate in activities - Get involved in our various activities, from awareness campaigns to mentoring sessions, and make a tangible difference in communities across Nigeria.\n\n" +
    "Be an advocate - Advocate for ethical behavior and values in your personal and professional life, serving as a role model for others to follow.\n\n"
  );
}

/** Pathway 1 — website self-serve (`source = 'website'`). */
export function websiteWelcomeEmail({
  fullName,
  subCommitteesUrl,
  joinFormUrl,
}: WelcomeEmailInput): ComposedEmail {
  const name = escapeHtml(fullName);

  return {
    subject: "Thank you for taking the first step to join the DoRight movement",
    html: wrapHtml(`
      <p>Thank you, ${name}, for taking the first step to join the "DO-RIGHT" movement. We are excited to have you onboard as we work together to drive positive change. Do Right is a non partisan, secular movement with no political affiliations.</p>
      ${MISSION_VISION_HTML}
      ${contributeSectionHtml(subCommitteesUrl)}
      <p><a href="${joinFormUrl}" style="color: #000; font-weight: bold;">Click here to fill the short form so we can complete your onboarding process</a></p>
      <p>The Doing Right Awareness Initiative Team</p>
    `),
    text:
      `Thank you, ${fullName}, for taking the first step to join the "DO-RIGHT" movement. We are excited to have you onboard as we work together to drive positive change. Do Right is a non partisan, secular movement with no political affiliations.\n\n` +
      MISSION_VISION_TEXT +
      contributeSectionText(subCommitteesUrl) +
      `Click here to fill the short form so we can complete your onboarding process: ${joinFormUrl}\n\n` +
      "The Doing Right Awareness Initiative Team",
  };
}

/** Pathway 2 — direct referral (`source = 'referral'`). */
export function referralWelcomeEmail({
  fullName,
  subCommitteesUrl,
}: WelcomeEmailInput): ComposedEmail {
  const name = escapeHtml(fullName);

  return {
    subject: "Great speaking with you about the DoRight Movement",
    html: wrapHtml(`
      <p>It was wonderful chatting with you today, ${name}, as a follow up on your interest in joining the "Do-Right Movement". We are excited to have you onboard as we work together to drive positive change. To share further details on who we are, Do Right is a non partisan, secular movement with no political affiliations.</p>
      ${MISSION_VISION_HTML}
      ${contributeSectionHtml(subCommitteesUrl)}
      <p>The Doing Right Awareness Initiative</p>
    `),
    text:
      `It was wonderful chatting with you today, ${fullName}, as a follow up on your interest in joining the "Do-Right Movement". We are excited to have you onboard as we work together to drive positive change. To share further details on who we are, Do Right is a non partisan, secular movement with no political affiliations.\n\n` +
      MISSION_VISION_TEXT +
      contributeSectionText(subCommitteesUrl) +
      "The Doing Right Awareness Initiative",
  };
}

export interface AdminNotificationInput {
  fullName: string;
  email: string;
  phone: string | null;
  subCommitteeName: string | null;
  source: string;
  referredBy: string | null;
  adminNotes: string | null;
}

/** Admin Notification Email — sent to enquires@doright.ng for every new join submission. */
export function adminNotificationEmail({
  fullName,
  email,
  phone,
  subCommitteeName,
  source,
  referredBy,
  adminNotes,
}: AdminNotificationInput): ComposedEmail {
  const name = escapeHtml(fullName);
  const userEmail = escapeHtml(email);
  const userPhone = escapeHtml(phone || "Not provided");
  const subCommittee = escapeHtml(subCommitteeName || "None selected");
  const src = escapeHtml(source);
  const referrer = referredBy ? escapeHtml(referredBy) : null;
  const notes = adminNotes ? escapeHtml(adminNotes) : null;

  return {
    subject: `New Join Submission: ${fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0D0E16; color: #ffffff; padding: 18px 24px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">New Join Form Submission</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0; font-size: 15px;">A new lead has submitted their details on the <strong>DoRight Initiative</strong> platform:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568; width: 150px;">Full Name:</td>
              <td style="padding: 10px 0; color: #1a202c;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Email Address:</td>
              <td style="padding: 10px 0; color: #1a202c;"><a href="mailto:${userEmail}" style="color: #005BBB; text-decoration: none;">${userEmail}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Phone Number:</td>
              <td style="padding: 10px 0; color: #1a202c;">${userPhone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Sub-Committee:</td>
              <td style="padding: 10px 0; color: #1a202c;">${subCommittee}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Submission Source:</td>
              <td style="padding: 10px 0; color: #1a202c;">${src}</td>
            </tr>
            ${referrer ? `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Referred By:</td>
              <td style="padding: 10px 0; color: #1a202c;">${referrer}</td>
            </tr>` : ''}
          </table>

          ${notes ? `
          <div style="margin-top: 20px; padding: 14px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-weight: bold; color: #4a5568; margin-bottom: 6px; font-size: 13px; text-transform: uppercase; tracking: 0.5px;">Interest & Message Details:</div>
            <div style="white-space: pre-wrap; color: #2d3748; font-size: 14px; line-height: 1.6;">${notes}</div>
          </div>` : ''}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0; text-align: center;">
            DoRight Awareness Initiative • Automatic Onboarding System
          </div>
        </div>
      </div>
    `,
    text:
      `New Join Form Submission: ${fullName}\n\n` +
      `Full Name: ${fullName}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone || "Not provided"}\n` +
      `Sub-Committee: ${subCommitteeName || "None selected"}\n` +
      `Source: ${source}\n` +
      (referredBy ? `Referred By: ${referredBy}\n` : "") +
      (adminNotes ? `\nInterest & Message:\n${adminNotes}\n` : ""),
  };
}
