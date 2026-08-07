import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/utils/supabase/server";

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

    const { targetUserId } = await req.json();

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "Invalid targetUserId" }, { status: 400 });
    }

    // Prevent self-deletion
    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(`[AUDIT] User ${user.id} (admin) deleted user ${targetUserId}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
