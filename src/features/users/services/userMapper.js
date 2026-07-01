/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/user').ManagedUser}
 */
export function mapManagedUserRow(row) {
  const role = row.roles;
  const manager = row.manager_profile;

  return {
    profileId: String(row.profile_id),
    authUserId: row.auth_user_id ? String(row.auth_user_id) : null,
    fullName: String(row.full_name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : null,
    status: /** @type {import('../types/user').UserStatus} */ (row.status),
    managerProfileId: row.manager_profile_id
      ? String(row.manager_profile_id)
      : null,
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
    manager:
      manager && !Array.isArray(manager)
        ? {
            profileId: String(manager.profile_id),
            fullName: String(manager.full_name),
          }
        : null,
  };
}

export const MANAGED_USER_SELECT = `profile_id, auth_user_id, full_name, email, phone, status,
  manager_profile_id, last_login_at, created_at,
  roles(id, code, name),
  manager_profile:profiles!profiles_manager_profile_id_fkey(profile_id, full_name)`;
