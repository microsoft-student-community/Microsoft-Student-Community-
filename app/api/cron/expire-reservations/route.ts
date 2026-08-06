import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verify the request is authenticated with the cron secret
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("[CRON] Unauthorized attempt to trigger expire-reservations");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getAdminSupabaseClient();

    // Call the database function to expire payment reservations
    const { data, error } = await supabase.rpc("expire_payment_reservations");

    if (error) {
      console.error("[CRON] Error expiring reservations:", error);
      return NextResponse.json(
        { error: "Failed to expire reservations" },
        { status: 500 }
      );
    }

    console.log(`[CRON] Successfully expired reservations. Affected count: ${data || 0}`);
    return NextResponse.json({
      success: true,
      message: "Reservations expired successfully",
      count: data || 0,
    });
  } catch (error) {
    console.error("[CRON] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
