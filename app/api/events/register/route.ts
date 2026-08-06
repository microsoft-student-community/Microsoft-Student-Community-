import crypto from "crypto";
import { NextRequest } from "next/server";
import {
  enforceSensitiveRateLimit,
  isUuid,
  noStoreJson,
  readJsonObject,
  requireUser,
} from "@/utils/apiSecurity";
import { sendRegistrationEmail } from "@/utils/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FIELD_BYTES = 16 * 1024;

function safeRegistrationData(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const json = JSON.stringify(value);
  if (json.length > MAX_FIELD_BYTES) return null;
  return value;
}

/**
 * Atomic registration entry point. Capacity, duplicate prevention, waitlisting,
 * and payment reservation state are enforced by register_for_event in Postgres.
 */
export async function POST(request: NextRequest) {
  const limit = await enforceSensitiveRateLimit(
    request,
    "event-registration",
    5,
    60_000,
  );
  if (limit instanceof Response) return limit;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await readJsonObject(request);
  const eventId = body?.event_id;
  const idempotencyKey = body?.idempotency_key;
  const formData = safeRegistrationData(body?.form_data);
  const teamData =
    body?.team_data === undefined || body.team_data === null
      ? null
      : safeRegistrationData(body.team_data);

  if (
    !isUuid(eventId) ||
    !isUuid(idempotencyKey) ||
    !formData ||
    (body?.team_data && !teamData)
  ) {
    return noStoreJson(
      { error: "Invalid registration payload." },
      400,
      limit.headers,
    );
  }

  try {
    const hashPayload = crypto.randomUUID();
    const { data, error } = await auth.supabase.rpc("register_for_event", {
      p_event_id: eventId,
      p_idempotency_key: idempotencyKey,
      p_form_data: formData,
      p_team_data: teamData,
      p_hash_payload: hashPayload,
    });
    if (error) {
      // The function deliberately exposes stable business errors only.
      const message =
        error.message.includes("registration is closed") ||
        error.message.includes("not available") ||
        error.message.includes("already registered")
          ? error.message
          : "Unable to complete this registration. Please try again.";
      return noStoreJson({ error: message }, 409, limit.headers);
    }

    const registration = Array.isArray(data) ? data[0] : data;

    if (registration.registration_status === 'confirmed' || registration.registration_status === 'waitlisted') {
      auth.supabase
        .from('events')
        .select('title, start_date, location')
        .eq('id', eventId)
        .single()
        .then(({ data: ev }: { data: any }) => {
          if (ev) {
            sendRegistrationEmail({
              to: auth.user.email || '',
              name: (formData as any)?.fullName || auth.user.user_metadata?.full_name || 'Participant',
              eventTitle: ev.title,
              eventDate: new Date(ev.start_date).toLocaleString(),
              eventLocation: ev.location || 'TBA',
              status: registration.registration_status as 'confirmed' | 'waitlisted',
              hashPayload: hashPayload,
              isTeam: !!teamData,
              teamName: (teamData as any)?.team_name || undefined,
            }).then(() => {}, (e: any) => console.error("Fire-and-forget email error:", e));
          }
        }, (e: any) => console.error("Event lookup for email failed:", e));
    }

    return noStoreJson({ registration }, 201, limit.headers);
  } catch (error) {
    console.error("Event registration failed:", error);
    return noStoreJson(
      { error: "Unable to complete this registration. Please try again." },
      500,
      limit.headers,
    );
  }
}
