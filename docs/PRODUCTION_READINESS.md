# Production readiness

This application now contains safe primitives for registration and payments, but they must be deployed and operated correctly. No single deployment can truthfully guarantee capacity for 100,000 users without these controls.

## Required before accepting real payments

1. Apply `supabase/migrations/20260801_production_hardening.sql` using the Supabase CLI or SQL editor. It adds atomic registration capacity checks, idempotency keys, payment orders, unique payment constraints, and webhook-safe confirmation.
2. Set every variable in `.env.example`; do not expose server-only keys to the browser. Production payment and registration requests intentionally return `503` without Upstash, rather than silently using a per-instance memory limiter.
3. In Razorpay Dashboard, configure `POST https://YOUR_DOMAIN/api/razorpay/webhook`, enter `RAZORPAY_WEBHOOK_SECRET`, and enable at least `payment.captured` and payment-failure events. Treat the webhook as the payment source of truth; do not confirm access only from the browser callback.
4. Run a scheduled job every 5 minutes: `select public.expire_payment_reservations();`. This releases unpaid capacity after 15 minutes. Use Supabase Cron/pg_cron or an authenticated scheduler—not a browser timer.
5. Ensure RLS policies are reviewed in the live Supabase project. Client roles must not be able to insert/update `payments`, `payment_orders`, or confirm registrations directly.

## Capacity posture for 100,000 users

- Use a managed serverless deployment behind a CDN/WAF, with a production Supabase plan sized for expected database connections and read/write throughput.
- Use Upstash Redis in the same region for distributed rate limits; do not rely on the development memory fallback.
- Keep event listings cached (`revalidate = 60` is already in use) and paginate admin registration tables; do not load every registration/realtime subscription for a large event.
- Send confirmation email asynchronously through a queue/worker. Do not send thousands of emails inside a registration request or CSV import.
- Load-test a staging environment with realistic registration bursts before every major launch. Verify database CPU, connection pool usage, Redis latency, Razorpay error rate, and webhook lag.
- Enable platform DDoS/WAF rules and monitoring/alerting (errors, latency, payment webhook failures, queue depth, and failed sign-ins). Keep daily database backups and exercise a restore.

## Registration API contract

`POST /api/events/register` requires an authenticated user and JSON:

```json
{
  "event_id": "uuid",
  "idempotency_key": "a-new-uuid-per-submit",
  "form_data": { "fullName": "…" },
  "team_data": null
}
```

For a paid registration, use the returned `registration_id` with `POST /api/razorpay/create-order`. That endpoint requires `event_id`, `registration_id`, and a new `idempotency_key`; it never accepts a browser-provided amount. After Razorpay Checkout succeeds, call `/api/razorpay/verify-payment` for immediate UI feedback, but grant access only when the confirmation transaction/webhook marks the registration `confirmed`.
