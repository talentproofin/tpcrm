"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getRoleById } from "@/features/auth/services/profileService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { canAccessSettings } from "../constants/permissions";
import { getSystemInformation } from "../services/systemInfoService";

function formatTimestamp(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

/**
 * @param {{ label: string, value: string | number }} props
 */
function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

/**
 * @param {{
 *   nodeVersion?: string,
 *   nextVersion?: string,
 * }} props
 */
export function SystemInformationView({ nodeVersion = "—", nextVersion = "—" }) {
  const { profile } = useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canAccess = canAccessSettings(roleCode);

  useEffect(() => {
    let cancelled = false;

    async function loadIdentity() {
      if (!profile) {
        return;
      }

      const supabase = getAuthBrowserClient();
      const role = await getRoleById(supabase, profile.roleId);

      if (!cancelled) {
        setRoleCode(role?.code ?? null);
      }
    }

    loadIdentity();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    async function loadInfo() {
      if (!canAccess) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const supabase = getAuthBrowserClient();
      const { data, error: loadError } = await getSystemInformation(supabase, {
        nodeVersion,
        nextVersion,
      });

      if (cancelled) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        setInfo(null);
      } else {
        setInfo(data);
      }

      setLoading(false);
    }

    if (roleCode) {
      loadInfo();
    }

    return () => {
      cancelled = true;
    };
  }, [canAccess, nextVersion, nodeVersion, roleCode]);

  if (roleCode && !canAccess) {
    return (
      <EmptyState
        icon={Info}
        title="Access restricted"
        description="System information is not available for your role."
      />
    );
  }

  if (loading) {
    return <TableSkeleton rows={4} columns={2} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System information</CardTitle>
        <CardDescription>
          Read-only application, environment, and usage details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoField label="Application version" value={info?.applicationVersion ?? "—"} />
          <InfoField label="Environment" value={info?.environment ?? "—"} />
          <InfoField label="Build date" value={formatTimestamp(info?.buildDate)} />
          <InfoField label="Node version" value={info?.nodeVersion ?? "—"} />
          <InfoField label="Next.js version" value={info?.nextVersion ?? "—"} />
          <InfoField
            label="Database migration version"
            value={info?.databaseMigrationVersion || "—"}
          />
          <InfoField label="Current timezone" value={info?.currentTimezone || "—"} />
          <InfoField label="Total active users" value={info?.totalActiveUsers ?? 0} />
          <InfoField label="Total leads" value={info?.totalLeads ?? 0} />
          <InfoField label="Total activities" value={info?.totalActivities ?? 0} />
          <InfoField label="Total follow-ups" value={info?.totalFollowups ?? 0} />
        </div>
      </CardContent>
    </Card>
  );
}
