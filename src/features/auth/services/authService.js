import { createService } from "@/services/infrastructure";
import { verifySupabaseEnvironment } from "./authClient";
import { signIn } from "./signInService";

/**
 * Authentication service facade.
 */
export const authService = {
  verifyEnvironment: createService({
    name: "auth.verifyEnvironment",
    execute: async () => verifySupabaseEnvironment(),
  }),

  signIn: createService({
    name: "auth.signIn",
    execute: async (credentials) => {
      const result = await signIn(credentials);
      if (result.error) {
        throw result.error;
      }
      return result;
    },
  }),
};

export { verifySupabaseEnvironment, getAuthBrowserClient } from "./authClient";

export { signIn } from "./signInService";
