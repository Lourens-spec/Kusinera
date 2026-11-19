# Create employee accounts

The app UI is under Admin → Accounts → Create employee account.

## One-time deployment

This requires the existing profiles table, username uniqueness index and account-profile trigger already used by Kusinera.

From the Kusinera project folder, run:

    npx supabase login
    npx supabase functions deploy create-employee --project-ref qmukqzdslaxffbfpjhmb

Alternatively, use the Supabase Dashboard → Edge Functions → Create function → Via Editor. Keep the filename index.ts, paste the adjacent index.ts file, set the function name to create-employee, and deploy. Keep JWT verification enabled.

The function reads SUPABASE_URL and the server-only default SUPABASE_SECRET_KEYS entry, falling back to SUPABASE_SERVICE_ROLE_KEY. These belong in the Edge Function environment, never the Expo app. Do not replace environment-variable names with key values in the code.

## Behavior

The function verifies the caller's JWT and checks their profiles.role is admin before creating an account. Only staff, kitchen and rider are accepted. Username and email must be unique. Created employees can sign in immediately with username or email and the initial password entered by Admin. No email is sent automatically and no forced password-change flow is included.

The admin's session stays signed in. Only the new employee's auth account is deleted if profile setup fails. If cleanup cannot complete, the form tells Admin to refresh Accounts and finish the role assignment before retrying.

## Verification

Try one Staff, Kitchen or Rider account through the form, sign in as that employee, and confirm the correct workspace opens. Confirm unauthenticated users and non-admin roles cannot invoke the function. Avoid retrying a timed-out request before checking whether the account appears in Accounts.
