import { NextRequest } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  enforceSensitiveRateLimit,
  noStoreJson,
  readJsonObject,
  requireUser,
} from "@/utils/apiSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validGatewayId(value: unknown, prefix: string) {
  return (
    typeof value === "string" &&
    value.startsWith(prefix) &&
    /^[A-Za-z0-9_]+$/.test(value) &&
    value.length <= 128
  );
}

function signaturesMatch(expected: string, received: unknown) {
  if (typeof received !== "string" || !/^[a-f0-9]{64}$/i.test(received))
    return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(received, "hex"),
  );
}

/**
 * This endpoint is only a fast client acknowledgement. The webhook remains the
 * source of truth, and both paths invoke the same idempotent DB function.
 */
export async function POST(request: NextRequest) {
  const limit = await enforceSensitiveRateLimit(
    request,
    "payment-verify",
    12,
    60_000,
  );
  if (limit instanceof Response) return limit;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await readJsonObject(request);
  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;

  if (
    !validGatewayId(orderId, "order_") ||
    !validGatewayId(paymentId, "pay_")
  ) {
    return noStoreJson(
      { error: "Invalid payment reference." },
      400,
      limit.headers,
    );
  }
  const safeOrderId = orderId as string;
  const safePaymentId = paymentId as string;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    return noStoreJson(
      { error: "Payments are temporarily unavailable." },
      503,
      limit.headers,
    );

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${safeOrderId}|${safePaymentId}`)
    .digest("hex");
  if (!signaturesMatch(expected, signature))
    return noStoreJson(
      { error: "Payment signature could not be verified." },
      400,
      limit.headers,
    );

  try {
    const admin = createAdminClient();
    const { data: paymentOrder } = await admin
      .from("payment_orders")
      .select(
        "event_id, registration_id, user_id, amount, currency, status, expires_at",
      )
      .eq("razorpay_order_id", safeOrderId)
      .maybeSingle();

    if (
      !paymentOrder ||
      paymentOrder.user_id !== auth.user.id ||
      paymentOrder.status === "cancelled" ||
      new Date(paymentOrder.expires_at).getTime() < Date.now()
    ) {
      return noStoreJson(
        { error: "This payment order is no longer valid." },
        409,
        limit.headers,
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const [gatewayOrder, gatewayPayment] = await Promise.all([
      razorpay.orders.fetch(safeOrderId) as Promise<{
        id: string;
        amount: number;
        currency: string;
      }>,
      razorpay.payments.fetch(safePaymentId) as Promise<{
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
      }>,
    ]);
    if (
      gatewayOrder.id !== safeOrderId ||
      gatewayPayment.order_id !== safeOrderId ||
      gatewayOrder.amount !== paymentOrder.amount ||
      gatewayPayment.amount !== paymentOrder.amount ||
      gatewayOrder.currency !== paymentOrder.currency ||
      gatewayPayment.currency !== paymentOrder.currency ||
      gatewayPayment.status !== "captured"
    ) {
      return noStoreJson(
        { error: "The payment has not been captured by Razorpay yet." },
        409,
        limit.headers,
      );
    }

    const { error } = await admin.rpc("confirm_captured_payment", {
      p_razorpay_order_id: safeOrderId,
      p_razorpay_payment_id: safePaymentId,
      p_amount: paymentOrder.amount,
    });
    if (error) {
      console.error("Payment confirmation transaction failed:", error);
      return noStoreJson(
        {
          error:
            "Payment received but confirmation is pending. Do not pay again.",
        },
        202,
        limit.headers,
      );
    }
    return noStoreJson(
      { verified: true, payment_id: safePaymentId },
      200,
      limit.headers,
    );
  } catch (error) {
    console.error("Secure Razorpay payment verification failed:", error);
    return noStoreJson(
      { error: "Payment confirmation is pending. Do not pay again." },
      202,
      limit.headers,
    );
  }
}
