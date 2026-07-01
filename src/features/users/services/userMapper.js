/**
 * @param {Record<string, unknown>} row
 * @param {Record<string, { profile_id: string, full_name: string }>} [managersById]
 * @returns {import('../types/user').ManagedUser}
 */
export function mapManagedUserRow(row, managersById = {}) {
  const role = row.roles;
  const managerProfileId = row.manager_profile_id
    ? String(row.manager_profile_id)
    : null;
  const managerRow = managerProfileId ? managersById[managerProfileId] : null;

  return {
    profileId: String(row.profile_id),
    authUserId: row.auth_user_id ? String(row.auth_user_id) : null,
    fullName: String(row.full_name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : null,
    status: /** @type {import('../types/user').UserStatus} */ (row.status),
    managerProfileId,
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
    createdAt: String(row.created_at),
    role:
      role && !Array.isArray(role)
        ? {
            id: String(role.id),
            code: String(role.code),
            name: String(role.name),
          }
        : null,
    manager: managerRow
      ? {
          profileId: String(managerRow.profile_id),
          fullName: String(managerRow.full_name),
        }
      : null,
  };
}

export const MANAGED_USER_SELECT = `profile_id, auth_user_id, full_name, email, phone, status,
  manager_profile_id, last_login_at, created_at,
  roles(id, code, name)`;

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Array<Record<string, unknown>>} rows
 */
export async function loadManagersForRows(supabase, rows) {
  const managerIds = [
    ...new Set(
      rows
        .map((row) => row.manager_profile_id)
        .filter((id) => id != null)
        .map((id) => String(id))
    ),
  ];

  if (managerIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, full_name")
    .in("profile_id", managerIds);

  if (error) {
    throw new Error(error.message);
  }

  /** @type {Record<string, { profile_id: string, full_name: string }>} */
  const managersById = {};

  for (const manager of data ?? []) {
    managersById[String(manager.profile_id)] = {
      profile_id: String(manager.profile_id),
      full_name: String(manager.full_name),
    };
  }

  return managersById;
}
