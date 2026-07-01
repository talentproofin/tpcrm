import {
  USER_MANAGEMENT_ACCESS_ROLE_CODES,
  USER_MANAGEMENT_WRITE_ROLE_CODES,
} from "./index";

/**
 * @param {string | null | undefined} roleCode
 * @returns {boolean}
 */
export function canAccessUserManagement(roleCode) {
  return USER_MANAGEMENT_ACCESS_ROLE_CODES.includes(roleCode ?? "");
}

/**
 * @param {string | null | undefined} roleCode
 * @returns {boolean}
 */
export function canManageUsers(roleCode) {
  return USER_MANAGEMENT_WRITE_ROLE_CODES.includes(roleCode ?? "");
}
