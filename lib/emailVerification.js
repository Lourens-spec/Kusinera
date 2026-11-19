import { supabase } from "./supabase";

export function cleanVerificationEmail(value) {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the email address you used to register.");
  return email;
}

export async function verifyCustomerEmail(value, code) {
  if (!supabase) throw new Error("Email verification is not configured.");
  const email = cleanVerificationEmail(value);
  const token = code.trim();
  if (!/^\d{6,10}$/.test(token)) throw new Error("Enter the complete numeric code from your email.");
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw new Error(error.status === 429 ? "Too many attempts. Please wait before trying again." : "This code is invalid or expired. Request a new code and try again.");
  if (!data.user?.email_confirmed_at) throw new Error("Email confirmation is incomplete. Please request a new code.");
  // Verification creates an auth session. Return to the normal password login flow.
  await supabase.auth.signOut({ scope: "local" });
}

export async function resendSignupCode(value) {
  if (!supabase) throw new Error("Email verification is not configured.");
  const email = cleanVerificationEmail(value);
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw new Error(error.status === 429 ? "Please wait before requesting another code." : "Couldn’t resend the email. Try again shortly.");
}
