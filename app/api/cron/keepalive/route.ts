import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verify the request is authenticated with the cron secret
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("[CRON] Unauthorized attempt to trigger keepalive");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Perform a minimal, cheap read query to keep the database active
    // We select 1 from events with limit 1, which requires negligible compute
    const { error } = await supabase
      .from("events")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[CRON] Error executing keepalive query:", error);
      return NextResponse.json(
        { error: "Failed to execute keepalive" },
        { status: 500 }
      );
    }

    console.log("[CRON] Successfully executed keepalive query.");
    return NextResponse.json({
      success: true,
      message: "Database keepalive successful",
    });
  } catch (error) {
    console.error("[CRON] Unexpected error in keepalive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
