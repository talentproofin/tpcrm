import { LOG_LEVELS } from "@/constants/logging";

const VALID_LOG_LEVELS = Object.values(LOG_LEVELS);

/**
 * Validates that a required environment variable is present and non-empty.
 * @param {string} key
 * @param {string | undefined} value
 * @returns {string}
 */
export function requireEnv(key, value) {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env.local and set a value.`
    );
  }
  return value;
}

/**
 * Returns an optional environment variable with a fallback.
 * @param {string | undefined} value
 * @param {string} fallback
 * @returns {string}
 */
export function optionalEnv(value, fallback) {
  if (!value || value.trim() === "") {
    return fallback;
  }
  return value;
}

/**
 * Validates that a URL string is well-formed.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates that a log level string is recognized.
 * @param {string} level
 * @returns {boolean}
 */
export function isValidLogLevel(level) {
  return VALID_LOG_LEVELS.includes(level);
}
