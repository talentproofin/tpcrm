/**
 * Authentication error codes for consistent handling across services and UI.
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "invalid_credentials",
  INVALID_CURRENT_PASSWORD: "invalid_current_password",
  EMAIL_NOT_CONFIRMED: "email_not_confirmed",
  USER_NOT_FOUND: "user_not_found",
  SESSION_EXPIRED: "session_expired",
  SESSION_MISSING: "session_missing",
  PROFILE_NOT_ACTIVATED: "profile_not_activated",
  ROLE_MISSING: "role_missing",
  PASSWORD_UNCHANGED: "password_unchanged",
  WEAK_PASSWORD: "weak_password",
  UNKNOWN: "unknown",
};
