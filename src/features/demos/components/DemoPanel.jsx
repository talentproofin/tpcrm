"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Loader2, Plus } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardListSkeleton } from "@/components/feedback/PageSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { cancelDemo, getDemosByLead } from "../services/demoService";
import { DemoActionDialog } from "./DemoActionDialog";
import { DemoCard } from "./DemoCard";
import { DemoFormDialog } from "./DemoFormDialog";

/**
 * @param {{
 *   leadId: string,
 *   disabled?: boolean,
 *   onDemosChanged?: () => void,
 * }} props
 */
export function DemoPanel({ leadId, disabled = false, onDemosChanged }) {
  const { profile } = useCurrentProfile();
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [formMode, setFormMode] = useState("schedule");
  const [formOpen, setFormOpen] = useState(false);
  const [actionMode, setActionMode] = useState("complete");
  const [actionOpen, setActionOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadDemos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getDemosByLead(supabase, leadId);

    if (loadError) {
      setError(loadError.message);
      setDemos([]);
    } else {
      setDemos(data ?? []);
    }

    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    loadDemos();
  }, [loadDemos]);

  function openForm(mode, demo = null) {
    setSelectedDemo(demo);
    setFormMode(mode);
    setFormOpen(true);
  }

  function openAction(mode, demo) {
    setSelectedDemo(demo);
    setActionMode(mode);
    setActionOpen(true);
  }

  async function confirmCancel() {
    if (!profile || !selectedDemo) {
      return;
    }

    setCancelling(true);

    const supabase = getAuthBrowserClient();
    const { error: cancelError } = await cancelDemo(
      supabase,
      profile.profileId,
      selectedDemo.id
    );

    setCancelling(false);

    if (cancelError) {
      toast.error(cancelError.message);
      return;
    }

    setCancelOpen(false);
    setSelectedDemo(null);
    toast.success("Demo cancelled.");
    await loadDemos();
    onDemosChanged?.();
  }

  function handleSaved(message) {
    toast.success(message);
    loadDemos();
    onDemosChanged?.();
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="text-base">Demo timeline</CardTitle>
          <CardDescription>
            Schedule and track demos for this lead. Follow-ups are created
            automatically when a demo is scheduled.
          </CardDescription>
        </div>
        <Button size="sm" disabled={disabled} onClick={() => openForm("schedule")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Schedule demo
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <CardListSkeleton count={2} />
        ) : error ? (
          <ErrorState
            title="Unable to load demos"
            message={error}
            onRetry={loadDemos}
          />
        ) : demos.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No demos scheduled"
            description="Schedule a demo to track preparation, delivery, and follow-up."
            action={
              <Button
                type="button"
                size="sm"
                disabled={disabled}
                onClick={() => openForm("schedule")}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Schedule demo
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {demos.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                disabled={disabled}
                onEdit={(item) => openForm("edit", item)}
                onReschedule={(item) => openForm("reschedule", item)}
                onComplete={(item) => openAction("complete", item)}
                onEditCompleted={(item) => openAction("editCompleted", item)}
                onCancel={(item) => {
                  setSelectedDemo(item);
                  setCancelOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </CardContent>

      <DemoFormDialog
        leadId={leadId}
        demo={selectedDemo}
        mode={formMode}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={() =>
          handleSaved(
            formMode === "schedule"
              ? "Demo scheduled."
              : formMode === "reschedule"
                ? "Demo rescheduled."
                : "Demo updated."
          )
        }
        disabled={disabled}
      />

      <DemoActionDialog
        demo={selectedDemo}
        mode={actionMode}
        open={actionOpen}
        onOpenChange={setActionOpen}
        onSaved={() =>
          handleSaved(
            actionMode === "complete" ? "Demo completed." : "Demo summary updated."
          )
        }
      />

      <Dialog
        open={cancelOpen}
        onOpenChange={createDialogOpenChangeHandler(cancelling, setCancelOpen)}
      >
        <DialogContent
          onEscapeKeyDown={preventDialogDismissWhenBusy(cancelling)}
          onInteractOutside={preventDialogDismissWhenBusy(cancelling)}
        >
          <DialogHeader>
            <DialogTitle>Cancel demo?</DialogTitle>
            <DialogDescription>
              This demo will be marked cancelled and remain in the timeline.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
            >
              Keep demo
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Cancelling...
                </>
              ) : (
                "Cancel demo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
