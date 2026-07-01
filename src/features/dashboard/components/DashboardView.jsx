"use client";

import { ShieldAlert } from "lucide-react";
import {
  DASHBOARD_VARIANTS,
  resolveDashboardVariant,
} from "../constants/roles";
import { useDashboardIdentity } from "../hooks/useDashboardIdentity";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { CeoDashboard } from "./CeoDashboard";
import { ExecutiveDashboard } from "./ExecutiveDashboard";
import { ManagerDashboard } from "./ManagerDashboard";

const DASHBOARD_TITLES = {
  [DASHBOARD_VARIANTS.CEO]: "CEO Dashboard",
  [DASHBOARD_VARIANTS.MANAGER]: "Manager Dashboard",
  [DASHBOARD_VARIANTS.EXECUTIVE]: "Executive Dashboard",
};

export function DashboardView() {
  const { profile, role, loading, error } = useDashboardIdentity();

  if (loading) {
    return <MetricGridSkeleton count={4} />;
  }

  if (error) {
    return <ErrorState title="Dashboard unavailable" message={error} />;
  }

  if (!profile || !role) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Dashboard unavailable"
        description="Your account does not have an active profile or role assigned."
      />
    );
  }

  const variant = resolveDashboardVariant(role.code);
  const title = DASHBOARD_TITLES[variant];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {profile.fullName}. Metrics reflect data visible to your
          role.
        </p>
      </div>

      {variant === DASHBOARD_VARIANTS.CEO ? <CeoDashboard /> : null}
      {variant === DASHBOARD_VARIANTS.MANAGER ? (
        <ManagerDashboard profileId={profile.profileId} />
      ) : null}
      {variant === DASHBOARD_VARIANTS.EXECUTIVE ? (
        <ExecutiveDashboard profileId={profile.profileId} />
      ) : null}
    </div>
  );
}
