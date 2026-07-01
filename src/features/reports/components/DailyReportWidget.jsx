"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { REPORT_ROUTES } from "../constants/routes";
import { getDailyReport } from "../services/reportService";

/**
 * Condensed daily report summary for the CEO dashboard.
 */
export function DailyReportWidget() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReport = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const reportDateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Daily Report
          </CardTitle>
          <CardDescription>{reportDateLabel}</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="print:hidden">
          <Link href={REPORT_ROUTES.DAILY}>View full report</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <MetricGridSkeleton count={3} />
        ) : error ? (
          <ErrorState
            title="Report unavailable"
            message={error}
            onRetry={loadReport}
          />
        ) : report ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WidgetMetric
              label="Calls Attempted"
              value={report.organizationSummary.callsAttempted}
            />
            <WidgetMetric
              label="Activities Logged"
              value={report.organizationSummary.activitiesLogged}
            />
            <WidgetMetric
              label="Interested"
              value={report.organizationSummary.interested}
            />
            <WidgetMetric
              label="Completed Follow-ups"
              value={report.organizationSummary.completedFollowUps}
            />
            <WidgetMetric
              label="Overdue Follow-ups"
              value={report.organizationSummary.overdueFollowUps}
            />
            <WidgetMetric
              label="Demos Scheduled"
              value={report.organizationSummary.demoScheduled}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * @param {{ label: string, value: number }} props
 */
function WidgetMetric({ label, value }) {
  return (
    <div className="rounded-md border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
