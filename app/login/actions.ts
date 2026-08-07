"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Next.js redirection after successful login
  redirect("/event-portal");
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  const new_password = formData.get("new_password") as string;

  if (!email || !new_password) {
    return { error: "Missing required fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("password_reset_requests")
    .insert([{ email, new_password, status: "pending" }]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
