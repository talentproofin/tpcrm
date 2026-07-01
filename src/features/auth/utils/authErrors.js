import { AUTH_ERROR_CODES } from "../constants/errors";

/**
 * Maps Supabase Auth error messages to application error codes.
 * @param {import('@supabase/supabase-js').AuthError | Error | null} error
 * @returns {string}
 */
export function mapAuthErrorCode(error) {
  if (!error) return AUTH_ERROR_CODES.UNKNOWN;

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) {
    return AUTH_ERROR_CODES.INVALID_CREDENTIALS;
  }

  if (message.includes("email not confirmed")) {
    return AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED;
  }

  if (message.includes("user not found")) {
    return AUTH_ERROR_CODES.USER_NOT_FOUND;
  }

  if (message.includes("jwt expired") || message.includes("session expired")) {
    return AUTH_ERROR_CODES.SESSION_EXPIRED;
  }

  return AUTH_ERROR_CODES.UNKNOWN;
}

/**
 * Returns a user-safe error message for display in UI (Part 2+).
 * @param {string} code
 * @returns {string}
 */
export function getAuthErrorMessage(code) {
  switch (code) {
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return "Invalid email or password.";
    case AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED:
      return "Please confirm your email before signing in.";
    case AUTH_ERROR_CODES.USER_NOT_FOUND:
      return "No account found with that email.";
    case AUTH_ERROR_CODES.SESSION_EXPIRED:
      return "Your session has expired. Please sign in again.";
    case AUTH_ERROR_CODES.SESSION_MISSING:
      return "You must be signed in to continue.";
    default:
      return "Something went wrong. Please try again.";
  }
}
