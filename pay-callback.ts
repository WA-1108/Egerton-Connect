// Supabase Edge Function: pay-callback
// Safaricom calls this after the customer enters (or cancels) the M-Pesa PIN.
// When a payment succeeds, the credits from the pack are added to the buyer's balance.
// IMPORTANT: in the Supabase dashboard, switch OFF "Verify JWT" for this function,
// because Safaricom does not send a login token. The secret ?key=... in the address protects it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const accepted = () =>
  new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  const reqUrl = new URL(req.url);
  if (reqUrl.searchParams.get("key") !== Deno.env.get("CALLBACK_KEY")) {
    return new Response("forbidden", { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const cb = body?.Body?.stkCallback;
  if (!cb) return accepted();

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: pay } = await admin.from("payments").select("*").eq("checkout_id", cb.CheckoutRequestID).maybeSingle();
  if (!pay || pay.status !== "pending") return accepted(); // unknown or already handled

  // Customer cancelled, wrong PIN, no money, timeout, etc.
  if (cb.ResultCode !== 0) {
    await admin.from("payments").update({ status: "failed" }).eq("id", pay.id).eq("status", "pending");
    return accepted();
  }

  const items: { Name: string; Value?: string | number }[] = cb.CallbackMetadata?.Item ?? [];
  const get = (name: string) => items.find((i) => i.Name === name)?.Value;
  const paidAmount = Number(get("Amount"));
  const receipt = String(get("MpesaReceiptNumber") ?? "");

  // The amount paid must match the pack price
  if (paidAmount !== pay.amount) {
    await admin.from("payments").update({ status: "failed", receipt }).eq("id", pay.id).eq("status", "pending");
    return accepted();
  }

  // Mark paid. Only the first callback gets a row back, so a repeat cannot add credits twice.
  const { data: updated } = await admin
    .from("payments")
    .update({ status: "paid", receipt, paid_at: new Date().toISOString() })
    .eq("id", pay.id)
    .eq("status", "pending")
    .select();
  if (!updated || updated.length === 0) return accepted();

  // Add the credits. The ledger row is the record of the purchase.
  await admin.from("credit_ledger").insert({
    user_id: pay.user_id,
    delta: pay.credits,
    reason: "purchase",
    ref: pay.id,
  });

  return accepted();
});
