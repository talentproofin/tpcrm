"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { getManagerDashboard } from "../services/dashboardService";
import { MetricGrid } from "./MetricCard";

/**
 * @param {{ profileId: string }} props
 */
export function ManagerDashboard({ profileId }) {
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
        await getManagerDashboard(supabase, profileId);

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
  }, [profileId, reloadKey]);

  if (loading) {
    return <MetricGridSkeleton count={6} />;
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
        description="Team metrics are unavailable right now. Try refreshing the page."
      />
    );
  }

  return <MetricGrid metrics={data.metrics} />;
}
