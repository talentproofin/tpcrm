/**
 * Access denied reasons after successful authentication.
 */
export const ACCESS_REASONS = {
  PROFILE_MISSING: "profile_missing",
  INVITED: "invited",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

/**
 * User-facing messages for the Access Pending page.
 * @type {Record<string, string>}
 */
export const ACCESS_DENIED_MESSAGES = {
  [ACCESS_REASONS.PROFILE_MISSING]:
    "Your account has not been activated.\nPlease contact your administrator.",
  [ACCESS_REASONS.INVITED]:
    "Your account invitation is pending.\nPlease contact your administrator.",
  [ACCESS_REASONS.INACTIVE]:
    "Your account is inactive.\nPlease contact your administrator.",
  [ACCESS_REASONS.SUSPENDED]:
    "Your account has been suspended.\nPlease contact your administrator.",
};

/**
 * @param {string | null | undefined} reason
 * @returns {string}
 */
export function getAccessDeniedMessage(reason) {
  if (reason && ACCESS_DENIED_MESSAGES[reason]) {
    return ACCESS_DENIED_MESSAGES[reason];
  }

  return ACCESS_DENIED_MESSAGES[ACCESS_REASONS.PROFILE_MISSING];
}
