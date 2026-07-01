"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getRoleById } from "@/features/auth/services/profileService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { canAccessUserManagement } from "@/features/users/constants/permissions";
import { USER_ROUTES } from "@/features/users/constants/routes";
import { FOLLOWUP_ROUTES } from "@/features/followups/constants/routes";
import { LEAD_ROUTES } from "@/features/leads/constants/routes";
import { REPORT_ROUTES } from "@/features/reports/constants/routes";
import { canAccessDailyReport } from "@/features/reports/constants/roles";
import { canAccessSettings } from "@/features/settings/constants/permissions";
import { SETTINGS_ROUTES } from "@/features/settings/constants/routes";

export function DashboardNav() {
  const { profile } = useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      if (!profile) {
        return;
      }

      const supabase = getAuthBrowserClient();
      const role = await getRoleById(supabase, profile.roleId);

      if (!cancelled) {
        setRoleCode(role?.code ?? null);
      }
    }

    loadRole();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  return (
    <nav className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:gap-4">
      <Link
        href={FOLLOWUP_ROUTES.WORKSPACE}
        className="transition-colors hover:text-foreground"
      >
        Follow-ups
      </Link>
      <Link
        href={LEAD_ROUTES.LIST}
        className="transition-colors hover:text-foreground"
      >
        Leads
      </Link>
      <Link href="/dashboard" className="transition-colors hover:text-foreground">
        Dashboard
      </Link>
      {canAccessDailyReport(roleCode) ? (
        <Link
          href={REPORT_ROUTES.DAILY}
          className="transition-colors hover:text-foreground"
        >
          Daily Report
        </Link>
      ) : null}
      {canAccessUserManagement(roleCode) ? (
        <Link
          href={USER_ROUTES.LIST}
          className="transition-colors hover:text-foreground"
        >
          Users
        </Link>
      ) : null}
      {canAccessSettings(roleCode) ? (
        <Link
          href={SETTINGS_ROUTES.ORGANIZATION}
          className="transition-colors hover:text-foreground"
        >
          Settings
        </Link>
      ) : null}
    </nav>
  );
}
