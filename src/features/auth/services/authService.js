import { createService } from "@/services/infrastructure";
import { verifySupabaseEnvironment } from "./authClient";
import { signIn } from "./signInService";
import { signOut as runSignOut } from "./signOutService";

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

  signOut: createService({
    name: "auth.signOut",
    execute: async () => {
      const { error } = await runSignOut();
      if (error) {
        throw error;
      }
    },
  }),
};

export { verifySupabaseEnvironment, getAuthBrowserClient } from "./authClient";

export { signIn } from "./signInService";

export { signOut } from "./signOutService";
