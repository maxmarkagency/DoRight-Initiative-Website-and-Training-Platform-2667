// Official DRAI Welcome Email & Tier Notification Templates

export interface WelcomeEmailInput {
  fullName: string;
  membershipId?: string | null;
  subCommitteeName?: string | null;
  referredBy?: string | null;
  subCommitteesUrl?: string;
  joinFormUrl?: string;
  membershipCardUrl?: string;
  whatsappGroupUrl?: string;
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
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0D0E16; color: #ffffff; padding: 26px 30px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 4px; color: #F59E0B;">Doing Right Awareness Initiative</div>
        <div style="font-size: 13px; color: #cbd5e1;">Welcome & Membership Confirmation (Do-Right)</div>
      </div>
      <div style="padding: 32px 30px;">
        ${bodyHtml}
      </div>
      <div style="background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px; font-weight: bold; color: #334155;">Doing Right Awareness Initiative (DRAI)</p>
        <p style="margin: 0;">Reawakening Uprightness in Nigeria • Building a culture where doing right is the norm.</p>
      </div>
    </div>
  `;
}

const DEFAULT_WHATSAPP_URL = "https://chat.whatsapp.com/CuwrXFIM8Ry2DZUImaHIxn?s=cl&p=i&ilr=4&amv=1";

/**
 * Official Tier 1 Welcome Email Template
 * Exact text & structure specified by DRAI Leadership.
 */
export function websiteWelcomeEmail({
  fullName,
  membershipId,
  membershipCardUrl,
  whatsappGroupUrl,
}: WelcomeEmailInput): ComposedEmail {
  const name = escapeHtml(fullName.trim());
  const cardUrl = membershipCardUrl || `https://doright.ng/#/membership-card?id=${encodeURIComponent(membershipId || '')}`;
  const whatsappUrl = whatsappGroupUrl || DEFAULT_WHATSAPP_URL;

  const subject = "Welcome to the Doing Right Awareness Initiative (Do-Right)!";

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you for joining the <strong>Doing Right Awareness Initiative</strong> also known as <strong>Do-Right</strong>! We are excited to have you onboard as we work together to reawaken uprightness and drive positive change across Nigeria.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      As a non-partisan, secular organization with no political affiliations, our vision is to reawaken and entrench uprightness in Nigeria. Our mission is to mobilize like-minded Nigerians who understand the fundamental damage that lawlessness and moral decadence have done to our nation—and who are ready to initiate a national rebirth where every Nigerian sincerely desires to do right, everywhere, every time.
    </p>

    ${membershipId ? `
    <div style="background-color: #0F172A; color: #ffffff; border-radius: 10px; padding: 16px 20px; text-align: center; margin: 24px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 3px;">Your Official Membership ID</div>
      <div style="font-size: 22px; font-family: monospace; font-weight: bold; color: #F59E0B;">${escapeHtml(membershipId)}</div>
      <div style="font-size: 12px; color: #CBD5E1; margin-top: 3px;">Tier 1: Personal Advocate</div>
    </div>
    ` : ''}

    <div style="margin: 28px 0 20px;">
      <h2 style="font-size: 17px; font-weight: bold; color: #0f172a; margin: 0 0 10px; border-bottom: 2px solid #F59E0B; padding-bottom: 6px; display: inline-block;">
        Your Advocacy Journey
      </h2>
      <p style="font-size: 14px; color: #475569; margin: 8px 0 16px; line-height: 1.6;">
        To ensure a meaningful journey, all new members begin at <strong>Tier 1 (Personal Advocate)</strong>. As you actively engage over time, you will have the option of progressing sequentially through our advocacy tiers:
      </p>

      {/* Tier 1 Card */}
      <div style="background-color: #eff6ff; border-left: 4px solid #005BBB; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 14px;">
        <div style="font-size: 14px; font-weight: bold; color: #005BBB; margin-bottom: 4px;">
          Tier 1: Personal Advocate (Default Entry Point)
        </div>
        <div style="font-size: 13px; color: #1e3a8a; line-height: 1.55;">
          • <strong>Focus:</strong> Lead by personal example within your daily routine.<br>
          • <strong>Action:</strong> Share at least 1 personal impact story per month.<br>
          • <strong>Progression:</strong> 12 months of consistent tracking unlocks advancement to Tier 2.
        </div>
      </div>

      {/* Tier 2 Card */}
      <div style="background-color: #f3e8ff; border-left: 4px solid #6B46C1; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 14px;">
        <div style="font-size: 14px; font-weight: bold; color: #6B46C1; margin-bottom: 4px;">
          Tier 2: Movement Champion (Outreach & Mobilization)
        </div>
        <div style="font-size: 13px; color: #581c87; line-height: 1.55;">
          • <strong>Focus:</strong> Public outreach, social media campaigns, and community events.<br>
          • <strong>Action:</strong> Share 2 monthly campaign posts & attend 1 quarterly community event.<br>
          • <strong>Progression:</strong> 12 months of proven impact unlocks advancement to Tier 3.
        </div>
      </div>

      {/* Tier 3 Card */}
      <div style="background-color: #ecfdf5; border-left: 4px solid #047857; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 14px;">
        <div style="font-size: 14px; font-weight: bold; color: #047857; margin-bottom: 4px;">
          Tier 3: Strategic Leader (Operational & Sub-Committee Leadership)
        </div>
        <div style="font-size: 13px; color: #064e3b; line-height: 1.55;">
          • <strong>Focus:</strong> Driving organizational strategy and operations across specialized sub-committees.<br>
          • <strong>Action:</strong> Maintain 70% committee meeting attendance and deliver assigned monthly tasks in your sub-committees.
        </div>
      </div>
    </div>

    <div style="margin: 28px 0;">
      <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0 0 12px;">
        Click on the below links to:
      </h3>

      {/* WhatsApp Link Box */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Join our WhatsApp Community</strong> where you will find a group of like minded individuals who are also committed to driving a lasting culture shift across society.
        </p>
        <div>
          <a href="${whatsappUrl}" style="background-color: #25D366; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Join Tier 1 WhatsApp Community
          </a>
        </div>
      </div>

      {/* Advocate Card Box */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Access your advocate card.</strong> This card is valid for 1 year. You can store this card on your device and can also print a hard copy if you prefer.
        </p>
        <div>
          <a href="${cardUrl}" style="background-color: #F59E0B; color: #000000; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Download / Print Your Advocate Card
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">
          💡 <em>Tip: Once opened, click "Download Card" to save to your phone gallery, or click "Print / PDF" to create a physical ID badge.</em>
        </p>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.65; margin: 24px 0 28px;">
      Thank you for standing up to inspire a mindset shift. Together, we will make doing the right thing standard practice everywhere, every time!
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a;">The DRAI Admin Team</p>
      <p style="margin: 2px 0 0; color: #F59E0B; font-weight: 600;">Reawakening Uprightness in Nigeria</p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Dear ${fullName.trim()},\n\n` +
    `Thank you for joining the Doing Right Awareness Initiative also known as Do-Right! We are excited to have you onboard as we work together to reawaken uprightness and drive positive change across Nigeria.\n\n` +
    `As a non-partisan, secular organization with no political affiliations, our vision is to reawaken and entrench uprightness in Nigeria. Our mission is to mobilize like-minded Nigerians who understand the fundamental damage that lawlessness and moral decadence have done to our nation—and who are ready to initiate a national rebirth where every Nigerian sincerely desires to do right, everywhere, every time.\n\n` +
    `Your Advocacy Journey\n` +
    `To ensure a meaningful journey, all new members begin at Tier 1 (Personal Advocate). As you actively engage over time, you will have the option of progressing sequentially through our advocacy tiers:\n\n` +
    `Tier 1: Personal Advocate (Default Entry Point)\n` +
    `Focus: Lead by personal example within your daily routine.\n` +
    `Action: Share at least 1 personal impact story per month.\n` +
    `Progression: 12 months of consistent tracking unlocks advancement to Tier 2.\n\n` +
    `Tier 2: Movement Champion (Outreach & Mobilization)\n` +
    `Focus: Public outreach, social media campaigns, and community events.\n` +
    `Action: Share 2 monthly campaign posts & attend 1 quarterly community event.\n` +
    `Progression: 12 months of proven impact unlocks advancement to Tier 3.\n\n` +
    `Tier 3: Strategic Leader (Operational & Sub-Committee Leadership)\n` +
    `Focus: Driving organizational strategy and operations across specialized sub-committees.\n` +
    `Action: Maintain 70% committee meeting attendance and deliver assigned monthly tasks in your sub-committees.\n\n` +
    `Click on the below links to:\n\n` +
    `Join our WhatsApp Community where you will find a group of like minded individuals who are also committed to driving a lasting culture shift across society:\n` +
    `👉 WhatsApp Group: ${whatsappUrl}\n\n` +
    `Access your advocate card. This card is valid for 1 year. You can store this card on your device and can also print a hard copy if you prefer:\n` +
    `👉 Download Advocate Card: ${cardUrl}\n\n` +
    `Thank you for standing up to inspire a mindset shift. Together, we will make doing the right thing standard practice everywhere, every time!\n\n` +
    `Kind regards,\n` +
    `The DRAI Admin Team\n` +
    `Reawakening Uprightness in Nigeria`;

  return { subject, html, text };
}

/** Pathway 2 — direct referral (`source = 'referral'`). */
export function referralWelcomeEmail(input: WelcomeEmailInput): ComposedEmail {
  return websiteWelcomeEmail(input);
}

export interface AdminNotificationInput {
  fullName: string;
  email: string;
  phone: string | null;
  membershipId?: string | null;
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
  membershipId,
  subCommitteeName,
  source,
  referredBy,
  adminNotes,
}: AdminNotificationInput): ComposedEmail {
  const name = escapeHtml(fullName);
  const userEmail = escapeHtml(email);
  const userPhone = escapeHtml(phone || "Not provided");
  const memId = membershipId ? escapeHtml(membershipId) : "Assigned automatically";
  const subCommittee = escapeHtml(subCommitteeName || "None selected");
  const src = escapeHtml(source);
  const referrer = referredBy ? escapeHtml(referredBy) : null;
  const notes = adminNotes ? escapeHtml(adminNotes) : null;

  return {
    subject: `New Member Registration: ${fullName} (${memId})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0D0E16; color: #ffffff; padding: 18px 24px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #F59E0B;">New Member Registration (Tier 1: Personal Advocate)</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0; font-size: 15px;">A new member has registered on the <strong>DoRight Initiative</strong> platform:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568; width: 150px;">Full Name:</td>
              <td style="padding: 10px 0; color: #1a202c;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Membership ID:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #F59E0B; font-family: monospace;">${memId}</td>
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
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Initial Tier:</td>
              <td style="padding: 10px 0; color: #1a202c; font-weight: bold;">Tier 1: Personal Advocate</td>
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
            <div style="font-weight: bold; color: #4a5568; margin-bottom: 6px; font-size: 13px; text-transform: uppercase;">Interest & Details:</div>
            <div style="white-space: pre-wrap; color: #2d3748; font-size: 14px; line-height: 1.6;">${notes}</div>
          </div>` : ''}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0; text-align: center;">
            DoRight Awareness Initiative • Automatic Onboarding System
          </div>
        </div>
      </div>
    `,
    text:
      `New Member Registration: ${fullName}\n\n` +
      `Full Name: ${fullName}\n` +
      `Membership ID: ${memId}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone || "Not provided"}\n` +
      `Source: ${source}\n` +
      (referredBy ? `Referred By: ${referredBy}\n` : "") +
      (adminNotes ? `\nInterest & Details:\n${adminNotes}\n` : ""),
  };
}

export interface TierTransitionInput {
  fullName: string;
  membershipId?: string | null;
  fromTier?: string | null;
  toTier: string;
  customNotes?: string | null;
  membershipCardUrl?: string;
  whatsappGroupUrl?: string;
  paymentPortalUrl?: string;
  socialMediaUrl?: string;
}

const DEFAULT_TIER_2_WHATSAPP = "https://chat.whatsapp.com/DoRightTier2Champions";
const DEFAULT_PAYMENT_URL = "https://doright.ng/#/donate";
const DEFAULT_SOCIAL_URL = "https://doright.ng/#/contact";

/**
 * Official Tier 2 Progression Email Template:
 * Progression from Tier 1 (Personal Advocate) to Tier 2 (Movement Champion)
 */
export function tier2AdvancementEmail({
  fullName,
  membershipId,
  customNotes,
  membershipCardUrl,
  whatsappGroupUrl,
  paymentPortalUrl,
  socialMediaUrl,
}: TierTransitionInput): ComposedEmail {
  const name = escapeHtml(fullName.trim());
  const cardUrl = membershipCardUrl || `https://doright.ng/#/membership-card?id=${encodeURIComponent(membershipId || '')}`;
  const whatsappUrl = whatsappGroupUrl || DEFAULT_TIER_2_WHATSAPP;
  const paymentUrl = paymentPortalUrl || DEFAULT_PAYMENT_URL;
  const socialUrl = socialMediaUrl || DEFAULT_SOCIAL_URL;
  const notes = customNotes ? escapeHtml(customNotes) : null;

  const subject = "Congratulations! You’ve unlocked Tier 2: Movement Champion Status 🚀";

  const html = wrapHtml(`
    <div style="margin-bottom: 20px;">
      <div style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background-color: #f3e8ff; color: #6B46C1; font-size: 13px; font-weight: bold; margin-bottom: 12px;">
        Tier 2 Advancement • Movement Champion
      </div>
      <h1 style="font-size: 20px; font-weight: bold; color: #0f172a; margin: 0 0 16px; line-height: 1.4;">
        Congratulations! You’ve unlocked Tier 2: Movement Champion Status 🚀
      </h1>
    </div>

    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you for your dedicated involvement as a <strong>Personal Advocate (Tier 1)</strong> with the <strong>Doing Right Awareness Initiative (DRAI)</strong>! By modeling moral integrity daily and sharing your monthly impact stories, you’ve shown true commitment to living our core values.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      You have successfully met your Tier 1 benchmarks and have unlocked your Pathway to <strong>Tier 2: Movement Champion</strong>!
    </p>

    ${membershipId ? `
    <div style="background-color: #0F172A; color: #ffffff; border-radius: 10px; padding: 16px 20px; text-align: center; margin: 24px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 3px;">Membership ID</div>
      <div style="font-size: 22px; font-family: monospace; font-weight: bold; color: #F59E0B;">${escapeHtml(membershipId)}</div>
      <div style="font-size: 12px; color: #CBD5E1; margin-top: 3px;">Tier 2: Movement Champion</div>
    </div>
    ` : ''}

    {/* What changes in Tier 2 */}
    <div style="background-color: #f8fafc; border-left: 4px solid #6B46C1; border-radius: 0 8px 8px 0; padding: 18px 20px; margin: 24px 0;">
      <h2 style="font-size: 16px; font-weight: bold; color: #581c87; margin: 0 0 10px;">
        What changes in Tier 2?
      </h2>
      <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 12px;">
        As a <strong>Movement Champion (Outreach & Mobilizer)</strong>, your primary focus expands to spreading the DRAI vision across our communities.
      </p>
      <div style="font-size: 14px; color: #1e293b; line-height: 1.6;">
        <strong>Your core responsibilities in Tier 2 will be to:</strong>
        <ul style="margin: 6px 0 0; padding-left: 20px;">
          <li style="margin-bottom: 6px;">Share at least 2 monthly digital posts highlighting our movement and values.</li>
          <li>Actively participate in at least 1 quarterly community outreach event.</li>
        </ul>
      </div>
    </div>

    {/* Next Steps */}
    <div style="margin: 28px 0;">
      <h2 style="font-size: 17px; font-weight: bold; color: #0f172a; margin: 0 0 16px; border-bottom: 2px solid #F59E0B; padding-bottom: 6px; display: inline-block;">
        Next Steps:
      </h2>

      {/* 1. Membership Fee */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Membership fee</strong> — click here to pay your annual membership fee of <strong>NGN 5,000 (for students) & 10,000 (others)</strong>.
        </p>
        <div>
          <a href="${paymentUrl}" style="background-color: #005BBB; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Pay Annual Membership Fee
          </a>
        </div>
      </div>

      {/* 2. Membership Card */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Membership card</strong> — once your payment is processed, you will be issued your DRAI membership card. You can store this card on your device and print a hard copy.
        </p>
        <div>
          <a href="${cardUrl}" style="background-color: #F59E0B; color: #000000; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Access / Download Advocate Card
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">
          💡 <em>Tip: Click "Download Card" for a digital image on your phone, or "Print / PDF" for a physical ID badge.</em>
        </p>
      </div>

      {/* 3. Tier 2 WhatsApp Community */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Joining the Tier 2 Community:</strong> If you were not automatically routed to our Tier 2 community, please click on this link to connect with fellow Movement Champions, get more information on our outreach activities and access our social media assets.
        </p>
        <div>
          <a href="${whatsappUrl}" style="background-color: #25D366; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Join Tier 2 Movement Champions WhatsApp Group
          </a>
        </div>
      </div>

      {/* 4. Access Media Assets */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Access Media Assets:</strong> Follow us on Instagram (<strong><a href="https://instagram.com/dorightng" style="color: #E1306C; font-weight: bold; text-decoration: none;">@dorightng</a></strong>) and ensure you are following all our social media platforms listed <a href="${socialUrl}" style="color: #005BBB; font-weight: bold; text-decoration: underline;">here</a>, reshare our posts and tag <strong>#DoingRight</strong> every time you post or reshare our content.
        </p>
        <div>
          <a href="https://instagram.com/dorightng" style="background-color: #E1306C; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block; margin-right: 8px; margin-bottom: 6px;">
            📸 Follow @dorightng on Instagram
          </a>
          <a href="${socialUrl}" style="background-color: #0F172A; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 View All Social Channels
          </a>
        </div>
      </div>
    </div>

    ${notes ? `
    <div style="background-color: #f8fafc; border-left: 4px solid #6B46C1; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <div style="font-weight: bold; color: #475569; font-size: 12px; text-transform: uppercase; margin-bottom: 6px;">Message from DoRight Leadership:</div>
      <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${notes}</div>
    </div>
    ` : ''}

    <p style="font-size: 15px; color: #334155; line-height: 1.65; margin: 24px 0 28px;">
      Thank you for helping us scale our impact and take the DRAI movement to the next level.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a;">The DRAI Admin Team</p>
      <p style="margin: 2px 0 0; color: #6B46C1; font-weight: 600;">Doing Right Awareness Initiative</p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Dear ${fullName.trim()},\n\n` +
    `Thank you for your dedicated involvement as a Personal Advocate (Tier 1) with the Doing Right Awareness Initiative (DRAI)! By modeling moral integrity daily and sharing your monthly impact stories, you’ve shown true commitment to living our core values.\n\n` +
    `You have successfully met your Tier 1 benchmarks and have unlocked your Pathway to Tier 2: Movement Champion!\n\n` +
    `What changes in Tier 2?\n\n` +
    `As a Movement Champion (Outreach & Mobilizer), your primary focus expands to spreading the DRAI vision across our communities.\n\n` +
    `Your core responsibilities in Tier 2 will be to:\n` +
    `- Share at least 2 monthly digital posts highlighting our movement and values.\n` +
    `- Actively participate in at least 1 quarterly community outreach event.\n\n` +
    `Next Steps:\n\n` +
    `1. Membership fee - click here to pay your annual membership fee of NGN 5,000 (for students) & 10,000 (others): ${paymentUrl}\n\n` +
    `2. Membership card - once your payment is processed, you will be issued your DRAI membership card: ${cardUrl}\n\n` +
    `3. Joining the tier 2 Community: If you were not automatically routed to our tier 2 community, please click on this link to connect with fellow Movement Champions, get more information on our outreach activities and access our social media assets: ${whatsappUrl}\n\n` +
    `4. Access Media Assets: ensure you are following all our social media platforms listed here (${socialUrl}), reshare our posts and tag #DoingRight every time you post or reshare our content.\n\n` +
    (customNotes ? `Message from Leadership:\n${customNotes}\n\n` : '') +
    `Thank you for helping us scale our impact and take the DRAI movement to the next level.\n\n` +
    `Kind regards,\n` +
    `The DRAI Admin Team\n` +
    `Doing Right Awareness Initiative`;

  return { subject, html, text };
}

/** Email sent when an admin advances a member to a higher tier. */
export function tierTransitionEmail(input: TierTransitionInput): ComposedEmail {
  if (input.toTier === 'tier_2') {
    return tier2AdvancementEmail(input);
  }

  // Tier 3 or general fallback
  const name = escapeHtml(input.fullName.trim());
  const cardUrl = input.membershipCardUrl || `https://doright.ng/#/membership-card?id=${encodeURIComponent(input.membershipId || '')}`;
  const whatsappUrl = input.whatsappGroupUrl || "https://chat.whatsapp.com/DoRightTier3Leaders";
  const notes = input.customNotes ? escapeHtml(input.customNotes) : null;

  const subject = `🌟 Outstanding Leadership: Welcome to Tier 3 (Strategic Leader) at DoRight`;

  const html = wrapHtml(`
    <div style="margin-bottom: 20px;">
      <div style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background-color: #ecfdf5; color: #047857; font-size: 13px; font-weight: bold; margin-bottom: 12px;">
        Tier 3 Leadership • Strategic Leader
      </div>
      <h1 style="font-size: 20px; font-weight: bold; color: #0f172a; margin: 0 0 16px; line-height: 1.4;">
        Welcome to Tier 3: Strategic Leader at DoRight Awareness Initiative
      </h1>
    </div>

    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      In recognition of your exceptional dedication, proven community mobilization, and unwavering adherence to our core principles, we are thrilled to welcome you into <strong>Tier 3: Strategic Leader</strong>.
    </p>

    ${input.membershipId ? `
    <div style="background-color: #0F172A; color: #ffffff; border-radius: 10px; padding: 16px 20px; text-align: center; margin: 24px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 3px;">Membership ID</div>
      <div style="font-size: 22px; font-family: monospace; font-weight: bold; color: #F59E0B;">${escapeHtml(input.membershipId)}</div>
      <div style="font-size: 12px; color: #CBD5E1; margin-top: 3px;">Tier 3: Strategic Leader</div>
    </div>
    ` : ''}

    <div style="background-color: #f8fafc; border-left: 4px solid #047857; border-radius: 0 8px 8px 0; padding: 18px 20px; margin: 24px 0;">
      <h2 style="font-size: 16px; font-weight: bold; color: #064e3b; margin: 0 0 10px;">
        Your Strategic Leadership Responsibilities:
      </h2>
      <div style="font-size: 14px; color: #1e293b; line-height: 1.6;">
        <ul style="margin: 6px 0 0; padding-left: 20px;">
          <li style="margin-bottom: 6px;">Maintain at least 70% committee meeting attendance.</li>
          <li style="margin-bottom: 6px;">Deliver assigned monthly operational tasks in your specialized sub-committees.</li>
          <li>Mentor and guide emerging Tier 1 and Tier 2 advocates.</li>
        </ul>
      </div>
    </div>

    <div style="margin: 28px 0;">
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px;">
          <strong>Access your updated Tier 3 Advocate Card:</strong>
        </p>
        <div>
          <a href="${cardUrl}" style="background-color: #F59E0B; color: #000000; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Access / Download Updated Card
          </a>
        </div>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px;">
          <strong>Join the Tier 3 Strategic Leadership Council WhatsApp Group:</strong>
        </p>
        <div>
          <a href="${whatsappUrl}" style="background-color: #25D366; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Join Tier 3 Leadership WhatsApp Group
          </a>
        </div>
      </div>
    </div>

    ${notes ? `
    <div style="background-color: #f8fafc; border-left: 4px solid #047857; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <div style="font-weight: bold; color: #475569; font-size: 12px; text-transform: uppercase; margin-bottom: 6px;">Message from DoRight Leadership:</div>
      <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${notes}</div>
    </div>
    ` : ''}

    <p style="font-size: 15px; color: #334155; line-height: 1.65; margin: 24px 0 28px;">
      Thank you for leading by example and shaping the strategic future of the Doing Right Awareness Initiative.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a;">The DRAI Admin Team</p>
      <p style="margin: 2px 0 0; color: #047857; font-weight: 600;">Doing Right Awareness Initiative</p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Dear ${input.fullName.trim()},\n\n` +
    `In recognition of your exceptional dedication, proven community mobilization, and unwavering adherence to our core principles, we are thrilled to welcome you into Tier 3: Strategic Leader.\n\n` +
    (input.membershipId ? `Membership ID: ${input.membershipId}\n\n` : '') +
    `Access Updated Advocate Card: ${cardUrl}\n\n` +
    `Join Tier 3 Leadership WhatsApp Group: ${whatsappUrl}\n\n` +
    (input.customNotes ? `Message from Leadership:\n${input.customNotes}\n\n` : '') +
    `Kind regards,\n` +
    `The DRAI Admin Team\n` +
    `Doing Right Awareness Initiative`;

  return { subject, html, text };
}
