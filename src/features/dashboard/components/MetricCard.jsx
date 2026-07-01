import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * @param {{
 *   metric: import('../types/dashboard').DashboardMetric,
 * }} props
 */
export function MetricCard({ metric }) {
  const content = (
    <Card className={metric.href ? "transition-colors hover:bg-muted/40" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
      </CardContent>
    </Card>
  );

  if (!metric.href) {
    return content;
  }

  return (
    <Link href={metric.href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}

/**
 * @param {{
 *   metrics: import('../types/dashboard').DashboardMetric[],
 * }} props
 */
export function MetricGrid({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}
