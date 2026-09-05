import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase server configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Ensure bucket exists and has public read access
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasBucket = buckets?.some((b: any) => b.name === "lead-photos" || b.id === "lead-photos");
      if (!hasBucket) {
        await supabase.storage.createBucket("lead-photos", {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      }
    } catch (bucketErr) {
      console.warn("submit-lead: bucket check warning", bucketErr);
    }

    // Parse formData or JSON payload
    const contentType = req.headers.get("content-type") || "";
    let action = "";
    let fullName = "";
    let email = "";
    let phone: string | null = null;
    let membershipId: string | null = null;
    let interest: string | null = null;
    let message: string | null = null;
    let subCommitteeId: string | null = null;
    let subCommitteeName: string | null = null;
    let photoBuffer: Uint8Array | null = null;
    let photoExt = "jpg";
    let photoMime = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      action = formData.get("action")?.toString() || "";
      fullName = formData.get("fullName")?.toString() || "";
      email = formData.get("email")?.toString() || "";
      phone = formData.get("phone")?.toString() || null;
      membershipId = formData.get("membershipId")?.toString() || null;
      interest = formData.get("interest")?.toString() || null;
      message = formData.get("message")?.toString() || null;
      subCommitteeId = formData.get("subCommitteeId")?.toString() || null;
      subCommitteeName = formData.get("subCommitteeName")?.toString() || null;

      const file = formData.get("photo");
      if (file instanceof File) {
        photoBuffer = new Uint8Array(await file.arrayBuffer());
        photoExt = file.name.split(".").pop() || "jpg";
        photoMime = file.type || "image/jpeg";
      }
    } else {
      const body = await req.json();
      action = body.action || "";
      fullName = body.fullName || "";
      email = body.email || "";
      phone = body.phone || null;
      membershipId = body.membershipId || null;
      interest = body.interest || null;
      message = body.message || null;
      subCommitteeId = body.subCommitteeId || null;
      subCommitteeName = body.subCommitteeName || null;

      if (body.photoBase64) {
        const base64Data = body.photoBase64.replace(/^data:image\/\w+;base64,/, "");
        const binaryString = atob(base64Data);
        photoBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          photoBuffer[i] = binaryString.charCodeAt(i);
        }
        photoExt = body.photoExt || "jpg";
        photoMime = body.photoMime || "image/jpeg";
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;
    const cleanMembershipId = (membershipId || "").trim().toUpperCase();
    const extractDigits = (val: string | null) => (val ? val.replace(/\D/g, "") : "");
    const inputPhoneDigits = extractDigits(cleanPhone);
    const inputPhoneSuffix = inputPhoneDigits.length >= 10 ? inputPhoneDigits.slice(-10) : inputPhoneDigits;

    // Action 1: Pre-flight duplicate registration check
    if (action === "check_duplicate") {
      if (cleanEmail) {
        const { data: existingEmail } = await supabase
          .from("leads")
          .select("id, email, full_name")
          .ilike("email", cleanEmail)
          .limit(1);

        if (existingEmail && existingEmail.length > 0) {
          return new Response(
            JSON.stringify({
              isDuplicate: true,
              duplicateField: "email",
              message: "An advocate with this email address is already registered. Each member can only join once."
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (inputPhoneDigits && inputPhoneDigits.length >= 7) {
        const { data: leadsWithPhone } = await supabase
          .from("leads")
          .select("id, phone")
          .not("phone", "is", null);

        const dup = leadsWithPhone?.find((item: any) => {
          if (!item.phone) return false;
          const stored = extractDigits(item.phone);
          if (stored.length >= 10 && inputPhoneDigits.length >= 10) {
            return stored.slice(-10) === inputPhoneSuffix;
          }
          return stored.length >= 7 && stored === inputPhoneDigits;
        });

        if (dup) {
          return new Response(
            JSON.stringify({
              isDuplicate: true,
              duplicateField: "phone",
              message: "An advocate with this phone number is already registered. Each member can only join once."
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ isDuplicate: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action 2: Verify Tier 3 Status & Join Sub-Committee (Exclusively for Tier 3 Strategic Leaders)
    if (action === "verify_tier3" || action === "join_subcommittee") {
      if (!cleanMembershipId && !cleanEmail) {
        return new Response(
          JSON.stringify({
            eligible: false,
            error: "MISSING_CREDENTIALS",
            message: "Membership ID and Email address are required to verify sub-committee eligibility."
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Query lead using service role (bypasses RLS)
      let query = supabase
        .from("leads")
        .select("id, full_name, email, phone, membership_id, tier, sub_committee_id, admin_notes");

      if (cleanMembershipId && cleanEmail) {
        query = query.or(`membership_id.ilike.${cleanMembershipId},email.ilike.${cleanEmail}`);
      } else if (cleanMembershipId) {
        query = query.ilike("membership_id", cleanMembershipId);
      } else {
        query = query.ilike("email", cleanEmail);
      }

      const { data: matchedLeads, error: queryErr } = await query.limit(5);

      if (queryErr) {
        console.error("submit-lead: verify_tier3 query error", queryErr);
        return new Response(
          JSON.stringify({ eligible: false, error: "QUERY_FAILED", message: "Failed to verify membership status. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Exact match check (both membershipId AND email)
      let member = matchedLeads?.find(
        (l: any) =>
          l.membership_id?.trim().toUpperCase() === cleanMembershipId &&
          l.email?.trim().toLowerCase() === cleanEmail
      );

      if (!member && matchedLeads && matchedLeads.length > 0) {
        const matchById = matchedLeads.find((l: any) => l.membership_id?.trim().toUpperCase() === cleanMembershipId);
        const matchByEmail = matchedLeads.find((l: any) => l.email?.trim().toLowerCase() === cleanEmail);

        if (cleanMembershipId && matchById && !matchByEmail) {
          return new Response(
            JSON.stringify({
              eligible: false,
              error: "CREDENTIAL_MISMATCH",
              message: "The entered Email address does not match this Membership ID. Please check your credentials."
            }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (matchById) member = matchById;
        else if (matchByEmail) member = matchByEmail;
      }

      if (!member) {
        return new Response(
          JSON.stringify({
            eligible: false,
            error: "MEMBER_NOT_FOUND",
            message: "No active DRAI membership found matching this Membership ID and Email. Sub-committees are exclusively reserved for verified Tier 3 Strategic Leaders."
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check Tier: Sub-committees are ONLY for Tier 3 members
      const normalizedTier = (member.tier || "").toLowerCase().trim();
      const isTier3 = normalizedTier === "tier_3" || normalizedTier === "tier_3_strategic_leader" || normalizedTier.includes("tier_3");

      if (!isTier3) {
        const tierLabels: Record<string, string> = {
          tier_1: "Tier 1 (Personal Advocate)",
          tier_2: "Tier 2 (Movement Champion)",
        };
        const currentTierLabel = tierLabels[normalizedTier] || `Tier ${normalizedTier.replace('tier_', '') || '1'}`;

        return new Response(
          JSON.stringify({
            eligible: false,
            error: "NOT_TIER_3",
            currentTier: normalizedTier,
            currentTierLabel,
            member: {
              fullName: member.full_name,
              membershipId: member.membership_id,
              tier: member.tier
            },
            message: `Access Restricted: Sub-committees are exclusively for Tier 3 (Strategic Leaders). Your record indicates you are currently in ${currentTierLabel}. Sub-committees are not for everyone. To advance to Tier 3, please complete your tier requirements or contact admin@doright.ng.`
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Action: verify_tier3 only
      if (action === "verify_tier3") {
        return new Response(
          JSON.stringify({
            eligible: true,
            member: {
              id: member.id,
              fullName: member.full_name,
              email: member.email,
              phone: member.phone,
              membershipId: member.membership_id,
              tier: member.tier,
              subCommitteeId: member.sub_committee_id
            },
            message: "Eligibility confirmed! You are a verified Tier 3 Strategic Leader."
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Action: join_subcommittee
      if (action === "join_subcommittee") {
        if (!subCommitteeId) {
          return new Response(
            JSON.stringify({ error: "MISSING_COMMITTEE", message: "A sub-committee must be selected." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Safely resolve subCommitteeId to valid UUID if it is a slug
        let resolvedSubCommitteeUuid: string | null = null;
        const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

        if (isUuid(subCommitteeId)) {
          resolvedSubCommitteeUuid = subCommitteeId;
        } else {
          try {
            const { data: dbCommittees } = await supabase
              .from("sub_committees")
              .select("id, name");

            if (dbCommittees && dbCommittees.length > 0) {
              const query = (subCommitteeName || subCommitteeId || "").toLowerCase();
              const match = dbCommittees.find((c: any) => {
                const cName = c.name.toLowerCase();
                return (
                  cName === query ||
                  cName.includes(query) ||
                  query.includes(cName) ||
                  (query.includes("secretariat") && cName.includes("secretariat")) ||
                  (query.includes("finance") && cName.includes("fundraising")) ||
                  (query.includes("fundrais") && cName.includes("fundrais")) ||
                  (query.includes("communicat") && cName.includes("communicat")) ||
                  (query.includes("strategy") && cName.includes("strategy")) ||
                  (query.includes("community") && cName.includes("community"))
                );
              });
              if (match) {
                resolvedSubCommitteeUuid = match.id;
              }
            }
          } catch (resErr) {
            console.warn("Could not resolve committee UUID:", resErr);
          }
        }

        const noteEntry = `\n[Sub-Committee Joined: ${subCommitteeName || subCommitteeId} on ${new Date().toLocaleDateString('en-GB')}]`;
        const updatedNotes = member.admin_notes ? `${member.admin_notes}${noteEntry}` : noteEntry.trim();

        const updatePayload: Record<string, any> = {
          admin_notes: updatedNotes,
          updated_at: new Date().toISOString()
        };
        if (resolvedSubCommitteeUuid) {
          updatePayload.sub_committee_id = resolvedSubCommitteeUuid;
        }

        const { data: updatedLead, error: updateErr } = await supabase
          .from("leads")
          .update(updatePayload)
          .eq("id", member.id)
          .select()
          .single();

        if (updateErr) {
          console.error("submit-lead: join_subcommittee update error", updateErr);
          return new Response(
            JSON.stringify({ error: "UPDATE_FAILED", message: "Failed to update sub-committee record. Please try again." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Trigger welcome/notification email to info@doright.ng and member
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-lead-welcome-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              type: "INSERT",
              source: "sub_committee_page",
              record: {
                ...updatedLead,
                sub_committee_id: subCommitteeId,
                sub_committee_name: subCommitteeName,
                source: "sub_committee_page"
              },
            }),
          });
        } catch (emailErr) {
          console.warn("submit-lead: sub_committee notification email error", emailErr);
        }

        return new Response(
          JSON.stringify({
            success: true,
            lead: updatedLead,
            message: `Successfully joined ${subCommitteeName || 'the sub-committee'}!`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!fullName || !email) {
      return new Response(
        JSON.stringify({ error: "Full name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check 1: Duplicate Email Verification
    const { data: existingByEmail, error: emailCheckErr } = await supabase
      .from("leads")
      .select("id, email, full_name, phone, membership_id")
      .ilike("email", cleanEmail)
      .limit(1);

    if (existingByEmail && existingByEmail.length > 0) {
      console.warn("submit-lead: duplicate registration rejected by email", cleanEmail);
      return new Response(
        JSON.stringify({
          error: "DUPLICATE_REGISTRATION",
          duplicateField: "email",
          message: "An advocate with this email address is already registered. Each member can only join once. If you need assistance or want to access your membership card, please contact admin@doright.ng."
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check 2: Duplicate Phone Verification
    if (inputPhoneDigits && inputPhoneDigits.length >= 7) {
      const { data: leadsWithPhone, error: phoneCheckErr } = await supabase
        .from("leads")
        .select("id, email, full_name, phone, membership_id")
        .not("phone", "is", null);

      if (leadsWithPhone && leadsWithPhone.length > 0) {
        const duplicateLead = leadsWithPhone.find((item: any) => {
          if (!item.phone) return false;
          const stored = extractDigits(item.phone);
          if (stored.length >= 10 && inputPhoneDigits.length >= 10) {
            return stored.slice(-10) === inputPhoneSuffix;
          }
          return stored.length >= 7 && stored === inputPhoneDigits;
        });

        if (duplicateLead) {
          console.warn("submit-lead: duplicate registration rejected by phone", cleanPhone);
          return new Response(
            JSON.stringify({
              error: "DUPLICATE_REGISTRATION",
              duplicateField: "phone",
              message: "An advocate with this phone number is already registered. Each member can only join once. If you need assistance or want to access your membership card, please contact admin@doright.ng."
            }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // 1. Upload photo with Service Role
    let photoFilePath: string | null = null;
    let photoPublicUrl: string | null = null;
    if (photoBuffer && photoBuffer.length > 0) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${photoExt}`;
      const { error: uploadErr } = await supabase.storage
        .from("lead-photos")
        .upload(fileName, photoBuffer, {
          contentType: photoMime,
          upsert: true,
        });

      if (!uploadErr) {
        photoFilePath = fileName;
        const { data: urlData } = supabase.storage
          .from("lead-photos")
          .getPublicUrl(fileName);
        photoPublicUrl = urlData?.publicUrl || null;
      } else {
        console.error("submit-lead: storage upload error", uploadErr);
      }
    }

    // 2. Generate Membership ID & timestamp
    const fallbackMembershipId = `DRAI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const adminNotesLines: string[] = [];
    if (interest) adminNotesLines.push(`Interest: ${interest}`);
    if (message) adminNotesLines.push(`Message: ${message}`);
    const adminNotes = adminNotesLines.length > 0 ? adminNotesLines.join("\n") : null;

    // 3. Resolve subCommitteeId UUID if present
    let insertSubCommitteeUuid: string | null = null;
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
    if (subCommitteeId && isUuid(subCommitteeId)) {
      insertSubCommitteeUuid = subCommitteeId;
    } else if (subCommitteeId || subCommitteeName) {
      try {
        const { data: dbCommittees } = await supabase.from("sub_committees").select("id, name");
        if (dbCommittees && dbCommittees.length > 0) {
          const query = (subCommitteeName || subCommitteeId || "").toLowerCase();
          const match = dbCommittees.find((c: any) => {
            const cName = c.name.toLowerCase();
            return cName === query || cName.includes(query) || query.includes(cName);
          });
          if (match) insertSubCommitteeUuid = match.id;
        }
      } catch (e) {}
    }

    const leadInsertPayload: Record<string, any> = {
      full_name: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      photo_url: photoFilePath,
      sub_committee_id: insertSubCommitteeUuid || null,
      source: "website",
      tier: "tier_1",
      tier_1_at: now,
      membership_id: fallbackMembershipId,
      status: "new",
      admin_notes: adminNotes,
    };

    let insertedLead: any = null;
    const { data, error: insertError } = await supabase
      .from("leads")
      .insert(leadInsertPayload)
      .select()
      .single();

    if (insertError) {
      console.warn("submit-lead: retry without membership_id fallback", insertError);
      delete leadInsertPayload.membership_id;
      const { data: retryData, error: retryErr } = await supabase
        .from("leads")
        .insert(leadInsertPayload)
        .select()
        .single();

      if (retryErr) throw retryErr;
      insertedLead = retryData;
    } else {
      insertedLead = data;
    }

    // 4. Trigger Welcome Email
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-lead-welcome-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          type: "INSERT",
          record: insertedLead,
        }),
      });
    } catch (emailErr) {
      console.error("submit-lead: background welcome email trigger failed", emailErr);
    }

    return new Response(
      JSON.stringify({
        lead: {
          ...insertedLead,
          photo_public_url: photoPublicUrl,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("submit-lead: unhandled error", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to submit application" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
