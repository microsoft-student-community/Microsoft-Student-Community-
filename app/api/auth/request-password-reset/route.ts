import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateEmail, encrypt } from "@/utils/security";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, new_password } = await req.json();

    const email = (rawEmail || "").toLowerCase().trim();
    const newPassword = new_password || "";

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required." },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if the user exists in member_profiles
    const { data: profile, error: profileError } = await supabase
      .from("member_profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      // Return standard success to prevent email enumeration attacks
      return NextResponse.json({ success: true });
    }

    let encryptedPassword: string;
    try {
      encryptedPassword = encrypt(newPassword);
    } catch {
      return NextResponse.json(
        { error: "Password reset is temporarily unavailable. Please contact an administrator." },
        { status: 500 }
      );
    }

    // Insert the pending request
    const { error } = await supabase
      .from("password_reset_requests")
      .insert([{ email, new_password: encryptedPassword, status: "pending" }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
