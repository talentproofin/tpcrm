import { memo } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ACTIVITY_DIRECTION_LABELS } from "../constants/direction";

/**
 * @param {{
 *   activities: import('../types/activity').Activity[],
 *   onLogActivity?: () => void,
 * }} props
 */
export const ActivityList = memo(function ActivityList({
  activities,
  onLogActivity,
}) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No activities yet"
        description="Log the first touchpoint to start tracking interactions with this lead."
        action={
          onLogActivity ? (
            <Button type="button" size="sm" onClick={onLogActivity}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Log activity
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                {activity.activityType?.name ?? "Activity"}
              </CardTitle>
              {activity.activityOutcome ? (
                <Badge variant="secondary">{activity.activityOutcome.name}</Badge>
              ) : null}
              {activity.direction ? (
                <Badge variant="outline">
                  {ACTIVITY_DIRECTION_LABELS[activity.direction]}
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              {new Date(activity.occurredAt).toLocaleString()} · Performed by{" "}
              {activity.performedBy?.fullName ?? "Unknown"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Remark
              </p>
              <p className="mt-1 whitespace-pre-wrap">{activity.remark}</p>
            </div>

            {activity.nextFollowUp ? (
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next follow-up
                </p>
                <p className="mt-1">
                  Due {new Date(activity.nextFollowUp.dueAt).toLocaleString()}
                </p>
                <p>
                  Assigned to {activity.nextFollowUp.assignedTo.fullName} ·{" "}
                  {activity.nextFollowUp.status.name}
                </p>
                {activity.nextFollowUp.notes ? (
                  <p className="mt-2 text-muted-foreground">
                    {activity.nextFollowUp.notes}
                  </p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
