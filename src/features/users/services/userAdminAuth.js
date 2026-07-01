import { env } from "@/config/env";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

/**
 * @returns {string}
 */
export function getAuthRedirectUrl() {
  return `${env.appUrl}/login`;
}

/**
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Creates a confirmed auth user without sending an invite email.
 * Admins can trigger password setup separately via send-recovery.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {string} email
 * @param {string | undefined} password
 */
export async function createAuthUser(adminClient, email, password) {
  const normalizedEmail = normalizeEmail(email);

  const createPayload = {
    email: normalizedEmail,
    email_confirm: true,
  };

  if (password) {
    createPayload.password = password;
  }

  const { data, error } = await adminClient.auth.admin.createUser(createPayload);

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("Unable to create authentication user.");
  }

  return data.user;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {string} authUserId
 * @param {string} password
 */
export async function setUserPassword(adminClient, authUserId, password) {
  const { data, error } = await adminClient.auth.admin.updateUserById(authUserId, {
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("Unable to update user password.");
  }

  return data.user;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {string} email
 */
export async function resendInviteEmail(adminClient, email) {
  const normalizedEmail = normalizeEmail(email);

  const { error: resendError } = await adminClient.auth.resend({
    type: "signup",
    email: normalizedEmail,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (!resendError) {
    return;
  }

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      redirectTo: getAuthRedirectUrl(),
    }
  );

  if (inviteError) {
    throw new Error(inviteError.message);
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {string} email
 */
export async function sendRecoveryEmail(adminClient, email) {
  const normalizedEmail = normalizeEmail(email);

  const { error } = await adminClient.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: getAuthRedirectUrl(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getUserAdminClient() {
  return createAdminSupabaseClient();
}
