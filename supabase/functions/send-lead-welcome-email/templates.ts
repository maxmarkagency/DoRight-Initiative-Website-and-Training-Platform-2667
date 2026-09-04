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
  const cardUrl = membershipCardUrl || `https://doright.ng/membership-card?id=${encodeURIComponent(membershipId || '')}`;
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
  referredBy?: string | null;
  adminNotes: string | null;
  interest?: string | null;
  organization?: string | null;
  subject?: string | null;
}

/** Admin Notification Email — sent to info@doright.ng for every member signup, partnership, donation inquiry, or contact form submission. */
export function adminNotificationEmail({
  fullName,
  email,
  phone,
  membershipId,
  subCommitteeName,
  source,
  referredBy,
  adminNotes,
  interest,
  organization,
  subject: customSubject,
}: AdminNotificationInput): ComposedEmail {
  const name = escapeHtml(fullName || "Supporter");
  const userEmail = escapeHtml(email || "Not provided");
  const userPhone = escapeHtml(phone || "Not provided");
  const memId = membershipId ? escapeHtml(membershipId) : "Assigned automatically";
  const subCommittee = escapeHtml(subCommitteeName || "None selected");
  const src = escapeHtml(source);
  const referrer = referredBy ? escapeHtml(referredBy) : null;
  const notes = adminNotes ? escapeHtml(adminNotes) : null;
  const org = organization ? escapeHtml(organization) : null;

  const interestLower = (interest || "").toLowerCase();
  const notesLower = (adminNotes || "").toLowerCase();
  const srcLower = (source || "").toLowerCase();

  let categoryTitle = "New Member Registration (Tier 1: Personal Advocate)";
  let categoryBadge = "Tier 1: Personal Advocate";
  let categoryIntro = "A new member has registered on the <strong>DoRight Initiative</strong> platform:";
  let emailSubject = `[New Member Registration] ${fullName} (${memId}) - DoRight Initiative`;

  if (interestLower.includes("partner") || notesLower.includes("partner") || interestLower.includes("sponsor")) {
    categoryTitle = "New Strategic Partnership Inquiry";
    categoryBadge = "Partnership / Collaboration";
    categoryIntro = "A new partnership / collaboration inquiry has been submitted on the <strong>DoRight Initiative</strong> platform:";
    emailSubject = `[New Partnership Inquiry] ${fullName}${org ? ` (${org})` : ""} - DoRight Initiative`;
  } else if (interestLower.includes("donat") || notesLower.includes("donat")) {
    categoryTitle = "New Civic Donation Inquiry";
    categoryBadge = "Donation / Supporter";
    categoryIntro = "A new donation inquiry / supporter has registered on the <strong>DoRight Initiative</strong> platform:";
    emailSubject = `[New Donation Inquiry] ${fullName} - DoRight Initiative`;
  } else if (srcLower.includes("contact") || interestLower.includes("contact")) {
    categoryTitle = "New Website Contact Inquiry";
    categoryBadge = "Contact Form Message";
    categoryIntro = "A new message has been received through the <strong>DoRight Initiative</strong> contact form:";
    emailSubject = `[Website Contact Inquiry] ${fullName}${customSubject ? `: ${customSubject}` : ""} - DoRight Initiative`;
  } else if (srcLower.includes("sub_committee") || subCommitteeName) {
    categoryTitle = `Sub-Committee Registration (${subCommittee})`;
    categoryBadge = `Sub-Committee: ${subCommittee}`;
    categoryIntro = `A member has joined a specialized sub-committee on the <strong>DoRight Initiative</strong> platform:`;
    emailSubject = `[Sub-Committee Joined] ${fullName} - ${subCommittee} - DoRight Initiative`;
  }

  return {
    subject: emailSubject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0D0E16; color: #ffffff; padding: 18px 24px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #F59E0B;">${categoryTitle}</h2>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">Doing Right Awareness Initiative (Do-Right)</div>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0; font-size: 15px;">${categoryIntro}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568; width: 150px;">Full Name:</td>
              <td style="padding: 10px 0; color: #1a202c; font-weight: 600;">${name}</td>
            </tr>
            ${org ? `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Organization:</td>
              <td style="padding: 10px 0; color: #1a202c;">${org}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Classification / Tier:</td>
              <td style="padding: 10px 0; color: #1a202c; font-weight: bold;">${categoryBadge}</td>
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
            ${subCommitteeName ? `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Sub-Committee:</td>
              <td style="padding: 10px 0; color: #1a202c; font-weight: bold; color: #047857;">${subCommittee}</td>
            </tr>` : ''}
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
            <div style="font-weight: bold; color: #4a5568; margin-bottom: 6px; font-size: 13px; text-transform: uppercase;">Submission Details &amp; Message:</div>
            <div style="white-space: pre-wrap; color: #2d3748; font-size: 14px; line-height: 1.6;">${notes}</div>
          </div>` : ''}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0; text-align: center;">
            DoRight Awareness Initiative • System Notification • Sent to info@doright.ng
          </div>
        </div>
      </div>
    `,
    text:
      `${emailSubject}\n\n` +
      `Full Name: ${fullName}\n` +
      (organization ? `Organization: ${organization}\n` : "") +
      `Category: ${categoryBadge}\n` +
      `Membership ID: ${memId}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone || "Not provided"}\n` +
      `Source: ${source}\n` +
      (subCommitteeName ? `Sub-Committee: ${subCommitteeName}\n` : "") +
      (referredBy ? `Referred By: ${referredBy}\n` : "") +
      (adminNotes ? `\nSubmission Details & Message:\n${adminNotes}\n` : ""),
  };
}

export interface AdminPaymentNotificationInput {
  customerName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  purpose?: string | null;
  amount: number | string;
  currency?: string | null;
  channel?: string | null;
  status?: string | null;
  reference?: string | null;
  bankUsed?: string | null;
  notes?: string | null;
}

/** Admin Payment / Donation Notification Email — sent to info@doright.ng for online Paystack donations and bank transfers. */
export function adminPaymentNotificationEmail({
  customerName,
  email,
  phone,
  organization,
  purpose,
  amount,
  currency = "NGN",
  channel = "paystack",
  status = "successful",
  reference,
  bankUsed,
  notes,
}: AdminPaymentNotificationInput): ComposedEmail {
  const name = escapeHtml(customerName || "Supporter");
  const userEmail = escapeHtml(email || "Not provided");
  const userPhone = escapeHtml(phone || "Not provided");
  const org = organization ? escapeHtml(organization) : null;
  const purp = escapeHtml(purpose || "Civic Contribution");
  const formattedAmount = Number(amount || 0).toLocaleString("en-NG");
  const isTransfer = channel === "bank_transfer";
  const chan = isTransfer ? "Direct Bank Transfer" : "Paystack Online Payment";
  const stat = status === "pending_verification" ? "Pending Verification" : "Successful";
  const ref = reference ? escapeHtml(reference) : "N/A";
  const bank = bankUsed ? escapeHtml(bankUsed) : null;
  const userNotes = notes ? escapeHtml(notes) : null;

  const subject = `[${isTransfer ? "Bank Transfer Notice" : "Payment Received"}: ₦${formattedAmount}] ${customerName} (${purp}) - DoRight Initiative`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0D0E16; color: #ffffff; padding: 18px 24px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #F59E0B;">
          ${isTransfer ? "Direct Bank Transfer Notice" : "Online Payment Received"}
        </h2>
        <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">
          ${purp} • ₦${formattedAmount} ${currency}
        </div>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="margin-top: 0; font-size: 15px;">
          A new ${isTransfer ? "bank transfer notice" : "payment contribution"} has been submitted on the <strong>DoRight Initiative</strong> platform:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568; width: 160px;">Contributor / Name:</td>
            <td style="padding: 10px 0; color: #1a202c; font-weight: bold;">${name}</td>
          </tr>
          ${org ? `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Organization:</td>
            <td style="padding: 10px 0; color: #1a202c;">${org}</td>
          </tr>` : ""}
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Amount:</td>
            <td style="padding: 10px 0; font-size: 16px; font-weight: bold; color: #047857;">₦${formattedAmount} (${currency})</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Purpose:</td>
            <td style="padding: 10px 0; color: #1a202c; font-weight: 600;">${purp}</td>
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
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Payment Channel:</td>
            <td style="padding: 10px 0; color: #1a202c;">${chan}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Status:</td>
            <td style="padding: 10px 0; font-weight: bold; color: ${status === "successful" ? "#047857" : "#D97706"};">${stat}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Reference / Narration:</td>
            <td style="padding: 10px 0; color: #1a202c; font-family: monospace; font-weight: bold;">${ref}</td>
          </tr>
          ${bank ? `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Bank Transferred From:</td>
            <td style="padding: 10px 0; color: #1a202c;">${bank}</td>
          </tr>` : ""}
        </table>

        ${userNotes ? `
        <div style="margin-top: 20px; padding: 14px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-weight: bold; color: #4a5568; margin-bottom: 6px; font-size: 13px; text-transform: uppercase;">Contributor Notes:</div>
          <div style="white-space: pre-wrap; color: #2d3748; font-size: 14px; line-height: 1.6;">${userNotes}</div>
        </div>` : ""}

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0; text-align: center;">
          DoRight Awareness Initiative • Financial &amp; Payment Monitoring System • Sent to info@doright.ng
        </div>
      </div>
    </div>
  `;

  const text =
    `${subject}\n\n` +
    `Contributor: ${customerName}\n` +
    (organization ? `Organization: ${organization}\n` : "") +
    `Amount: ₦${formattedAmount} (${currency})\n` +
    `Purpose: ${purpose}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone || "Not provided"}\n` +
    `Channel: ${chan}\n` +
    `Status: ${stat}\n` +
    `Reference: ${ref}\n` +
    (bankUsed ? `Bank: ${bankUsed}\n` : "") +
    (notes ? `\nNotes:\n${notes}\n` : "");

  return { subject, html, text };
}

/** Contact Form Acknowledgement Email sent to visitor. */
export function contactFormAcknowledgementEmail({
  fullName,
  subject,
}: { fullName: string; subject?: string | null }): ComposedEmail {
  const name = escapeHtml(fullName.trim());
  const userSubject = subject ? escapeHtml(subject) : "your inquiry";

  const emailSubject = `Thank you for contacting DoRight Initiative: ${subject || 'We received your message'}`;

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you for reaching out to the <strong>Doing Right Awareness Initiative (Do-Right)</strong> regarding <em>"${userSubject}"</em>.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      We have received your message and our team is reviewing your inquiry. We strive to respond to all inquiries within 24 to 48 hours.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
      <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 0 0 8px;">Direct Contact Details:</h3>
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
        • Email: <a href="mailto:info@doright.ng" style="color: #005BBB; font-weight: 600;">info@doright.ng</a><br>
        • WhatsApp / Phone: +234 912 339 9968<br>
        • Address: 28b, Olaminuyun street, Parkview, Ikoyi, Lagos, Nigeria
      </p>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you for your commitment to fostering a culture of uprightness and integrity across Nigeria.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Warm regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 15px;">The DoRight Team</p>
      <p style="margin: 2px 0 0; color: #005BBB; font-weight: 600;">Doing Right Awareness Initiative (DRAI)</p>
    </div>
  `);

  const text =
    `Subject: ${emailSubject}\n\n` +
    `Dear ${fullName.trim()},\n\n` +
    `Thank you for reaching out to the Doing Right Awareness Initiative (Do-Right) regarding "${subject || 'your inquiry'}".\n\n` +
    `We have received your message and our team is reviewing your inquiry. We strive to respond to all inquiries within 24 to 48 hours.\n\n` +
    `Direct Contact Details:\n` +
    `- Email: info@doright.ng\n` +
    `- Phone: +234 912 339 9968\n` +
    `- Address: 28b, Olaminuyun street, Parkview, Ikoyi, Lagos, Nigeria\n\n` +
    `Warm regards,\n` +
    `The DoRight Team\n` +
    `Doing Right Awareness Initiative (DRAI)`;

  return { subject: emailSubject, html, text };
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
const DEFAULT_PAYMENT_URL = "https://doright.ng/donate";
const DEFAULT_SOCIAL_URL = "https://doright.ng/contact";

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
  const cardUrl = membershipCardUrl || `https://doright.ng/membership-card?id=${encodeURIComponent(membershipId || '')}`;
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

/** Email sent when an admin advances a member to Tier 3 (Strategic Leader). */
export function tier3AdvancementEmail(input: TierTransitionInput): ComposedEmail {
  const name = escapeHtml(input.fullName.trim());
  const cardUrl = input.membershipCardUrl || `https://doright.ng/membership-card?id=${encodeURIComponent(input.membershipId || '')}`;
  const whatsappUrl = input.whatsappGroupUrl || "https://chat.whatsapp.com/DoRightTier3Leaders";
  const paymentUrl = "https://doright.ng/donate";
  const subCommitteesUrl = "https://doright.ng/sub-committees";
  const notes = input.customNotes ? escapeHtml(input.customNotes) : null;

  const subject = "Leadership Advancement: Welcome to Tier 3 (Strategic Leader) 🌟";

  const html = wrapHtml(`
    <div style="margin-bottom: 20px;">
      <div style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background-color: #ecfdf5; color: #047857; font-size: 13px; font-weight: bold; margin-bottom: 12px;">
        Tier 3 Advancement • Strategic Leader
      </div>
      <h1 style="font-size: 20px; font-weight: bold; color: #0f172a; margin: 0 0 16px; line-height: 1.4;">
        Leadership Advancement: Welcome to Tier 3 (Strategic Leader) 🌟
      </h1>
    </div>

    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Your active participation as a <strong>Movement Champion (Tier 2)</strong> has made a vital impact on our community. Thanks to your outreach efforts, digital publishing, and community engagement, our vision is stronger than ever.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Having met and exceeded your Tier 2 outreach milestones you have unlocked your Pathway to <strong>Tier 3: Strategic Leader</strong>!
    </p>

    ${input.membershipId ? `
    <div style="background-color: #0F172A; color: #ffffff; border-radius: 10px; padding: 16px 20px; text-align: center; margin: 24px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 3px;">Membership ID</div>
      <div style="font-size: 22px; font-family: monospace; font-weight: bold; color: #F59E0B;">${escapeHtml(input.membershipId)}</div>
      <div style="font-size: 12px; color: #CBD5E1; margin-top: 3px;">Tier 3: Strategic Leader</div>
    </div>
    ` : ''}

    {/* What changes in Tier 3 */}
    <div style="background-color: #f8fafc; border-left: 4px solid #047857; border-radius: 0 8px 8px 0; padding: 18px 20px; margin: 24px 0;">
      <h2 style="font-size: 16px; font-weight: bold; color: #064e3b; margin: 0 0 10px;">
        What changes in Tier 3?
      </h2>
      <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 12px;">
        As a <strong>Strategic Leader (Operational Contributor)</strong>, you will play an active role in driving our mission directly through leadership and structure.
      </p>
      <div style="font-size: 14px; color: #1e293b; line-height: 1.6;">
        <strong>Your core responsibilities in Tier 3 will be to:</strong>
        <ul style="margin: 6px 0 0; padding-left: 20px;">
          <li style="margin-bottom: 6px;">Actively participate in functional sub-committees delivering on your assigned monthly tasks.</li>
          <li>Maintain a 70% attendance rate for sub-committee meetings and strategic sessions.</li>
        </ul>
      </div>
    </div>

    {/* Next Steps */}
    <div style="margin: 28px 0;">
      <h2 style="font-size: 17px; font-weight: bold; color: #0f172a; margin: 0 0 16px; border-bottom: 2px solid #F59E0B; padding-bottom: 6px; display: inline-block;">
        Next Steps:
      </h2>

      {/* 1. Membership fee */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Membership fee</strong> — click here to pay your updated membership fee. For strategic leaders, fees are set at a minimum of <strong>NGN 250,000</strong> and a maximum of <strong>NGN 300,000</strong>.
        </p>
        <div>
          <a href="${paymentUrl}" style="background-color: #005BBB; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Pay Tier 3 Membership Fee
          </a>
        </div>
      </div>

      {/* 2. Membership card */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Membership card</strong> — once your payment is processed, you will be issued your renewed DRAI membership card. You can store this card on your device and print a hard copy.
        </p>
        <div>
          <a href="${cardUrl}" style="background-color: #F59E0B; color: #000000; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Access / Download Renewed Membership Card
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">
          💡 <em>Tip: Click "Download Card" for a digital image on your phone, or "Print / PDF" for a physical ID badge.</em>
        </p>
      </div>

      {/* 3. Tier 3 Leadership Group */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Joining the Tier 3 Leadership Group:</strong> If you were not automatically routed to our tier 3 community, click here to access your exclusive leadership hub and connect with fellow Strategic Leaders.
        </p>
        <div>
          <a href="${whatsappUrl}" style="background-color: #25D366; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Join Tier 3 Leadership WhatsApp Hub
          </a>
        </div>
      </div>

      {/* 4. Sub-Committee Selection */}
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
          <strong>Sub-Committee Selection:</strong> Please go through the responsibilities of the different groups here and select your operational area of interest.
        </p>
        <div>
          <a href="${subCommitteesUrl}" style="background-color: #0F172A; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
            👉 Select Your Sub-Committee
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
      Thank you for stepping into operational leadership to help sustain and grow our movement.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a;">The DRAI Executive Leadership &amp; Admin Team</p>
      <p style="margin: 2px 0 0; color: #047857; font-weight: 600;">Doing Right Awareness Initiative</p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Dear ${input.fullName.trim()},\n\n` +
    `Your active participation as a Movement Champion (Tier 2) has made a vital impact on our community. Thanks to your outreach efforts, digital publishing, and community engagement, our vision is stronger than ever.\n\n` +
    `Having met and exceeded your Tier 2 outreach milestones you have unlocked your Pathway to Tier 3: Strategic Leader!\n\n` +
    `What changes in Tier 3?\n\n` +
    `As a Strategic Leader (Operational Contributor), you will play an active role in driving our mission directly through leadership and structure.\n\n` +
    `Your core responsibilities in Tier 3 will be to:\n` +
    `- Actively participate in functional sub-committees delivering on your assigned monthly tasks.\n` +
    `- Maintain a 70% attendance rate for sub-committee meetings and strategic sessions.\n\n` +
    `Next Steps:\n\n` +
    `1. Membership fee - click here to pay your updated membership fee. For strategic leaders, fees are set at a minimum of NGN 250,000 and a maximum of NGN 300,000: ${paymentUrl}\n\n` +
    `2. Membership card - once your payment is processed, you will be issued your renewed DRAI membership card: ${cardUrl}\n\n` +
    `3. Joining the tier 3 Leadership Group: If you were not automatically routed to our tier 3 community, click here to access your exclusive leadership hub and connect with fellow Strategic Leaders: ${whatsappUrl}\n\n` +
    `4. Sub-Committee Selection: Please go through the responsibilities of the different groups here (${subCommitteesUrl}) and select your operational area of interest.\n\n` +
    (input.customNotes ? `Message from Leadership:\n${input.customNotes}\n\n` : '') +
    `Thank you for stepping into operational leadership to help sustain and grow our movement.\n\n` +
    `Kind regards,\n` +
    `The DRAI Executive Leadership & Admin Team\n` +
    `Doing Right Awareness Initiative`;

  return { subject, html, text };
}

/** Email sent when an admin advances a member to a higher tier. */
export function tierTransitionEmail(input: TierTransitionInput): ComposedEmail {
  if (input.toTier === 'tier_2') {
    return tier2AdvancementEmail(input);
  }
  return tier3AdvancementEmail(input);
}

export interface DonorInquiryInput {
  fullName: string;
  paymentPortalUrl?: string;
}

/**
 * Template responding to individuals or organizations who select/click the "Donate" tab.
 */
export function donorInquiryEmail({ fullName, paymentPortalUrl }: DonorInquiryInput): ComposedEmail {
  const name = escapeHtml(fullName.trim() || 'Supporter');
  const portalUrl = paymentPortalUrl || 'https://doright.ng/pay?purpose=donation';

  const subject = 'Thank you for your interest in supporting Doing Right Awareness Initiative (DRAI)';

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you for reaching out and for your desire to support the <strong>Doing Right Awareness Initiative</strong> also known as <strong>Do-Right</strong>! We are truly grateful for your contribution in advancing our mission to promote ethical leadership, social responsibility, and integrity across our communities.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Your financial support directly enables us to fund our ongoing community projects, youth outreach campaigns, and educational initiatives.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65; margin-bottom: 8px;">
      Below are our official banking details for local transfers:
    </p>

    <div style="background-color: #0F172A; color: #ffffff; border-radius: 10px; padding: 20px 24px; margin: 20px 0;">
      <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #F59E0B; margin-bottom: 12px;">
        Official Banking Details
      </div>
      <div style="font-size: 14px; margin-bottom: 6px;">
        <span style="color: #94a3b8;">Account Name:</span> <strong>DOING RIGHT AWARENESS INITIATIVE</strong>
      </div>
      <div style="font-size: 14px; margin-bottom: 6px;">
        <span style="color: #94a3b8;">Bank Name:</span> <strong>Guaranty Trust Bank [GTB]</strong>
      </div>
      <div style="font-size: 14px; margin-bottom: 6px;">
        <span style="color: #94a3b8;">Account Number (NGN):</span> <strong style="font-family: monospace; font-size: 17px; color: #F59E0B; letter-spacing: 1px;">0694857871</strong>
      </div>
      <div style="font-size: 14px;">
        <span style="color: #94a3b8;">Account Type:</span> <strong>Corporate Account</strong>
      </div>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin: 20px 0;">
      <p style="font-size: 14px; color: #334155; margin: 0 0 10px; line-height: 1.55;">
        <em>(Optional – For payment using our third-party gateway)</em><br>
        Click on this link to redirect to our payment portal:
      </p>
      <div>
        <a href="${portalUrl}" style="background-color: #005BBB; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
          👉 Open DoRight Payment Portal
        </a>
      </div>
    </div>

    <div style="background-color: #fffbeb; border-left: 4px solid #F59E0B; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 22px 0;">
      <div style="font-size: 14px; font-weight: bold; color: #92400e; margin-bottom: 6px;">
        Important Note Regarding Confirmation:
      </div>
      <p style="font-size: 13px; color: #78350f; margin: 0 0 8px; line-height: 1.55;">
        Once you have completed your transfer, please reply to this email or send payment confirmation / receipt to <a href="mailto:admin@doright.ng" style="color: #005BBB; font-weight: bold;">admin@doright.ng</a> with the following details:
      </p>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #78350f; line-height: 1.55;">
        <li>Full Name / Organization Name (for tax receipt and acknowledgment)</li>
        <li>Transaction Date &amp; Reference Number</li>
        <li>Specific Program / Campaign (Optional): If you would like your donation directed toward a specific initiative (e.g., Mentorship program, Workshops, Community Advocacy, After School Training etc.).</li>
      </ul>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      If you require an official invoice, formal tax-deductible receipt, or wish to discuss long-term sponsorship or partnership opportunities, please let us know by responding to this email and we will be delighted to collaborate with you.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you once again for standing with us to champion positive change.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 15px;">Pastor Wale Adefarasin</p>
      <p style="margin: 2px 0 0; color: #005BBB; font-weight: 600;">Doing Right Awareness Initiative (DRAI)</p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Dear ${fullName.trim() || 'Supporter'},\n\n` +
    `Thank you for reaching out and for your desire to support the Doing Right Awareness Initiative also known as Do-Right! We are truly grateful for your contribution in advancing our mission to promote ethical leadership, social responsibility, and integrity across our communities.\n\n` +
    `Your financial support directly enables us to fund our ongoing community projects, youth outreach campaigns, and educational initiatives.\n\n` +
    `Below are our official banking details for local transfers:\n\n` +
    `Official Banking Details\n` +
    `Account Name: DOING RIGHT AWARENESS INITIATIVE\n` +
    `Bank Name: Guaranty Trust Bank [GTB]\n` +
    `Account Number (NGN): 0694857871\n` +
    `Account Type: Corporate Account\n\n` +
    `(Optional – For payment using our third-party gateway)\n` +
    `Click on this link to redirect to our payment portal – 👉 ${portalUrl}\n\n` +
    `Important Note Regarding Confirmation:\n` +
    `Once you have completed your transfer, please reply to this email or send payment confirmation /receipt to admin@doright.ng with the following details:\n\n` +
    `- Full Name / Organization Name (for tax receipt and acknowledgment)\n` +
    `- Transaction Date & Reference Number\n` +
    `- Specific Program / Campaign (Optional): If you would like your donation directed toward a specific initiative (e.g., Mentorship program, Workshops, Community Advocacy, After School Training etc.).\n\n` +
    `If you require an official invoice, formal tax-deductible receipt, or wish to discuss long-term sponsorship or partnership opportunities, please let us know by responding to this email and we will be delighted to collaborate with you.\n\n` +
    `Thank you once again for standing with us to champion positive change.\n\n` +
    `Kind regards,\n\n` +
    `Pastor Wale Adefarasin\n` +
    `Doing Right Awareness Initiative (DRAI)`;

  return { subject, html, text };
}

export interface DonorContributionAcknowledgementInput {
  fullName: string;
  amount?: string | number;
}

/**
 * Template response thanking donors for their financial contributions.
 */
export function donorContributionAcknowledgementEmail({
  fullName,
  amount,
}: DonorContributionAcknowledgementInput): ComposedEmail {
  const name = escapeHtml(fullName.trim() || 'Supporter');
  const amountStr = amount ? ` of <strong>${typeof amount === 'number' ? `₦${amount.toLocaleString()}` : escapeHtml(String(amount))}</strong>` : '';
  const plainAmountStr = amount ? ` of ${typeof amount === 'number' ? `₦${amount.toLocaleString()}` : String(amount)}` : '';

  const subject = 'Thank you for your generous contribution to the Doing Right Awareness Initiative (DRAI)!';

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      On behalf of the entire team at the <strong>Doing Right Awareness Initiative</strong> also known as <strong>Do-Right</strong>! I want to express our deepest gratitude for your generous donation${amountStr}.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Your support helps us promote integrity, accountability, and civic responsibility. Because of you, we can drive grassroots campaigns, host educational workshops, and empower young leaders to champion ethical leadership.
    </p>

    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0;">
      <div style="font-size: 14px; font-weight: bold; color: #166534; margin-bottom: 8px;">
        Your Impact:
      </div>
      <p style="font-size: 13px; color: #14532d; margin: 0 0 6px; line-height: 1.55;">
        With your help, we are continuing to:
      </p>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #14532d; line-height: 1.55;">
        <li>Expand our school mentorship projects and youth integrity workshops.</li>
        <li>Run grassroots community campaigns focused on transparency and civic pride.</li>
        <li>Advocate for sustainable policy reform and civic engagement.</li>
      </ul>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      We are truly honored to have you as a partner in this movement toward building a more just and accountable society.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      We will keep you updated on the progress of our programs and the difference your contribution is making. In the meantime, feel free to visit our website at <a href="https://doright.ng" style="color: #005BBB; font-weight: bold;">www.doright.ng</a> or follow us on our social channels (<a href="https://instagram.com/dorightng" style="color: #005BBB;">@dorightng</a>) to see our latest activities.
    </p>

    <p style="font-size: 14px; color: #475569; line-height: 1.6; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
      📞 You can also reach out to us on <strong>+ 234 912 339 9968</strong> or <a href="mailto:admin@doright.ng" style="color: #005BBB; font-weight: bold;">admin@doright.ng</a>
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you once again for standing with us and doing right.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 15px;">Pastor Wale Adefarasin</p>
      <p style="margin: 2px 0 0; color: #005BBB; font-weight: 600;">Doing Right Awareness Initiative (DRAI)</p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Dear ${fullName.trim() || 'Supporter'},\n\n` +
    `On behalf of the entire team at the Doing Right Awareness Initiative also known as Do-Right! I want to express our deepest gratitude for your generous donation${plainAmountStr}.\n\n` +
    `Your support helps us promote integrity, accountability, and civic responsibility. Because of you, we can drive grassroots campaigns, host educational workshops, and empower young leaders to champion ethical leadership.\n\n` +
    `Your Impact:\n` +
    `With your help, we are continuing to:\n` +
    `- Expand our school mentorship projects and youth integrity workshops.\n` +
    `- Run grassroots community campaigns focused on transparency and civic pride.\n` +
    `- Advocate for sustainable policy reform and civic engagement.\n\n` +
    `We are truly honored to have you as a partner in this movement toward building a more just and accountable society.\n\n` +
    `We will keep you updated on the progress of our programs and the difference your contribution is making. In the meantime, feel free to visit our website at www.doright.ng or follow us on our social channels to see our latest activities.\n\n` +
    `You can also reach out to us on + 234 912 339 9968 or admin@doright.ng\n\n` +
    `Thank you once again for standing with us and doing right.\n\n` +
    `Kind regards,\n\n` +
    `Pastor Wale Adefarasin\n` +
    `Doing Right Awareness Initiative (DRAI)`;

  return { subject, html, text };
}

export interface PartnershipInquiryInput {
  fullName: string;
  organizationName?: string | null;
}

/**
 * Template email for potential partners (NGOs, corporate organizations, community groups, educational institutions, or sponsors) who click the "Partner" tab.
 */
export function partnershipInquiryEmail({
  fullName,
  organizationName,
}: PartnershipInquiryInput): ComposedEmail {
  const partnerName = escapeHtml(
    organizationName ? `${fullName.trim()} / ${organizationName.trim()}` : fullName.trim() || 'Partner'
  );

  const subject = 'Partnering with Doing Right Awareness Initiative (DRAI) – Collaboration Opportunities';

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${partnerName}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Thank you for your interest in partnering with the <strong>Doing Right Awareness Initiative</strong> also known as <strong>Do-Right</strong>! We are thrilled to connect with like-minded individuals and organizations dedicated to fostering ethical leadership, civic engagement, and positive social impact in our communities.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      At Do-Right, we believe that meaningful, lasting change is driven through strategic collaboration. Whether through joint community projects, educational workshops, advocacy campaigns, or resource sharing, we welcome partnerships that align with our core values and vision.
    </p>

    <div style="margin: 26px 0 20px;">
      <h3 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 10px; border-bottom: 2px solid #F59E0B; padding-bottom: 5px; display: inline-block;">
        How We Can Partner
      </h3>
      <p style="font-size: 14px; color: #475569; margin: 8px 0 12px;">Depending on your interests and goals, potential collaboration avenues include:</p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 10px;">
        <strong style="color: #005BBB; font-size: 14px;">• Program &amp; Event Co-hosting:</strong>
        <span style="color: #334155; font-size: 13px;"> Partnering on youth &amp; young adult programs, community outreach initiatives, webinars &amp; other virtual interactive sessions.</span>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 10px;">
        <strong style="color: #005BBB; font-size: 14px;">• Corporate Social Responsibility (CSR):</strong>
        <span style="color: #334155; font-size: 13px;"> Supporting or co-branding specific social impact campaigns and community development projects.</span>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 10px;">
        <strong style="color: #005BBB; font-size: 14px;">• Sponsorship &amp; In-Kind Support:</strong>
        <span style="color: #334155; font-size: 13px;"> Providing financial, logistical, or material resources for targeted initiatives.</span>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
        <strong style="color: #005BBB; font-size: 14px;">• Knowledge &amp; Resource Sharing:</strong>
        <span style="color: #334155; font-size: 13px;"> Combining expertise, networks, and platforms to amplify shared advocacy goals.</span>
      </div>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid #005BBB; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0;">
      <div style="font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 6px;">
        Next Steps
      </div>
      <p style="font-size: 13px; color: #1e3a8a; margin: 0 0 8px; line-height: 1.55;">
        To help us understand how we can best work together, please let us know:
      </p>
      <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
        <li><strong>Brief Introduction:</strong> A quick summary of your organization/initiative and core areas of focus.</li>
        <li><strong>Partnership Vision:</strong> Any specific project, campaign, or collaboration idea you have in mind.</li>
        <li><strong>Availability for a Discovery Meeting:</strong> Your preferred dates and times for a brief virtual or in-person meeting to discuss possibilities.</li>
      </ol>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Alternatively, you can share any relevant proposal or presentation materials by replying directly to this email.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      We look forward to exploring how we can combine our strengths to create greater impact together.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 15px;">Oluwatoyin Olayemi</p>
      <p style="margin: 2px 0 0; color: #005BBB; font-weight: 600;">Doing Right Awareness Initiative (DRAI)</p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Dear ${organizationName ? `${fullName.trim()} / ${organizationName.trim()}` : fullName.trim() || 'Partner'},\n\n` +
    `Thank you for your interest in partnering with the Doing Right Awareness Initiative also known as Do-Right! We are thrilled to connect with like-minded individuals and organizations dedicated to fostering ethical leadership, civic engagement, and positive social impact in our communities.\n\n` +
    `At Do-Right, we believe that meaningful, lasting change is driven through strategic collaboration. Whether through joint community projects, educational workshops, advocacy campaigns, or resource sharing, we welcome partnerships that align with our core values and vision.\n\n` +
    `How We Can Partner\n\n` +
    `Depending on your interests and goals, potential collaboration avenues include:\n` +
    `- Program & Event Co-hosting: Partnering on youth & young adult programs, community outreach initiatives, webinars & other virtual interactive sessions.\n` +
    `- Corporate Social Responsibility (CSR): Supporting or co-branding specific social impact campaigns and community development projects.\n` +
    `- Sponsorship & In-Kind Support: Providing financial, logistical, or material resources for targeted initiatives.\n` +
    `- Knowledge & Resource Sharing: Combining expertise, networks, and platforms to amplify shared advocacy goals.\n\n` +
    `Next Steps\n\n` +
    `To help us understand how we can best work together, please let us know:\n` +
    `1. Brief Introduction: A quick summary of your organization/initiative and core areas of focus.\n` +
    `2. Partnership Vision: Any specific project, campaign, or collaboration idea you have in mind.\n` +
    `3. Availability for a Discovery Meeting: Your preferred dates and times for a brief virtual or in-person meeting to discuss possibilities.\n\n` +
    `Alternatively, you can share any relevant proposal or presentation materials by replying directly to this email.\n\n` +
    `We look forward to exploring how we can combine our strengths to create greater impact together.\n\n` +
    `Kind regards,\n\n` +
    `Oluwatoyin Olayemi\n` +
    `Doing Right Awareness Initiative (DRAI)`;

  return { subject, html, text };
}

export interface AdvocacyCardReminderInput {
  fullName: string;
  membershipId?: string | null;
  membershipCardUrl?: string | null;
  tier?: string | null;
}

/**
 * 1. Advocacy Card Download Reminder
 * Reminds Tier 1 advocates to access, attach photo, and download/print their virtual card.
 */
export function advocacyCardReminderEmail({
  fullName,
  membershipId,
  membershipCardUrl,
  tier = 'tier_1',
}: AdvocacyCardReminderInput): ComposedEmail {
  const name = escapeHtml(fullName.trim() || 'Advocate');
  const cardUrl =
    membershipCardUrl ||
    (membershipId
      ? `https://doright.ng/membership-card?id=${encodeURIComponent(membershipId)}`
      : 'https://doright.ng/membership-card');
  const tierLabel = tier === 'tier_2' ? 'Tier 2' : tier === 'tier_3' ? 'Tier 3' : 'Tier 1';

  const subject = 'Have you claimed your Virtual Advocacy Card? 💳';

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Hi <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Showcase your commitment! As a ${tierLabel} member, your official virtual Advocacy Card is ready for you to access and download.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${cardUrl}" style="background-color: #F59E0B; color: #000000; font-size: 15px; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        👉 Click Here to Access Your Advocacy Card
      </a>
    </div>

    ${membershipId ? `
    <div style="background-color: #0F172A; color: #ffffff; border-radius: 8px; padding: 12px 16px; text-align: center; margin: 16px 0 24px;">
      <span style="font-size: 12px; color: #94A3B8; text-transform: uppercase;">Membership ID: </span>
      <span style="font-size: 15px; font-family: monospace; font-weight: bold; color: #F59E0B;">${escapeHtml(membershipId)}</span>
    </div>
    ` : ''}

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      You can save it to your phone or print it out to carry with you. Don&#39;t forget to attach your photo to make it official!
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 26px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 15px;">DRAI Admin Team</p>
      <p style="margin: 2px 0 0; color: #005BBB;">
        <a href="mailto:admin@doright.ng" style="color: #005BBB; text-decoration: none;">admin@doright.ng</a> | <a href="https://doright.ng" style="color: #005BBB; text-decoration: none;">www.doright.ng</a>
      </p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Hi ${fullName.trim()},\n\n` +
    `Showcase your commitment! As a ${tierLabel} member, your official virtual Advocacy Card is ready for you to access and download.\n\n` +
    `[Click Here to Access Your Advocacy Card]: ${cardUrl}\n\n` +
    (membershipId ? `Membership ID: ${membershipId}\n\n` : '') +
    `You can save it to your phone or print it out to carry with you. Don't forget to attach your photo to make it official!\n\n` +
    `Kind regards,\n` +
    `DRAI Admin Team\n` +
    `admin@doright.ng | www.doright.ng`;

  return { subject, html, text };
}

export interface MonthlyImpactStoryReminderInput {
  fullName: string;
  membershipId?: string | null;
  whatsappGroupUrl?: string | null;
  customMessage?: string | null;
}

/**
 * 2. Monthly Impact Story Reminder
 * Prompts Tier 1 Personal Advocates to submit their monthly story on the community group or to admin.
 */
export function monthlyImpactStoryReminderEmail({
  fullName,
  membershipId,
  whatsappGroupUrl,
  customMessage,
}: MonthlyImpactStoryReminderInput): ComposedEmail {
  const name = escapeHtml(fullName.trim() || 'Advocate');
  const communityUrl =
    whatsappGroupUrl || 'https://chat.whatsapp.com/CuwrXFIM8Ry2DZUImaHIxn?s=cl&p=i&ilr=4&amv=1';

  const subject = 'Share Your Story: Living the Values this Month ✨';

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Hi <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      As a Tier 1 Personal Advocate, your daily actions pave the way for real change! We’d love to hear how you’ve been modeling our core values this past month.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Please take 2 minutes to submit your monthly impact story on the community group.
    </p>

    <div style="text-align: center; margin: 26px 0;">
      <a href="${communityUrl}" style="background-color: #25D366; color: #ffffff; font-size: 15px; font-weight: bold; padding: 13px 26px; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        💬 Share on Community WhatsApp Group
      </a>
    </div>

    ${customMessage ? `
    <div style="background-color: #eff6ff; border-left: 4px solid #005BBB; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 18px 0;">
      <div style="font-size: 12px; font-weight: bold; color: #1e40af; text-transform: uppercase; margin-bottom: 3px;">Message from Admin:</div>
      <div style="font-size: 14px; color: #1e3a8a;">${escapeHtml(customMessage)}</div>
    </div>
    ` : ''}

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 18px; margin: 20px 0;">
      <p style="font-size: 14px; color: #334155; margin: 0; line-height: 1.6;">
        You can also share your story directly with the admin team on <strong>+ 234 912 339 9968</strong> or <a href="mailto:admin@doright.ng" style="color: #005BBB; font-weight: 600;">admin@doright.ng</a>
      </p>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Your stories inspire our entire community. Thank you for continuing to lead by example!
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 26px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 15px;">DRAI Admin Team</p>
      <p style="margin: 2px 0 0; color: #005BBB;">
        <a href="mailto:admin@doright.ng" style="color: #005BBB; text-decoration: none;">admin@doright.ng</a> | <a href="https://doright.ng" style="color: #005BBB; text-decoration: none;">www.doright.ng</a>
      </p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Hi ${fullName.trim()},\n\n` +
    `As a Tier 1 Personal Advocate, your daily actions pave the way for real change! We’d love to hear how you’ve been modeling our core values this past month.\n\n` +
    `Please take 2 minutes to submit your monthly impact story on the community group:\n${communityUrl}\n\n` +
    (customMessage ? `Note from Admin: ${customMessage}\n\n` : '') +
    `You can also share your story directly with the admin team on + 234 912 339 9968 or admin@doright.ng\n\n` +
    `Your stories inspire our entire community. Thank you for continuing to lead by example!\n\n` +
    `Kind regards,\n` +
    `DRAI Admin Team\n` +
    `admin@doright.ng | www.doright.ng`;

  return { subject, html, text };
}

export interface AnnualRenewalCheckinInput {
  fullName: string;
  membershipId?: string | null;
  completionRate?: string | number | null;
  submittedCount?: number | null;
  customNotes?: string | null;
}

/**
 * 3. Annual Renewal & Engagement Check-in
 * Celebrates 1-year advocacy anniversary, checks activity log, reviews completion rate, and introduces Tier 2 progression.
 */
export function annualRenewalCheckinEmail({
  fullName,
  membershipId,
  completionRate,
  submittedCount,
  customNotes,
}: AnnualRenewalCheckinInput): ComposedEmail {
  const name = escapeHtml(fullName.trim() || 'Advocate');
  const rateText =
    completionRate !== undefined && completionRate !== null
      ? `${completionRate}%`
      : submittedCount !== undefined && submittedCount !== null
      ? `${Math.round((submittedCount / 12) * 100)}% (${submittedCount}/12 stories)`
      : null;

  const subject = 'Your Advocacy Year in Review – Time to Renew! 🌟';

  const html = wrapHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Hi <strong>${name}</strong>,</p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Your membership due date is coming up in one month, and we want to celebrate everything you’ve accomplished as a Personal Advocate over the past year!
    </p>

    ${rateText ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 14px; color: #475569; font-weight: 600;">Your Annual Impact Story Completion Rate:</span>
      <strong style="font-size: 16px; color: #047857;">${rateText}</strong>
    </div>
    ` : ''}

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      Please ensure your activity log is up to date. Reach out to admin to get your activity log.
    </p>

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      You can also review your completion rate with the admin team.
    </p>

    <div style="background-color: #fffbeb; border-left: 4px solid #F59E0B; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 22px 0;">
      <p style="font-size: 14px; color: #92400e; margin: 0; line-height: 1.55;">
        <strong>Quick reminder:</strong> Fulfilling your core responsibilities keep your membership active automatically.
      </p>
    </div>

    ${customNotes ? `
    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px 16px; margin: 18px 0; font-size: 14px; color: #334155;">
      <strong>Admin Notes:</strong> ${escapeHtml(customNotes)}
    </div>
    ` : ''}

    <p style="font-size: 15px; color: #334155; line-height: 1.65;">
      If you have any questions about your activity status or moving to Tier 2, just reply to this message!
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 26px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px;">Kind regards,</p>
      <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 15px;">DRAI Admin Team</p>
      <p style="margin: 2px 0 0; color: #005BBB;">
        <a href="mailto:admin@doright.ng" style="color: #005BBB; text-decoration: none;">admin@doright.ng</a> | <a href="https://doright.ng" style="color: #005BBB; text-decoration: none;">www.doright.ng</a>
      </p>
    </div>
  `);

  const text =
    `Subject: ${subject}\n\n` +
    `Hi ${fullName.trim()},\n\n` +
    `Your membership due date is coming up in one month, and we want to celebrate everything you’ve accomplished as a Personal Advocate over the past year!\n\n` +
    (rateText ? `Your Annual Impact Story Completion Rate: ${rateText}\n\n` : '') +
    `Please ensure your activity log is up to date. Reach out to admin to get your activity log.\n\n` +
    `You can also review your completion rate with the admin team.\n\n` +
    `Quick reminder: Fulfilling your core responsibilities keep your membership active automatically.\n\n` +
    (customNotes ? `Admin Notes: ${customNotes}\n\n` : '') +
    `If you have any questions about your activity status or moving to Tier 2, just reply to this message!\n\n` +
    `Kind regards,\n` +
    `DRAI Admin Team\n` +
    `admin@doright.ng | www.doright.ng`;

  return { subject, html, text };
}

