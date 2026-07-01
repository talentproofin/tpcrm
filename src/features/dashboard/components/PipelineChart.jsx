import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LEAD_ROUTES } from "@/features/leads/constants/routes";
import { leadListHref } from "../constants/routes";

/**
 * @param {{
 *   stages: import('../types/dashboard').PipelineStageMetric[],
 * }} props
 */
export function PipelineChart({ stages }) {
  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);

  if (stages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Pipeline by Stage</CardTitle>
          <CardDescription>
            Pipeline distribution across active lead stages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="No pipeline data"
            description="Leads will appear here once they are added to your pipeline."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href={LEAD_ROUTES.NEW}>Create lead</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lead Pipeline by Stage</CardTitle>
        <CardDescription>
          Open a stage to view matching leads in the lead list.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage) => {
          const width = `${Math.max((stage.count / maxCount) * 100, 8)}%`;

          return (
            <Link
              key={stage.stageId}
              href={leadListHref({ stageId: stage.stageId })}
              className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stageName}</span>
                  <span className="text-muted-foreground">{stage.count}</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-primary transition-all"
                    style={{ width }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
