"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/features/auth/constants/routes";
import { signOut } from "@/features/auth/services/signOutService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";

export function DashboardUserMenu() {
  const router = useRouter();
  const { profile, loading } = useCurrentProfile();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    const { error } = await signOut();

    setSigningOut(false);

    if (error) {
      toast.error("Unable to sign out. Please try again.");
      return;
    }

    router.replace(AUTH_ROUTES.LOGIN);
    router.refresh();
  }

  if (loading) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {profile ? (
        <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:inline">
          {profile.fullName}
        </span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden="true" />
        )}
        Sign out
      </Button>
    </div>
  );
}
