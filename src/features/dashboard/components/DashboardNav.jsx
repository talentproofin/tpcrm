"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
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
import { AUTH_ROUTES } from "@/features/auth/constants/routes";

/**
 * @param {{ href: string, isActive: boolean, children: React.ReactNode }} props
 */
function NavLink({ href, isActive, children }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-md px-2 py-1 transition-colors",
        isActive
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function DashboardNav() {
  const pathname = usePathname();
  const { profile } = useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);

  const isFollowUpsActive = pathname.startsWith(FOLLOWUP_ROUTES.WORKSPACE);
  const isLeadsActive = pathname.startsWith(LEAD_ROUTES.LIST);
  const isDashboardActive = pathname === "/dashboard";
  const isDailyReportActive = pathname.startsWith(REPORT_ROUTES.DAILY);
  const isUsersActive = pathname.startsWith(USER_ROUTES.LIST);
  const isSettingsActive = pathname.startsWith(SETTINGS_ROUTES.ROOT);
  const isAccountActive = pathname.startsWith(AUTH_ROUTES.ACCOUNT);

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
    <nav
      className="flex flex-wrap items-center gap-1 text-sm sm:gap-2"
      aria-label="Main navigation"
    >
      <NavLink href={FOLLOWUP_ROUTES.WORKSPACE} isActive={isFollowUpsActive}>
        Follow-ups
      </NavLink>
      <NavLink href={LEAD_ROUTES.LIST} isActive={isLeadsActive}>
        Leads
      </NavLink>
      <NavLink href="/dashboard" isActive={isDashboardActive}>
        Dashboard
      </NavLink>
      {canAccessDailyReport(roleCode) ? (
        <NavLink href={REPORT_ROUTES.DAILY} isActive={isDailyReportActive}>
          Daily Report
        </NavLink>
      ) : null}
      {canAccessUserManagement(roleCode) ? (
        <NavLink href={USER_ROUTES.LIST} isActive={isUsersActive}>
          Users
        </NavLink>
      ) : null}
      {canAccessSettings(roleCode) ? (
        <NavLink href={SETTINGS_ROUTES.ORGANIZATION} isActive={isSettingsActive}>
          Settings
        </NavLink>
      ) : null}
      <NavLink href={AUTH_ROUTES.ACCOUNT} isActive={isAccountActive}>
        Account
      </NavLink>
    </nav>
  );
}
