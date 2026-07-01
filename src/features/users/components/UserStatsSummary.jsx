"use client";

import { useEffect, useState } from "react";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { MetricGrid } from "@/features/dashboard/components/MetricCard";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { getUserMetrics } from "../services/userService";

export function UserStatsSummary() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      setLoading(true);
      setError(null);

      const supabase = getAuthBrowserClient();
      const { data, error: loadError } = await getUserMetrics(supabase);

      if (cancelled) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        setMetrics(null);
      } else {
        setMetrics(data);
      }

      setLoading(false);
    }

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <MetricGridSkeleton count={3} />;
  }

  if (error) {
    return (
      <ErrorState title="Unable to load user statistics" message={error} />
    );
  }

  return (
    <MetricGrid
      metrics={[
        {
          id: "total_users",
          label: "Total Users",
          value: metrics?.totalUsers ?? 0,
        },
        {
          id: "active_users",
          label: "Active Users",
          value: metrics?.activeUsers ?? 0,
        },
        {
          id: "inactive_users",
          label: "Inactive Users",
          value: metrics?.inactiveUsers ?? 0,
        },
      ]}
    />
  );
}
