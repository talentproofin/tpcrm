import { mapAuthErrorCode } from "../utils/authErrors";
import { createAuthError } from "../utils/createAuthError";
import { getAuthBrowserClient } from "./authClient";
import { resolveIdentityAfterLogin } from "./identityService";

/**
 * Signs in with email and password, then resolves CRM identity.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<import('../types/auth').SignInResult>}
 */
export async function signIn({ email, password }) {
  const supabase = getAuthBrowserClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (authError) {
    return {
      data: null,
      error: authError,
      accessDenied: false,
      accessReason: null,
      code: mapAuthErrorCode(authError),
    };
  }

  const user = authData.user;
  const session = authData.session;

  if (!user || !session) {
    return {
      data: null,
      error: new Error("Authenticated session is missing."),
      accessDenied: false,
      accessReason: null,
      code: mapAuthErrorCode(null),
    };
  }

  try {
    const resolution = await resolveIdentityAfterLogin(supabase, user, session);

    if (resolution.accessDenied) {
      return {
        data: null,
        error: null,
        accessDenied: true,
        accessReason: resolution.accessReason,
        code: null,
      };
    }

    return {
      data: resolution.identity,
      error: null,
      accessDenied: false,
      accessReason: null,
      code: null,
    };
  } catch (err) {
    const error =
      err instanceof Error ? err : createAuthError("unknown", String(err));

    return {
      data: null,
      error,
      accessDenied: false,
      accessReason: null,
      code: mapAuthErrorCode(error),
    };
  }
}
