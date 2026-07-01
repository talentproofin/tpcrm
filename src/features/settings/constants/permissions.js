import {
  SETTINGS_ACCESS_ROLE_CODES,
  SETTINGS_WRITE_ROLE_CODES,
} from "./index";

/**
 * @param {string | null | undefined} roleCode
 * @returns {boolean}
 */
export function canAccessSettings(roleCode) {
  return SETTINGS_ACCESS_ROLE_CODES.includes(roleCode ?? "");
}

/**
 * @param {string | null | undefined} roleCode
 * @returns {boolean}
 */
export function canManageSettings(roleCode) {
  return SETTINGS_WRITE_ROLE_CODES.includes(roleCode ?? "");
}
