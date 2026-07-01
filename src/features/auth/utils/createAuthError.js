/**
 * @param {string} code
 * @param {string} message
 * @returns {Error}
 */
export function createAuthError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
