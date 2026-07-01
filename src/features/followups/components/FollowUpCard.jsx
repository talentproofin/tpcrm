import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LEAD_ROUTES } from "@/features/leads/constants/routes";
import { StageBadge } from "@/features/leads/components/StageBadge";
import { formatPreviousActivitySummary } from "../services/followUpMapper";

/**
 * @param {{
 *   item: import('../types/followUp').FollowUpWorkspaceItem,
 *   onComplete: (item: import('../types/followUp').FollowUpWorkspaceItem) => void,
 * }} props
 */
export function FollowUpCard({ item, onComplete }) {
  const phone = item.lead.primaryContactPhone ?? item.lead.phone;
  const isCompleted = item.bucket === "completed_today";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{item.lead.organizationName}</CardTitle>
              {item.lead.leadType ? (
                <Badge variant="secondary">{item.lead.leadType.name}</Badge>
              ) : null}
              <StageBadge
                stage={
                  item.lead.stage
                    ? {
                        id: item.lead.stage.id,
                        code: item.lead.stage.code,
                        name: item.lead.stage.name,
                      }
                    : null
                }
              />
              {item.bucket === "overdue" ? (
                <Badge variant="destructive">Overdue</Badge>
              ) : null}
            </div>
            <CardDescription>
              Due {new Date(item.dueAt).toLocaleString()}
              {isCompleted && item.completedAt
                ? ` · Completed ${new Date(item.completedAt).toLocaleString()}`
                : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={LEAD_ROUTES.DETAIL(item.leadId)}>Open</Link>
            </Button>
            {!isCompleted ? (
              <Button size="sm" onClick={() => onComplete(item)}>
                Complete
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Primary contact" value={item.lead.primaryContactName} />
        <Detail label="Phone" value={phone} />
        <Detail
          label="Assigned executive"
          value={item.assignedTo?.fullName}
        />
        <div className="sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Previous activity
          </p>
          <p className="mt-1">
            {formatPreviousActivitySummary(item.previousActivity)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * @param {{ label: string, value: string | null | undefined }} props
 */
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1">{value?.trim() ? value : "—"}</p>
    </div>
  );
}
