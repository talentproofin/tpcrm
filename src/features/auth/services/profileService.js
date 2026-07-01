import { AUTH_ERROR_CODES } from "../constants/errors";

/**
 * @param {string} code
 * @param {string} message
 * @returns {Error}
 */
export function createAuthError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/auth').AuthProfile}
 */
export function mapProfileRow(row) {
  return {
    profileId: String(row.profile_id),
    authUserId: row.auth_user_id ? String(row.auth_user_id) : null,
    roleId: String(row.role_id),
    managerProfileId: row.manager_profile_id
      ? String(row.manager_profile_id)
      : null,
    fullName: String(row.full_name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : null,
    status: /** @type {import('../types/auth').ProfileStatus} */ (row.status),
    invitedAt: row.invited_at ? String(row.invited_at) : null,
    activatedAt: row.activated_at ? String(row.activated_at) : null,
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/auth').AuthRole}
 */
export function mapRoleRow(row) {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} authUserId
 * @returns {Promise<import('../types/auth').AuthProfile | null>}
 */
export async function getProfileByAuthUserId(supabase, authUserId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "profile_id, auth_user_id, role_id, manager_profile_id, full_name, email, phone, status, invited_at, activated_at, last_login_at, created_at, updated_at"
    )
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw createAuthError(
      AUTH_ERROR_CODES.UNKNOWN,
      "Unable to load your profile. Please try again."
    );
  }

  return data ? mapProfileRow(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} roleId
 * @returns {Promise<import('../types/auth').AuthRole | null>}
 */
export async function getRoleById(supabase, roleId) {
  const { data, error } = await supabase
    .from("roles")
    .select("id, code, name, description")
    .eq("id", roleId)
    .maybeSingle();

  if (error) {
    throw createAuthError(
      AUTH_ERROR_CODES.UNKNOWN,
      "Unable to load role information. Please try again."
    );
  }

  return data ? mapRoleRow(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 * @param {string} authUserId
 * @returns {Promise<void>}
 */
export async function updateLastLoginAt(supabase, profileId, authUserId) {
  const { error } = await supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("profile_id", profileId)
    .eq("auth_user_id", authUserId);

  if (error) {
    throw createAuthError(
      AUTH_ERROR_CODES.UNKNOWN,
      "Unable to update login timestamp. Please try again."
    );
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 * @returns {Promise<void>}
 */
export async function activateInvitedProfile(supabase, profileId) {
  const { error } = await supabase.rpc("activate_invited_profile", {
    p_profile_id: profileId,
  });

  if (error) {
    throw createAuthError(
      AUTH_ERROR_CODES.UNKNOWN,
      "Unable to activate your profile. Please try again."
    );
  }
}
