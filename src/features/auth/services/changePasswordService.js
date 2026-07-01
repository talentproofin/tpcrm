import { createService } from "@/services/infrastructure";
import { AUTH_ERROR_CODES } from "../constants/errors";
import { createAuthError } from "../utils/createAuthError";
import { getAuthBrowserClient } from "./authClient";

/**
 * @param {import('@supabase/supabase-js').AuthError | Error} error
 * @returns {never}
 */
function throwMappedPasswordError(error) {
  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) {
    throw createAuthError(
      AUTH_ERROR_CODES.INVALID_CURRENT_PASSWORD,
      "Current password is incorrect."
    );
  }

  if (
    message.includes("different from the old password") ||
    message.includes("should be different")
  ) {
    throw createAuthError(
      AUTH_ERROR_CODES.PASSWORD_UNCHANGED,
      "New password must be different from your current password."
    );
  }

  if (message.includes("password") && message.includes("at least")) {
    throw createAuthError(
      AUTH_ERROR_CODES.WEAK_PASSWORD,
      "Password does not meet security requirements."
    );
  }

  throw createAuthError(
    AUTH_ERROR_CODES.UNKNOWN,
    "Unable to update password. Please try again."
  );
}

/**
 * @param {{ currentPassword: string, newPassword: string }} input
 */
async function executeChangePassword(input) {
  const supabase = getAuthBrowserClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    throw createAuthError(
      AUTH_ERROR_CODES.SESSION_MISSING,
      "You must be signed in to change your password."
    );
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.currentPassword,
  });

  if (verifyError) {
    throwMappedPasswordError(verifyError);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: input.newPassword,
  });

  if (updateError) {
    throwMappedPasswordError(updateError);
  }
}

export const changePassword = createService({
  name: "auth.changePassword",
  execute: executeChangePassword,
});
