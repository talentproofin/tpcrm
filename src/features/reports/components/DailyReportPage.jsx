"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Printer, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getRoleById } from "@/features/auth/services/profileService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { canAccessDailyReport } from "../constants/roles";
import { getDailyReport } from "../services/reportService";
import { OrganizationSummarySection } from "./OrganizationSummarySection";
import { TeamSummarySection } from "./TeamSummarySection";

export function DailyReportPage() {
  const { profile, loading: profileLoading, error: profileError } =
    useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      if (!profile) {
        if (!cancelled) {
          setRoleCode(null);
          setRoleLoading(false);
        }
        return;
      }

      setRoleLoading(true);

      try {
        const supabase = getAuthBrowserClient();
        const role = await getRoleById(supabase, profile.roleId);

        if (!cancelled) {
          setRoleCode(role?.code ?? null);
        }
      } catch {
        if (!cancelled) {
          setRoleCode(null);
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

  const loadReport = useCallback(async () => {
    if (!roleCode || !canAccessDailyReport(roleCode)) {
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getDailyReport(supabase);

    if (loadError) {
      setError(loadError.message);
      setReport(null);
    } else {
      setReport(data);
    }

    setLoading(false);
  }, [roleCode]);

  useEffect(() => {
    if (!roleLoading && roleCode) {
      loadReport();
    }
  }, [roleCode, roleLoading, loadReport]);

  if (profileLoading || roleLoading) {
    return <MetricGridSkeleton count={6} />;
  }

  if (profileError) {
    return <ErrorState title="Profile required" message={profileError} />;
  }

  if (!roleCode || !canAccessDailyReport(roleCode)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Report access restricted"
        description="The daily report is available to CEO and Admin users only."
      />
    );
  }

  const reportDateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:block">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight print:text-xl">
            Daily Business Report
          </h1>
          <p className="text-sm text-muted-foreground print:text-black">
            {reportDateLabel} · Generated from CRM activity data
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="print:hidden"
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Print report
        </Button>
      </div>

      {loading ? (
        <MetricGridSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Unable to generate report"
          message={error}
          onRetry={loadReport}
        />
      ) : report ? (
        <div className="space-y-6 print:space-y-4">
          <OrganizationSummarySection summary={report.organizationSummary} />
          <TeamSummarySection rows={report.teamSummary} />
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No report data"
          description="Today's report could not be generated. Try again in a moment."
          action={
            <Button type="button" variant="outline" onClick={loadReport}>
              Regenerate report
            </Button>
          }
        />
      )}
    </div>
  );
}
