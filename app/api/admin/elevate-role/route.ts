import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/utils/supabase/server";

const VALID_ROLES = ["admin", "core_member", "user"];

export async function POST(req: Request) {
  try {
    // 🔒 AUTH GUARD: Verify the caller is an authenticated admin
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: No active session" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("member_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { targetUserId, newRole } = await req.json();

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "Invalid targetUserId" }, { status: 400 });
    }

    if (!newRole || !VALID_ROLES.includes(newRole)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }

    // Prevent self-demotion
    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.from("member_profiles").update({
      role: newRole,
    }).eq("id", targetUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(`[AUDIT] User ${user.id} (admin) changed role of ${targetUserId} to ${newRole}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
