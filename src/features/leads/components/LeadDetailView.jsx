"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ActivityPanel } from "@/features/activities/components/ActivityPanel";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/components/feedback/ErrorState";
import { DetailPageSkeleton } from "@/components/feedback/PageSkeletons";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { LEAD_ROUTES } from "../constants/routes";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { deleteLead, getLead } from "../services/leadService";
import { LeadSectionPlaceholder } from "./LeadSectionPlaceholder";
import { StageBadge } from "./StageBadge";

/**
 * @param {{ leadId: string }} props
 */
export function LeadDetailView({ leadId }) {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  const loadLead = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getLead(supabase, leadId);

    if (loadError) {
      setError(loadError.message);
      setLead(null);
    } else {
      setLead(data);
    }

    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  async function handleDelete() {
    if (!profile) {
      return;
    }

    setDeleting(true);

    const supabase = getAuthBrowserClient();
    const { error: deleteError } = await deleteLead(
      supabase,
      profile.profileId,
      leadId
    );

    setDeleting(false);

    if (deleteError) {
      toast.error(deleteError.message);
      return;
    }

    setDeleteOpen(false);
    toast.success("Lead moved to trash.");
    router.push(LEAD_ROUTES.LIST);
  }

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error || !lead) {
    return (
      <ErrorState
        title="Lead unavailable"
        message={error ?? "Lead not found."}
        onRetry={loadLead}
      />
    );
  }

  const isTrashed = Boolean(lead.deletedAt);
  const isArchived = Boolean(lead.archivedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {lead.organizationName}
            </h1>
            <StageBadge stage={lead.stage} />
            {lead.leadType ? (
              <Badge variant="secondary">{lead.leadType.name}</Badge>
            ) : null}
            {isTrashed ? <Badge variant="destructive">Trashed</Badge> : null}
            {isArchived ? <Badge variant="outline">Archived</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Created {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild disabled={isTrashed}>
            <Link href={LEAD_ROUTES.EDIT(lead.id)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          {!isTrashed ? (
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          ) : null}
          <Button variant="ghost" asChild>
            <Link href={LEAD_ROUTES.LIST}>Back to list</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead details</CardTitle>
          <CardDescription>Core information for this opportunity.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Website" value={lead.website} />
          <DetailField label="Organization phone" value={lead.phone} />
          <DetailField label="Primary contact" value={lead.primaryContactName} />
          <DetailField
            label="Contact phone"
            value={lead.primaryContactPhone}
          />
          <DetailField
            label="Contact email"
            value={lead.primaryContactEmail}
          />
          <DetailField label="Owner" value={lead.owner?.fullName} />
          <DetailField
            label="Assigned to"
            value={lead.assignedTo?.fullName ?? "Unassigned"}
          />
          <DetailField label="Source" value={lead.leadSource?.name} />
          <DetailField
            label="Outcome"
            value={lead.outcome ? capitalize(lead.outcome) : null}
          />
          <div className="sm:col-span-2">
            <DetailField label="Description" value={lead.description} />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <ActivityPanel
        leadId={leadId}
        disabled={isTrashed}
        refreshKey={activityRefreshKey}
        onActivityCreated={() => setActivityRefreshKey((value) => value + 1)}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <LeadSectionPlaceholder
          title="Contacts"
          description="Contact records for this lead will be added in a future milestone."
        />
        <LeadSectionPlaceholder
          title="Follow-ups"
          description="A dedicated follow-up workspace will be added in a future milestone. Next follow-ups are recorded on each activity."
        />
        <LeadSectionPlaceholder
          title="Demos"
          description="Demo scheduling and tracking will be added in a future milestone."
        />
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={createDialogOpenChangeHandler(deleting, setDeleteOpen)}
      >
        <DialogContent
          onEscapeKeyDown={preventDialogDismissWhenBusy(deleting)}
          onInteractOutside={preventDialogDismissWhenBusy(deleting)}
        >
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              This will soft-delete &ldquo;{lead.organizationName}&rdquo;. You can
              review trashed leads from the list filters.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete lead"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * @param {{ label: string, value: string | null | undefined }} props
 */
function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

/**
 * @param {string} value
 */
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}
