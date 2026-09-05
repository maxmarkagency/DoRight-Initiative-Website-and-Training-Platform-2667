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
    let interest: string | null = null;
    let message: string | null = null;
    let subCommitteeId: string | null = null;
    let photoBuffer: Uint8Array | null = null;
    let photoExt = "jpg";
    let photoMime = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      action = formData.get("action")?.toString() || "";
      fullName = formData.get("fullName")?.toString() || "";
      email = formData.get("email")?.toString() || "";
      phone = formData.get("phone")?.toString() || null;
      interest = formData.get("interest")?.toString() || null;
      message = formData.get("message")?.toString() || null;
      subCommitteeId = formData.get("subCommitteeId")?.toString() || null;

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
      interest = body.interest || null;
      message = body.message || null;
      subCommitteeId = body.subCommitteeId || null;

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
    const extractDigits = (val: string | null) => (val ? val.replace(/\D/g, "") : "");
    const inputPhoneDigits = extractDigits(cleanPhone);
    const inputPhoneSuffix = inputPhoneDigits.length >= 10 ? inputPhoneDigits.slice(-10) : inputPhoneDigits;

    // Support pre-flight duplicate check action
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

    // 3. Insert Lead Record
    const leadInsertPayload: Record<string, any> = {
      full_name: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      photo_url: photoFilePath,
      sub_committee_id: subCommitteeId || null,
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
