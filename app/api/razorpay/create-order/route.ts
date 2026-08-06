import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  enforceSensitiveRateLimit,
  isUuid,
  noStoreJson,
  readJsonObject,
  requireUser,
} from "@/utils/apiSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function eventPriceInPaise(event: { form_requirements?: unknown }) {
  const requirements = event.form_requirements as Record<
    string,
    unknown
  > | null;
  if (requirements?.event_pricing !== "paid") return null;
  const feeInRupees = Number(requirements.registration_fee);
  if (
    !Number.isSafeInteger(feeInRupees) ||
    feeInRupees < 1 ||
    feeInRupees > 100_000
  )
    return undefined;
  return feeInRupees * 100;
}

/**
 * Creates a Razorpay order from server-owned event pricing only. The browser may
 * never choose the amount, currency, event, or payer stored for a payment.
 */
export async function POST(request: NextRequest) {
  const limit = await enforceSensitiveRateLimit(
    request,
    "payment-order",
    8,
    60_000,
  );
  if (limit instanceof Response) return limit;

  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await readJsonObject(request);
  const eventId = body?.event_id;
  const registrationId = body?.registration_id;
  const idempotencyKey = body?.idempotency_key;
  if (!isUuid(eventId) || !isUuid(registrationId) || !isUuid(idempotencyKey)) {
    return noStoreJson(
      {
        error: "event_id, registration_id, and idempotency_key must be UUIDs.",
      },
      400,
      limit.headers,
    );
  }

  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET ||
    !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  ) {
    console.error(
      "Razorpay order creation attempted without complete configuration.",
    );
    return noStoreJson(
      { error: "Payments are temporarily unavailable." },
      503,
      limit.headers,
    );
  }

  try {
    const admin = createAdminClient();
    const [{ data: event }, { data: registration }] = await Promise.all([
      admin
        .from("events")
        .select("id, registration_open, status, form_requirements")
        .eq("id", eventId)
        .maybeSingle(),
      admin
        .from("registrations")
        .select("id, event_id, user_id, status")
        .eq("id", registrationId)
        .maybeSingle(),
    ]);

    const amount = event ? eventPriceInPaise(event) : undefined;
    if (
      !event ||
      !event.registration_open ||
      event.status === "completed" ||
      amount === undefined
    ) {
      return noStoreJson(
        { error: "This event is not available for payment." },
        409,
        limit.headers,
      );
    }
    if (amount === null)
      return noStoreJson(
        { error: "This event does not require a payment." },
        409,
        limit.headers,
      );
    if (
      !registration ||
      registration.event_id !== eventId ||
      registration.user_id !== auth.user.id ||
      registration.status !== "pending_payment"
    ) {
      return noStoreJson(
        { error: "No payable registration was found." },
        403,
        limit.headers,
      );
    }

    const { data: existing } = await admin
      .from("payment_orders")
      .select("razorpay_order_id, amount, currency, expires_at, status")
      .eq("user_id", auth.user.id)
      .eq("event_id", eventId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (
      existing?.razorpay_order_id &&
      existing.status === "created" &&
      new Date(existing.expires_at).getTime() > Date.now()
    ) {
      return noStoreJson(
        {
          order_id: existing.razorpay_order_id,
          amount: existing.amount,
          currency: existing.currency,
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          expires_at: existing.expires_at,
        },
        200,
        limit.headers,
      );
    }
    if (existing?.status === "paid")
      return noStoreJson(
        { error: "This payment has already been completed." },
        409,
        limit.headers,
      );
    if (existing?.status === "creating")
      return noStoreJson(
        {
          error:
            "A payment order is already being prepared. Please retry shortly.",
        },
        409,
        limit.headers,
      );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error: reservationError } = await admin
      .from("payment_orders")
      .insert({
        event_id: eventId,
        registration_id: registrationId,
        user_id: auth.user.id,
        idempotency_key: idempotencyKey,
        amount,
        currency: "INR",
        status: "creating",
        expires_at: expiresAt,
      });
    if (reservationError) {
      return noStoreJson(
        {
          error:
            "A duplicate payment request was rejected. Start a new payment attempt.",
        },
        409,
        limit.headers,
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const receipt = `msc_${registrationId.replaceAll("-", "").slice(0, 16)}_${idempotencyKey.replaceAll("-", "").slice(0, 12)}`;
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        event_id: eventId,
        registration_id: registrationId,
        user_id: auth.user.id,
      },
    });

    const { error: updateError } = await admin
      .from("payment_orders")
      .update({ razorpay_order_id: order.id, status: "created" })
      .eq("user_id", auth.user.id)
      .eq("event_id", eventId)
      .eq("idempotency_key", idempotencyKey)
      .eq("status", "creating");
    if (updateError) throw updateError;

    return noStoreJson(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        expires_at: expiresAt,
      },
      201,
      limit.headers,
    );
  } catch (error) {
    console.error("Secure Razorpay order creation failed:", error);
    return noStoreJson(
      { error: "Unable to create a payment order. Please try again." },
      500,
      limit.headers,
    );
  }
}
