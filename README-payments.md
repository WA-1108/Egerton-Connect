# Turning on payments for Egerton Connect

The site is built for **chat credits**: a member pays for a pack (for example KSh 49 for 5 chat requests),
and each new chat request uses one credit. Replying to a request is always free.
Right now `payments_enabled` is **false**, so every request is free and nobody sees anything about payments.

These files go into Supabase, not into your website folder.

## The rules built into the database
- A request uses 1 credit when it is sent. No refunds if it is declined or not answered.
- An unanswered request disappears after 10 days. The sender can pay again to send a new one.
- After a decline, the sender can ask the same person again after 30 days.
- A daily limit (10) on new requests stops spam.

You can change the packs, the limit and the day counts in the SQL Editor (see the bottom of this page).

## Part 1: Test with the Safaricom sandbox (free, no till needed)

1. Create an account at developer.safaricom.co.ke and create an app with the "M-Pesa Sandbox" and
   "Lipa na M-Pesa Sandbox" options ticked. Copy the app's **Consumer Key** and **Consumer Secret**.
2. On the Daraja site, open the STK Push simulator page. Note the test **shortcode** and **passkey** it shows.
3. In Supabase, open **Edge Functions**, then **Secrets** (or Project Settings, then Edge Functions) and add:

| Secret name | Value |
|---|---|
| `MPESA_ENV` | `sandbox` |
| `MPESA_CONSUMER_KEY` | your sandbox consumer key |
| `MPESA_CONSUMER_SECRET` | your sandbox consumer secret |
| `MPESA_SHORTCODE` | the sandbox shortcode |
| `MPESA_PASSKEY` | the sandbox passkey |
| `MPESA_TX_TYPE` | `CustomerPayBillOnline` for the sandbox |
| `CALLBACK_KEY` | a long random password you make up (letters and numbers) |

4. In Supabase, open **Edge Functions** and create a function named exactly `pay-start`.
   Paste in the contents of `pay-start.ts` and deploy.
5. Create a second function named exactly `pay-callback`, pasting `pay-callback.ts`.
   For this one, **turn OFF "Verify JWT"** (Safaricom cannot send a login token).
6. Switch payments on for the test. In the SQL Editor (Snippet) run:

```sql
update public.app_settings set payments_enabled = true where id = 1;
```

7. On the site, open **Credits**, choose a pack, and pay with a Safaricom test number from the simulator.
   Check **Table Editor > payments** (status `paid`) and **credit_ledger** (a new row with the credits).
8. To go back to free mode at any time:

```sql
update public.app_settings set payments_enabled = false where id = 1;
```

## Part 2: Going live with your till

When Safaricom has approved your Till (Buy Goods) and Daraja go-live, update these secrets in Supabase:

| Secret name | New value |
|---|---|
| `MPESA_ENV` | `live` |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | the live app's keys |
| `MPESA_SHORTCODE` | the store/head office number Safaricom gives you for the till |
| `MPESA_TILL` | your Till number |
| `MPESA_PASSKEY` | the live passkey Safaricom gives you |
| `MPESA_TX_TYPE` | `CustomerBuyGoodsOnline` |

Safaricom may ask to whitelist the server addresses that call Daraja. Supabase functions do not have a fixed
address, so ask Safaricom whether this is required for STK Push on your account. If it is, we will add a small
relay with a fixed address, or use a payment company instead.

Test once with a very small price, then set the real prices:

```sql
update public.credit_packs set price = 1 where id = 'starter';   -- live test only
update public.credit_packs set price = 49 where id = 'starter';   -- real price
update public.app_settings set payments_enabled = true where id = 1;
```

## Useful admin commands (SQL Editor, Snippet)

Change a pack, or add one:

```sql
update public.credit_packs set price = 49, credits = 5 where id = 'starter';
insert into public.credit_packs (id, name, price, credits, sort) values ('big', 'Big', 199, 30, 3);
```

Give someone free credits (for example a tester). Replace the email:

```sql
insert into public.credit_ledger (user_id, delta, reason)
select id, 10, 'grant' from auth.users where email = 'person@example.com';
```

Change how many new requests a person can send per day, or the expiry and retry days:

```sql
update public.app_settings set daily_chat_limit = 10, request_expiry_days = 10, retry_after_decline_days = 30 where id = 1;
```

See recent payments:

```sql
select created_at, phone, pack_id, amount, status, receipt from public.payments order by created_at desc limit 50;
```
