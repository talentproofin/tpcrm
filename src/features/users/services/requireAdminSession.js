import { NextResponse } from "next/server";
import { getAuthServerClient } from "@/features/auth/services/authServerClient";
import {
  getProfileByAuthUserId,
  getRoleById,
} from "@/features/auth/services/profileService";
import { canManageUsers } from "@/features/users/constants/permissions";

/**
 * @returns {Promise<
 *   | { ok: true, profile: import('@/features/auth/types/auth').AuthProfile, role: import('@/features/auth/types/auth').AuthRole }
 *   | { ok: false, response: NextResponse }
 * >}
 */
export async function requireAdminSession() {
  const supabase = await getAuthServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  const profile = await getProfileByAuthUserId(supabase, user.id);

  if (!profile) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Profile not found." }, { status: 403 }),
    };
  }

  const role = await getRoleById(supabase, profile.roleId);

  if (!role || !canManageUsers(role.code)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { ok: true, profile, role, supabase };
}
