import { createService } from "@/services/infrastructure";
import { getAuthBrowserClient } from "./authClient";

async function executeSignOut() {
  const supabase = getAuthBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export const signOut = createService({
  name: "auth.signOut",
  execute: executeSignOut,
});
