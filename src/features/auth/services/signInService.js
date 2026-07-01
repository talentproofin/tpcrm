import { mapAuthErrorCode } from "../utils/authErrors";
import { getAuthBrowserClient } from "./authClient";

/**
 * Signs in with email and password via Supabase Auth.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<import('../types/auth').SignInResult>}
 */
export async function signIn({ email, password }) {
  const supabase = getAuthBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return {
      data: null,
      error,
      code: mapAuthErrorCode(error),
    };
  }

  return {
    data: data.session,
    error: null,
    code: null,
  };
}
