import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("member_profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const body = await req.json();
    const { action, reqId, userEmail, newPassword } = body;

    const supabaseAdmin = createAdminClient();

    if (action === "accept") {
      if (!reqId || !userEmail || !newPassword) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data: targetProfile, error: profileError } = await supabaseAdmin
        .from("member_profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (profileError || !targetProfile) {
        throw new Error(`User with email ${userEmail} not found in profiles.`);
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetProfile.id, {
        password: newPassword,
      });

      if (updateError) throw updateError;

      const { error: reqError } = await supabaseAdmin
        .from("password_reset_requests")
        .update({ status: "approved" })
        .eq("id", reqId);

      if (reqError) throw reqError;

      return NextResponse.json({ success: true });
    } 
    else if (action === "reject") {
      if (!reqId) {
        return NextResponse.json({ error: "Missing reqId" }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("password_reset_requests")
        .update({ status: "rejected" })
        .eq("id", reqId);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    console.error("handle-password-request error:", err);
    return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
