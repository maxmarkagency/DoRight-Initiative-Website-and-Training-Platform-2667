const testPayload = {
  type: "INSERT",
  table: "leads",
  record: {
    id: "test-debug-1",
    full_name: "DoRight Test Advocate",
    email: "test@doright.ng",
    membership_id: "DRAI-2026-9999",
    tier: "tier_1",
    source: "website"
  }
};

async function run() {
  console.log("Sending test request to send-lead-welcome-email...");
  try {
    const res = await fetch("https://jqekzavaerbxjzyeihvv.supabase.co/functions/v1/send-lead-welcome-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testPayload)
    });
    console.log("Status:", res.status, res.statusText);
    const body = await res.text();
    console.log("Response Body:", body);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
