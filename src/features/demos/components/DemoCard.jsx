import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_STATUS_CODES } from "../constants";

const STATUS_VARIANTS = {
  [DEMO_STATUS_CODES.SCHEDULED]: "default",
  [DEMO_STATUS_CODES.COMPLETED]: "secondary",
  [DEMO_STATUS_CODES.CANCELLED]: "outline",
  [DEMO_STATUS_CODES.RESCHEDULED]: "outline",
};

/**
 * @param {{
 *   demo: import('../types/demo').Demo,
 *   onEdit: (demo: import('../types/demo').Demo) => void,
 *   onComplete: (demo: import('../types/demo').Demo) => void,
 *   onCancel: (demo: import('../types/demo').Demo) => void,
 *   onReschedule: (demo: import('../types/demo').Demo) => void,
 *   onEditCompleted: (demo: import('../types/demo').Demo) => void,
 *   disabled?: boolean,
 * }} props
 */
export function DemoCard({
  demo,
  onEdit,
  onComplete,
  onCancel,
  onReschedule,
  onEditCompleted,
  disabled = false,
}) {
  const statusCode = demo.status?.code ?? DEMO_STATUS_CODES.SCHEDULED;
  const isScheduled = statusCode === DEMO_STATUS_CODES.SCHEDULED;
  const isCompleted = statusCode === DEMO_STATUS_CODES.COMPLETED;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">
              {new Date(demo.scheduledAt).toLocaleString()}
            </CardTitle>
            {demo.status ? (
              <Badge variant={STATUS_VARIANTS[statusCode] ?? "outline"}>
                {demo.status.name}
              </Badge>
            ) : null}
            {demo.outcome ? (
              <Badge variant="secondary">{demo.outcome.name}</Badge>
            ) : null}
            <Badge variant="outline">
              {demo.demoMode === "online" ? "Online" : "Offline"}
            </Badge>
          </div>
          <CardDescription>
            Presenter: {demo.presenter?.fullName ?? "—"} · {demo.durationMinutes}{" "}
            min
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {isScheduled ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => onEdit(demo)}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => onReschedule(demo)}
              >
                Reschedule
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={disabled}
                onClick={() => onComplete(demo)}
              >
                Complete
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={() => onCancel(demo)}
              >
                Cancel
              </Button>
            </>
          ) : null}
          {isCompleted ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onEditCompleted(demo)}
            >
              Edit summary
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        <DemoField label="Meeting link" value={demo.meetingLink} className="break-all" />
        <DemoField label="Venue" value={demo.venue} />
        <DemoField label="Attendees" value={demo.attendees} className="sm:col-span-2" />
        {demo.summary ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Summary
            </p>
            <p className="mt-1 whitespace-pre-wrap">{demo.summary}</p>
          </div>
        ) : null}
        {demo.internalNotes ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Internal notes
            </p>
            <p className="mt-1 whitespace-pre-wrap">{demo.internalNotes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * @param {{ label: string, value: string | null, className?: string }} props
 */
function DemoField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1">{value?.trim() ? value : "—"}</p>
    </div>
  );
}
