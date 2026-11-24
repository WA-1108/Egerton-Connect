// Supabase Edge Function: pay-start
// Starts an M-Pesa STK Push to buy a pack of chat credits.
// Needs these secrets (see README): MPESA_ENV, MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET,
// MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_TX_TYPE, MPESA_TILL (till only), CALLBACK_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// 0712345678, 712345678, +254712345678 and 254712345678 all become 254712345678
function normalizePhone(input: string): string | null {
  const d = String(input ?? "").replace(/\D/g, "");
  let n = d;
  if (d.startsWith("254")) n = d;
  else if (d.startsWith("0")) n = "254" + d.slice(1);
  else if (d.length === 9) n = "254" + d;
  return /^254[17]\d{8}$/.test(n) ? n : null;
}

// Daraja wants YYYYMMDDHHmmss in Nairobi time
function timestamp(): string {
  const t = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}${p(t.getUTCHours())}${p(t.getUTCMinutes())}${p(t.getUTCSeconds())}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authed = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: u } = await authed.auth.getUser();
    if (!u?.user) return json({ ok: false, error: "Please log in again." }, 401);

    const { pack_id, phone } = await req.json();
    const { data: cfg } = await admin.from("app_settings").select("*").eq("id", 1).single();
    if (!cfg?.payments_enabled) return json({ ok: false, error: "Payments are not switched on yet." }, 400);

    const { data: pack } = await admin.from("credit_packs").select("*").eq("id", pack_id).eq("active", true).maybeSingle();
    if (!pack) return json({ ok: false, error: "Unknown credit pack." }, 400);
    const amount = pack.price;

    const msisdn = normalizePhone(phone);
    if (!msisdn) return json({ ok: false, error: "Enter a valid Safaricom number, like 0712 345 678." }, 400);

    // Record the attempt first, so every payment can be traced
    const { data: pay, error: insErr } = await admin
      .from("payments")
      .insert({ user_id: u.user.id, pack_id: pack.id, credits: pack.credits, amount, phone: msisdn })
      .select()
      .single();
    if (insErr || !pay) return json({ ok: false, error: "Could not start the payment." }, 500);

    const base = Deno.env.get("MPESA_ENV") === "live" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const key = Deno.env.get("MPESA_CONSUMER_KEY")!;
    const secret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
    const shortcode = Deno.env.get("MPESA_SHORTCODE")!;
    const passkey = Deno.env.get("MPESA_PASSKEY")!;
    const txType = Deno.env.get("MPESA_TX_TYPE") ?? "CustomerBuyGoodsOnline"; // or CustomerPayBillOnline
    const partyB = txType === "CustomerBuyGoodsOnline" ? (Deno.env.get("MPESA_TILL") ?? shortcode) : shortcode;

    const tokenRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: "Basic " + btoa(`${key}:${secret}`) },
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) {
      await admin.from("payments").update({ status: "failed" }).eq("id", pay.id);
      return json({ ok: false, error: "Payment service is unavailable. Try again soon." }, 502);
    }

    const ts = timestamp();
    const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: btoa(shortcode + passkey + ts),
        Timestamp: ts,
        TransactionType: txType,
        Amount: amount,
        PartyA: msisdn,
        PartyB: partyB,
        PhoneNumber: msisdn,
        CallBackURL: `${url}/functions/v1/pay-callback?key=${Deno.env.get("CALLBACK_KEY")}`,
        AccountReference: "EgertonConn",
        TransactionDesc: "Chat credits",
      }),
    });
    const stk = await stkRes.json();

    if (stk.ResponseCode !== "0") {
      await admin.from("payments").update({ status: "failed" }).eq("id", pay.id);
      return json({ ok: false, error: "The M-Pesa prompt could not be sent. Check the number and try again." }, 400);
    }

    await admin.from("payments").update({ checkout_id: stk.CheckoutRequestID }).eq("id", pay.id);
    return json({ ok: true, paymentId: pay.id });
  } catch (_e) {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
});
