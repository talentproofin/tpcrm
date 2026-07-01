"use client";

import { useEffect, useState } from "react";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getRoleById } from "@/features/auth/services/profileService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";

/**
 * @returns {{
 *   profile: import('@/features/auth/types/auth').AuthProfile | null,
 *   role: import('@/features/auth/types/auth').AuthRole | null,
 *   loading: boolean,
 *   error: string | null,
 * }}
 */
export function useDashboardIdentity() {
  const { profile, loading: profileLoading, error: profileError } =
    useCurrentProfile();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [roleError, setRoleError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      if (!profile) {
        if (!cancelled) {
          setRole(null);
          setRoleLoading(false);
        }
        return;
      }

      setRoleLoading(true);
      setRoleError(null);

      try {
        const supabase = getAuthBrowserClient();
        const loadedRole = await getRoleById(supabase, profile.roleId);

        if (!cancelled) {
          setRole(loadedRole);
          if (!loadedRole) {
            setRoleError("Assigned role could not be found.");
          }
        }
      } catch {
        if (!cancelled) {
          setRole(null);
          setRoleError("Unable to load your role. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setRoleLoading(false);
        }
      }
    }

    if (!profileLoading) {
      loadRole();
    }

    return () => {
      cancelled = true;
    };
  }, [profile, profileLoading]);

  return {
    profile,
    role,
    loading: profileLoading || roleLoading,
    error: profileError ?? roleError,
  };
}
