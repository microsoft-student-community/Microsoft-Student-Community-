"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function acceptPasswordRequest(
  reqId: string,
  userEmail: string,
  newPassword: string,
) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("member_profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { error: "Forbidden: Insufficient privileges" };
    }

    const supabaseAdmin = createAdminClient();

    const { data: userData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) throw listError;

    const targetUser = userData.users.find((u: any) => u.email === userEmail);
    if (!targetUser) {
      throw new Error(`User with email ${userEmail} not found in Auth.`);
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        password: newPassword,
      });

    if (updateError) throw updateError;

    const { error: reqError } = await supabaseAdmin
      .from("password_reset_requests")
      .update({ status: "approved" })
      .eq("id", reqId);

    if (reqError) throw reqError;

    return { success: true };
  } catch (err: any) {
    console.error("acceptPasswordRequest error:", err);
    return { error: err.message || "Failed to accept request" };
  }
}

export async function rejectPasswordRequest(reqId: string) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("member_profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { error: "Forbidden: Insufficient privileges" };
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("password_reset_requests")
      .update({ status: "rejected" })
      .eq("id", reqId);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("rejectPasswordRequest error:", err);
    return { error: err.message || "Failed to reject request" };
  }
}
