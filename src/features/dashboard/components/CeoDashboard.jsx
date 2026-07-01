"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { DailyReportWidget } from "@/features/reports/components/DailyReportWidget";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { getCeoDashboard } from "../services/dashboardService";
import { MetricGrid } from "./MetricCard";
import { PipelineChart } from "./PipelineChart";
import { RecentActivitiesTable } from "./RecentActivitiesTable";
import { TeamPerformanceTable } from "./TeamPerformanceTable";

export function CeoDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      const supabase = getAuthBrowserClient();
      const { data: dashboardData, error: loadError } =
        await getCeoDashboard(supabase);

      if (cancelled) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        setData(null);
      } else {
        setData(dashboardData);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="space-y-8">
        <MetricGridSkeleton count={8} />
        <MetricGridSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={error}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="No dashboard data"
        description="Dashboard metrics are unavailable right now. Try refreshing the page."
      />
    );
  }

  return (
    <div className="space-y-8">
      <DailyReportWidget />
      <MetricGrid metrics={data.metrics} />
      <PipelineChart stages={data.pipeline} />
      <RecentActivitiesTable activities={data.recentActivities} />
      <TeamPerformanceTable rows={data.teamPerformance} />
    </div>
  );
}
