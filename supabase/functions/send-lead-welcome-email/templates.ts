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
