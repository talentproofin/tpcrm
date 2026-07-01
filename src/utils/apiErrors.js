/**
 * Returns a generic API error message for clients.
 * Full errors should be logged server-side only.
 * @param {unknown} error
 * @param {string} fallback
 */
export function toApiErrorMessage(error, fallback) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message;

  if (
    message.includes("already been registered") ||
    message.includes("already exists") ||
    message.includes("email already exists")
  ) {
    return "A user with this email already exists.";
  }

  if (message.includes("User not found")) {
    return "User not found.";
  }

  return fallback;
}
