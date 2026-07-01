"use client";

import { useEffect, useState } from "react";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getProfileByAuthUserId } from "@/features/auth/services/profileService";

/**
 * @returns {{ profile: import('@/features/auth/types/auth').AuthProfile | null, loading: boolean, error: string | null }}
 */
export function useCurrentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const supabase = getAuthBrowserClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (!cancelled) {
            setProfile(null);
            setError("You must be signed in to continue.");
          }
          return;
        }

        const loadedProfile = await getProfileByAuthUserId(supabase, user.id);

        if (!cancelled) {
          setProfile(loadedProfile);
          if (!loadedProfile) {
            setError("No active profile found for your account.");
          }
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
