import crypto from "crypto";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { noStoreJson } from "@/utils/apiSecurity";
import { sendRegistrationEmail } from "@/utils/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function signatureMatches(expected: string, received: string | null) {
  if (!received || !/^[a-f0-9]{64}$/i.test(received)) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(received, "hex"),
  );
}

/** Razorpay's signed webhook is the durable source of truth for paid status. */
export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      "Razorpay webhook received without RAZORPAY_WEBHOOK_SECRET configured.",
    );
    return noStoreJson({ error: "Webhook unavailable" }, 503);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  if (!signatureMatches(expected, signature))
    return noStoreJson({ error: "Invalid webhook signature" }, 400);

  let payload: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          status?: string;
        };
      };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return noStoreJson({ error: "Invalid webhook payload" }, 400);
  }

  if (payload.event !== "payment.captured")
    return noStoreJson({ received: true });
  const payment = payload.payload?.payment?.entity;
  if (
    !payment?.id ||
    !payment.order_id ||
    !Number.isSafeInteger(payment.amount) ||
    payment.status !== "captured"
  ) {
    return noStoreJson({ error: "Incomplete payment payload" }, 400);
  }

  try {
    const admin = createAdminClient();

    // Check status before confirming to prevent duplicate emails on retries
    const { data: order } = await admin
      .from("payment_orders")
      .select("status, event_id, registration_id, user_id")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();
      
    const wasAlreadyPaid = order?.status === 'paid';

    const { error } = await admin.rpc("confirm_captured_payment", {
      p_razorpay_order_id: payment.order_id,
      p_razorpay_payment_id: payment.id,
      p_amount: payment.amount,
    });
    if (error) {
      console.error("Webhook payment confirmation transaction failed:", error);
      return noStoreJson({ error: "Payment confirmation pending" }, 500);
    }

    if (order && !wasAlreadyPaid) {
      Promise.all([
        admin.from('events').select('title, start_date, location').eq('id', order.event_id).single(),
        admin.from('registrations').select('hash_payload, team_data').eq('id', order.registration_id).single(),
        admin.auth.admin.getUserById(order.user_id)
      ]).then(([{ data: ev }, { data: reg }, { data: userData }]) => {
        if (ev && reg && userData?.user) {
          sendRegistrationEmail({
            to: userData.user.email || '',
            name: userData.user.user_metadata?.full_name || 'Participant',
            eventTitle: ev.title,
            eventDate: new Date(ev.start_date).toLocaleString(),
            eventLocation: ev.location || 'TBA',
            status: 'confirmed',
            hashPayload: reg.hash_payload,
            isTeam: !!reg.team_data,
            teamName: (reg.team_data as any)?.team_name || undefined,
          }).catch(e => console.error("Webhook email error:", e));
        }
      }).catch(e => console.error("Webhook data fetch error:", e));
    }

  } catch (error) {
    console.error("Razorpay webhook failure:", error);
    return noStoreJson({ error: "Payment confirmation pending" }, 500);
  }

  return noStoreJson({ received: true });
}
