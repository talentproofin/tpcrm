/**
 * Maps server/API errors to safe client-facing messages.
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
    message.includes("email already exists") ||
    message.includes("User already registered")
  ) {
    return "A user with this email already exists.";
  }

  if (message.includes("User not found")) {
    return "User not found.";
  }

  if (message.includes("Invalid manager assignment")) {
    return "The selected manager must be an active Admin or Manager.";
  }

  if (message.includes("Invalid role assignment")) {
    return "The selected role is not valid.";
  }

  if (
    message.includes("Invalid API key") ||
    message.includes("Invalid JWT") ||
    message.includes("invalid claim")
  ) {
    return "Server authentication is misconfigured. Check SUPABASE_SERVICE_ROLE_KEY.";
  }

  if (message.includes("Signups not allowed")) {
    return "User invitations are disabled in Supabase Auth settings.";
  }

  if (message.includes("rate limit") || message.includes("Rate limit")) {
    return "Too many invite attempts. Please wait and try again.";
  }

  if (message.includes("redirect") || message.includes("Redirect")) {
    return "Invite redirect URL is not allowed. Add your app URL in Supabase Auth settings.";
  }

  if (message.includes("Only admins can create users")) {
    return "Only admins can create users.";
  }

  if (
    message.includes("Password should be at least") ||
    message.includes("weak password")
  ) {
    return "Password does not meet security requirements.";
  }

  return fallback;
}
