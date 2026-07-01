import { createService } from "@/services/infrastructure/createService";
import {
  DEFAULT_PAGE_SIZE,
  MANAGER_ASSIGNABLE_ROLE_CODES,
  USER_ERROR_CODES,
} from "../constants";
import { MANAGED_USER_SELECT, loadManagersForRows, mapManagedUserRow } from "./userMapper";

/**
 * @param {string} code
 * @param {string} message
 */
function createUserError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * @param {unknown} error
 */
function mapDatabaseError(error) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "Unable to complete the user request. Please try again.";

  if (message.includes("email already exists")) {
    return createUserError(USER_ERROR_CODES.DUPLICATE_EMAIL, message);
  }

  if (
    message.includes("cannot be assigned as their own manager") ||
    message.includes("Invalid manager assignment") ||
    message.includes("Invalid role assignment") ||
    message.includes("Invalid status transition") ||
    message.includes("cannot change your own role") ||
    message.includes("cannot deactivate or suspend your own account") ||
    message.includes("Role is required") ||
    message.includes("Email is required")
  ) {
    return createUserError(USER_ERROR_CODES.VALIDATION, message);
  }

  if (message.includes("Only admins")) {
    return createUserError(USER_ERROR_CODES.FORBIDDEN, message);
  }

  return createUserError(USER_ERROR_CODES.UNKNOWN, message);
}

/**
 * @param {string | null | undefined} value
 */
function emptyToNull(value) {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 */
async function fetchManagedUserById(supabase, profileId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(MANAGED_USER_SELECT)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!data) {
    throw createUserError(USER_ERROR_CODES.NOT_FOUND, "User not found.");
  }

  let managersById;
  try {
    managersById = await loadManagersForRows(supabase, [data]);
  } catch (err) {
    throw mapDatabaseError(err);
  }

  return mapManagedUserRow(data, managersById);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   page?: number,
 *   pageSize?: number,
 *   search?: string,
 *   roleId?: string,
 *   status?: string,
 * }} [options]
 */
async function executeGetUserList(supabase, options = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select(MANAGED_USER_SELECT, { count: "exact" })
    .order("full_name", { ascending: true });

  if (options.search?.trim()) {
    const term = options.search.trim();
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  if (options.roleId) {
    query = query.eq("role_id", options.roleId);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw mapDatabaseError(error);
  }

  const rows = data ?? [];

  let managersById;
  try {
    managersById = await loadManagersForRows(supabase, rows);
  } catch (err) {
    throw mapDatabaseError(err);
  }

  const total = count ?? 0;

  return {
    items: rows.map((row) => mapManagedUserRow(row, managersById)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
async function executeGetUserMetrics(supabase) {
  const { data, error } = await supabase.from("profiles").select("status");

  if (error) {
    throw mapDatabaseError(error);
  }

  const rows = data ?? [];

  return {
    totalUsers: rows.length,
    activeUsers: rows.filter((row) => row.status === "active").length,
    inactiveUsers: rows.filter((row) => row.status === "inactive").length,
  };
}

export const getUserList = createService({
  name: "getUserList",
  execute: executeGetUserList,
});

export const getUserMetrics = createService({
  name: "getUserMetrics",
  execute: executeGetUserMetrics,
});

export const updateUser = createService({
  name: "updateUser",
  execute: async (supabase, profileId, actorProfileId, input) => {
    const { data, error } = await supabase.rpc("admin_update_profile", {
      p_profile_id: profileId,
      p_full_name: input.fullName.trim(),
      p_phone: emptyToNull(input.phone),
      p_role_id: input.roleId,
      p_manager_profile_id: emptyToNull(input.managerProfileId),
      p_status: input.status,
      p_updated_by_profile_id: actorProfileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchManagedUserById(supabase, String(data));
  },
});

export const getManagerCandidates = createService({
  name: "getManagerCandidates",
  execute: async (supabase) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("profile_id, full_name, roles(code)")
      .eq("status", "active")
      .is("archived_at", null)
      .order("full_name", { ascending: true });

    if (error) {
      throw mapDatabaseError(error);
    }

    return (data ?? [])
      .filter((row) => {
        const role = row.roles;
        const code =
          role && !Array.isArray(role) ? String(role.code) : "";
        return MANAGER_ASSIGNABLE_ROLE_CODES.includes(code);
      })
      .map((row) => ({
        profileId: String(row.profile_id),
        fullName: String(row.full_name),
      }));
  },
});
