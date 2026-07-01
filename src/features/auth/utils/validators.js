import { MIN_PASSWORD_LENGTH } from "../constants/validation";

/**
 * Shared validation helpers for auth input.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string | undefined | null} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return EMAIL_PATTERN.test(email.trim());
}

/**
 * @param {string | undefined | null} password
 * @returns {boolean}
 */
export function isValidPasswordLength(password) {
  if (!password || typeof password !== "string") return false;
  return password.length >= MIN_PASSWORD_LENGTH;
}
