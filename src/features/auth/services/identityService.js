import { ACCESS_REASONS } from "../constants/access";
import { AUTH_ERROR_CODES } from "../constants/errors";
import { createAuthError } from "../utils/createAuthError";
import {
  getProfileByAuthUserId,
  getRoleById,
  updateLastLoginAt,
} from "./profileService";

/**
 * @typedef {import('../types/auth').SignInIdentity} SignInIdentity
 */

/**
 * @typedef {{ accessDenied: true, accessReason: string } | { accessDenied: false, identity: SignInIdentity }} IdentityResolution
 */

/**
 * Resolves CRM identity after successful Supabase authentication.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('@supabase/supabase-js').User} user
 * @param {import('@supabase/supabase-js').Session} session
 * @returns {Promise<IdentityResolution>}
 */
export async function resolveIdentityAfterLogin(supabase, user, session) {
  const profile = await getProfileByAuthUserId(supabase, user.id);

  if (!profile) {
    return {
      accessDenied: true,
      accessReason: ACCESS_REASONS.PROFILE_MISSING,
    };
  }

  if (profile.status === "invited") {
    return { accessDenied: true, accessReason: ACCESS_REASONS.INVITED };
  }

  if (profile.status === "inactive") {
    return { accessDenied: true, accessReason: ACCESS_REASONS.INACTIVE };
  }

  if (profile.status === "suspended") {
    return { accessDenied: true, accessReason: ACCESS_REASONS.SUSPENDED };
  }

  if (profile.status !== "active") {
    return {
      accessDenied: true,
      accessReason: ACCESS_REASONS.PROFILE_MISSING,
    };
  }

  const role = await getRoleById(supabase, profile.roleId);

  if (!role) {
    throw createAuthError(
      AUTH_ERROR_CODES.ROLE_MISSING,
      "Assigned role could not be found."
    );
  }

  await updateLastLoginAt(supabase, profile.profileId, user.id);

  return {
    accessDenied: false,
    identity: {
      user,
      session,
      profile: {
        ...profile,
        lastLoginAt: new Date().toISOString(),
      },
      role,
    },
  };
}
