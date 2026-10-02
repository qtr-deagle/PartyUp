import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

// Password management for staff/admin console accounts. Passwords are never
// stored or seen by PartyUp code: Supabase Auth hashes them with bcrypt into
// auth.users.encrypted_password. Three flows live here:
// - changeOwnPassword: a signed-in user changes their own password after
//   re-entering the current one.
// - sendPasswordResetEmail: "Forgot password?" -- Supabase emails a one-time
//   link to /reset-password, where the user picks a new password.
// - adminSendPasswordReset: an admin triggers that same email for a staff
//   member. The admin never sees or sets the new password; the link only
//   goes to the account's own inbox.

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { id: 'uppercase', label: 'Contains an uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'Contains a lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { id: 'number', label: 'Contains a number', test: (value: string) => /\d/.test(value) },
  { id: 'symbol', label: 'Contains a symbol like @ # $ % ! & *', test: (value: string) => /[^A-Za-z0-9\s]/.test(value) },
  { id: 'spaces', label: 'Has no spaces', test: (value: string) => value.length > 0 && !/\s/.test(value) },
] as const;

export function validateNewPassword(password: string, confirmation: string): string | null {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (failed) return `Password must meet every rule: ${failed.label.toLowerCase()}.`;
  if (password !== confirmation) return 'The new passwords do not match.';
  return null;
}

export function passwordResetRedirectUrl() {
  return `${window.location.origin}/reset-password`;
}

// Checking the current password with the main client would replace the
// signed-in session, so it goes through a separate, non-persisted client
// whose throwaway session is signed out right after.
let verifierClient: ReturnType<typeof createClient> | null = null;

function getVerifierClient() {
  if (!verifierClient) {
    verifierClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'partyup-password-check',
      },
    });
  }
  return verifierClient;
}

export async function changeOwnPassword(email: string, currentPassword: string, newPassword: string) {
  if (currentPassword === newPassword) {
    return { error: new Error('Your new password must be different from your current one.') };
  }

  const verifier = getVerifierClient();
  const { error: verifyError } = await verifier.auth.signInWithPassword({ email, password: currentPassword });
  if (verifyError) {
    return { error: new Error('Your current password is incorrect.') };
  }
  await verifier.auth.signOut({ scope: 'local' });

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error };

  // A changed password should lock out anyone still signed in elsewhere.
  await supabase.auth.signOut({ scope: 'others' });

  const { data } = await supabase.auth.getUser();
  if (data.user) logAuditAction('Changed own password', 'staff_profile', data.user.id);
  return { error: null };
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: passwordResetRedirectUrl(),
  });
  return { error };
}

export async function adminSendPasswordReset(member: { id: string; email: string | null; display_name: string }) {
  if (!member.email) return { error: new Error(`${member.display_name} has no email on file.`) };

  const { error } = await sendPasswordResetEmail(member.email);
  if (!error) {
    logAuditAction('Sent password reset link', 'staff_profile', member.id, { email: member.email });
  }
  return { error };
}
