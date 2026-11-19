import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};
const reply = (body: object, status: number) => Response.json(body, { status, headers });

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  const token = request.headers.get("Authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return reply({ error: "Sign in as an administrator." }, 401);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const secrets = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const key = secrets.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return reply({ error: "Employee account creation is not configured yet." }, 503);
    const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: caller, error: authError } = await admin.auth.getUser(token);
    if (authError || !caller.user) return reply({ error: "Your session expired. Sign in again." }, 401);
    const { data: profile, error: roleError } = await admin.from("profiles").select("role").eq("id", caller.user.id).maybeSingle();
    if (roleError) {
      console.error("Employee admin profile lookup failed", { code: roleError.code });
      return reply({ error: "Couldn’t read the administrator profile (" + (roleError.code || "lookup failed") + "). Check this Edge Function’s server-key configuration." }, 503);
    }
    if (!profile) return reply({ error: "No profile found for this session. Sign out and sign in as Admin again." }, 403);
    if (profile.role !== "admin") return reply({ error: "The current session is not an Admin account. Sign out and sign in as Admin again." }, 403);

    const raw = await request.text();
    if (raw.length > 5000) return reply({ error: "Account details are too long." }, 400);
    let body;
    try { body = JSON.parse(raw); } catch { return reply({ error: "Invalid account details." }, 400); }
    const text = (name: string) => typeof body?.[name] === "string" ? body[name].trim() : "";
    const displayName = text("display_name");
    const username = text("username").toLowerCase();
    const email = text("email").toLowerCase();
    const password = typeof body?.password === "string" ? body.password : "";
    const role = text("role");
    if (!displayName || displayName.length > 40) return reply({ error: "Enter a display name of up to 40 characters." }, 400);
    if (!/^[a-z0-9][a-z0-9_.-]{2,31}$/.test(username)) return reply({ error: "Use a valid username of 3–32 characters." }, 400);
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: "Enter a valid email address." }, 400);
    if (password.length < 12 || password.length > 72 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return reply({ error: "Use a password of 12–72 characters with a letter and a number." }, 400);
    if (!["staff", "kitchen", "rider"].includes(role)) return reply({ error: "Choose Staff, Kitchen or Rider." }, 400);

    const { data: existing, error: lookupError } = await admin.from("profiles").select("id").ilike("username", username.replace(/[_%]/g, "\\$&")).maybeSingle();
    if (lookupError) return reply({ error: "Couldn’t check this username. Try again." }, 503);
    if (existing) return reply({ error: "That username is already in use." }, 409);
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username, display_name: displayName } });
    if (error || !data.user) {
      const status = error?.status === 429 ? 429 : 409;
      return reply({ error: status === 429 ? "Too many account requests. Try again later." : "Couldn’t create this account. Check the email and username are unused, and that the password meets your project’s requirements." }, status);
    }
    const id = data.user.id;
    const { data: employee, error: saveError } = await admin.from("profiles")
      .update({ username, display_name: displayName, role }).eq("id", id)
      .select("id, username, display_name, role").single();
    if (saveError) {
      const cleanup = await admin.auth.admin.deleteUser(id);
      return reply({ error: cleanup.error
        ? "Account created but setup is incomplete. Refresh Accounts and edit its role before retrying."
        : "Couldn’t finish employee setup. No account was kept. Please try again." }, 500);
    }
    return reply({ employee }, 201);
  } catch {
    return reply({ error: "Employee account creation is temporarily unavailable. Refresh Accounts before retrying." }, 503);
  }
});
