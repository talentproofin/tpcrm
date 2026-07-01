"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardListSkeleton, FormSkeleton } from "@/components/feedback/PageSkeletons";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { getActivitiesByLead } from "../services/activityService";
import { ActivityList } from "./ActivityList";

const ActivityForm = dynamic(
  () => import("./ActivityForm").then((module) => module.ActivityForm),
  {
    loading: () => <FormSkeleton />,
    ssr: false,
  }
);

/**
 * @param {{
 *   leadId: string,
 *   disabled?: boolean,
 *   refreshKey?: number,
 *   onActivityCreated?: () => void,
 * }} props
 */
export function ActivityPanel({
  leadId,
  disabled = false,
  refreshKey = 0,
  onActivityCreated,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getActivitiesByLead(
      supabase,
      leadId
    );

    if (loadError) {
      setError(loadError.message);
      setActivities([]);
    } else {
      setActivities(data ?? []);
    }

    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities, refreshKey]);

  function handleActivityCreated() {
    setFormOpen(false);
    setIsSubmitting(false);
    toast.success("Activity logged.");
    onActivityCreated?.();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Activities</CardTitle>
          <CardDescription>
            Log every touchpoint with outcome, remark, performer, and next
            follow-up.
          </CardDescription>
        </div>
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => setFormOpen(true)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log activity
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <CardListSkeleton count={2} />
        ) : error ? (
          <ErrorState
            title="Unable to load activities"
            message={error}
            onRetry={loadActivities}
          />
        ) : (
          <ActivityList
            activities={activities}
            onLogActivity={disabled ? undefined : () => setFormOpen(true)}
          />
        )}
      </CardContent>

      <Dialog
        open={formOpen}
        onOpenChange={createDialogOpenChangeHandler(isSubmitting, setFormOpen)}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
          onEscapeKeyDown={preventDialogDismissWhenBusy(isSubmitting)}
          onInteractOutside={preventDialogDismissWhenBusy(isSubmitting)}
        >
          <DialogHeader>
            <DialogTitle>Log activity</DialogTitle>
            <DialogDescription>
              Record what happened and schedule the next follow-up.
            </DialogDescription>
          </DialogHeader>
          <ActivityForm
            leadId={leadId}
            disabled={disabled}
            onSubmittingChange={setIsSubmitting}
            onSuccess={handleActivityCreated}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
