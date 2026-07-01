import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * @param {{
 *   title: string,
 *   value: number,
 * }} props
 */
function SummaryMetric({ title, value }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

/**
 * @param {{
 *   summary: import('../types/report').OrganizationSummary,
 *   compact?: boolean,
 * }} props
 */
export function OrganizationSummarySection({ summary, compact = false }) {
  const metrics = [
    { title: "Calls Attempted", value: summary.callsAttempted },
    { title: "Calls Connected", value: summary.callsConnected },
    { title: "Not Answered", value: summary.notAnswered },
    { title: "Busy", value: summary.busy },
    { title: "Interested", value: summary.interested },
    { title: "Not Interested", value: summary.notInterested },
    { title: "Email Activities", value: summary.emailActivities },
    { title: "WhatsApp Activities", value: summary.whatsappActivities },
    { title: "LinkedIn Activities", value: summary.linkedinActivities },
    { title: "Demo Scheduled", value: summary.demoScheduled },
    { title: "Demo Completed", value: summary.demoCompleted },
    { title: "Activities Logged", value: summary.activitiesLogged },
    { title: "Completed Follow-ups", value: summary.completedFollowUps },
    { title: "Overdue Follow-ups", value: summary.overdueFollowUps },
  ];

  const visibleMetrics = compact ? metrics.slice(0, 6) : metrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Organization Summary</CardTitle>
        <CardDescription>
          Today&apos;s business activity across the organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleMetrics.map((metric) => (
            <SummaryMetric
              key={metric.title}
              title={metric.title}
              value={metric.value}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
