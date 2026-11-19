import { supabase } from "./supabase";

export function validatePasswordChange(currentPassword, password, confirmation) {
  if (!currentPassword) return "Enter your current password.";
  if (password.length < 8 || password.length > 72) return "Use a new password of 8–72 characters.";
  if (password === currentPassword) return "Choose a password different from your current one.";
  if (password !== confirmation) return "The new passwords don’t match.";
  return null;
}

export async function changeCustomerPassword(userId, currentPassword, password, confirmation) {
  const validation = validatePasswordChange(currentPassword, password, confirmation);
  if (validation) throw new Error(validation);
  if (!supabase || !userId) throw new Error("Sign in with your Supabase customer account to change your password.");
  const { data: identity, error: identityError } = await supabase.auth.getUser();
  if (identityError || identity.user?.id !== userId || !identity.user.email) throw new Error("Your session changed or expired. Sign out and sign in again.");
  // A fresh sign-in verifies the old password and satisfies recent-login requirements.
  const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({ email: identity.user.email, password: currentPassword });
  if (signInError) throw new Error(signInError.status === 429 ? "Too many attempts. Wait before trying again." : "Your current password could not be verified. Check it and try again.");
  if (signedIn.user?.id !== userId) throw new Error("Your account session changed. Sign out and sign in again.");
  const { error } = await supabase.auth.updateUser({ password, current_password: currentPassword });
  if (error) {
    if (error.code === "same_password") throw new Error("Choose a password different from your current one.");
    if (error.code === "weak_password") throw new Error(error.message || "Choose a stronger password.");
    if (["reauthentication_needed", "reauth_nonce_missing", "session_not_found"].includes(error.code)) throw new Error("Please sign out and sign in again before changing your password.");
    throw new Error("Couldn’t update your password. Please try again.");
  }
}
