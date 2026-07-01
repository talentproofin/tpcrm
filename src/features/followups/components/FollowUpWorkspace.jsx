"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardListSkeleton } from "@/components/feedback/PageSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { LEAD_ROUTES } from "@/features/leads/constants/routes";
import { getAssignableProfiles } from "@/features/leads/services/leadService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import {
  getLeadStages,
  getLeadTypes,
} from "@/services/lookups/lookupService";
import { FOLLOWUP_VIEWS, SEARCH_DEBOUNCE_MS } from "../constants";
import { getFollowUpWorkspace } from "../services/followUpService";
import { FollowUpCard } from "./FollowUpCard";
import { FollowUpFilters } from "./FollowUpFilters";
import { QuickCompleteDialog } from "./QuickCompleteDialog";

/**
 * @param {{
 *   title: string,
 *   items: import('../types/followUp').FollowUpWorkspaceItem[],
 *   onComplete: (item: import('../types/followUp').FollowUpWorkspaceItem) => void,
 *   showEmpty?: boolean,
 * }} props
 */
function FollowUpSection({ title, items, onComplete, showEmpty = false }) {
  if (items.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <section className="space-y-4" aria-label={title}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {items.length} follow-up{items.length === 1 ? "" : "s"}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No follow-ups in this section.</p>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <FollowUpCard key={item.id} item={item} onComplete={onComplete} />
          ))}
        </div>
      )}
    </section>
  );
}

export function FollowUpWorkspace() {
  const searchParams = useSearchParams();
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [view, setView] = useState(FOLLOWUP_VIEWS.ALL);
  const [assignedToMe, setAssignedToMe] = useState(true);
  const [assignedToProfileId, setAssignedToProfileId] = useState("");
  const [leadTypeId, setLeadTypeId] = useState("");
  const [stageId, setStageId] = useState("");
  const [leadTypes, setLeadTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [completeOpen, setCompleteOpen] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getFollowUpWorkspace(supabase, {
      search: debouncedSearch,
      view,
      assignedToMe: assignedToMe && profile ? true : false,
      assignedToProfileId:
        assignedToMe && profile
          ? profile.profileId
          : assignedToProfileId || undefined,
      leadTypeId: leadTypeId || undefined,
      stageId: stageId || undefined,
    });

    if (loadError) {
      setError(loadError.message);
      setWorkspace(null);
    } else {
      setWorkspace(data);
    }

    setLoading(false);
  }, [
    debouncedSearch,
    view,
    assignedToMe,
    assignedToProfileId,
    leadTypeId,
    stageId,
    profile,
  ]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        debouncedSearch ||
          view !== FOLLOWUP_VIEWS.ALL ||
          !assignedToMe ||
          assignedToProfileId ||
          leadTypeId ||
          stageId
      ),
    [debouncedSearch, view, assignedToMe, assignedToProfileId, leadTypeId, stageId]
  );

  useEffect(() => {
    const viewParam = searchParams.get("view");

    if (
      viewParam &&
      Object.values(FOLLOWUP_VIEWS).includes(viewParam)
    ) {
      setView(viewParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      const supabase = getAuthBrowserClient();
      const [typeItems, stageItems, profilesResult] = await Promise.all([
        getLeadTypes(supabase),
        getLeadStages(supabase),
        getAssignableProfiles(supabase),
      ]);

      if (!cancelled) {
        setLeadTypes(typeItems);
        setStages(stageItems);
        setProfiles(
          (profilesResult.data ?? []).map((item) => ({
            profileId: item.profileId,
            fullName: item.fullName,
            email: item.email,
          }))
        );
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (profileLoading) {
      return;
    }

    loadWorkspace();
  }, [loadWorkspace, profileLoading]);

  function handleComplete(item) {
    setSelectedFollowUp(item);
    setCompleteOpen(true);
  }

  function handleCompleted() {
    toast.success("Follow-up completed and next follow-up scheduled.");
    loadWorkspace();
  }

  const grouped = workspace?.grouped ?? {
    overdue: [],
    today: [],
    upcoming: [],
    completed_today: [],
  };

  const showOpenSections =
    view === FOLLOWUP_VIEWS.ALL ||
    view === FOLLOWUP_VIEWS.OVERDUE ||
    view === FOLLOWUP_VIEWS.TODAY ||
    view === FOLLOWUP_VIEWS.UPCOMING;

  const showCompletedSection =
    view === FOLLOWUP_VIEWS.ALL || view === FOLLOWUP_VIEWS.COMPLETED_TODAY;

  const isFilteredView = view !== FOLLOWUP_VIEWS.ALL;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">
          Your daily workspace to complete follow-ups and log interactions fast.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Narrow by due date, assignment, lead type, stage, or search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FollowUpFilters
            search={searchInput}
            view={view}
            assignedToMe={assignedToMe}
            assignedToProfileId={assignedToProfileId}
            leadTypeId={leadTypeId}
            stageId={stageId}
            leadTypes={leadTypes}
            stages={stages}
            profiles={profiles}
            onSearchChange={setSearchInput}
            onViewChange={setView}
            onAssignedToMeChange={setAssignedToMe}
            onAssignedToProfileIdChange={setAssignedToProfileId}
            onLeadTypeChange={setLeadTypeId}
            onStageChange={setStageId}
            disableFilters={loading || profileLoading}
          />
        </CardContent>
      </Card>

      {loading || profileLoading ? (
        <CardListSkeleton count={3} />
      ) : error ? (
        <ErrorState
          title="Unable to load follow-ups"
          message={error}
          onRetry={loadWorkspace}
        />
      ) : workspace?.items.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={hasActiveFilters ? "No matching follow-ups" : "You're all caught up"}
          description={
            hasActiveFilters
              ? "Try changing your filters or search to find follow-ups."
              : "Log activities on leads to schedule follow-ups, or browse your pipeline."
          }
          action={
            <Button asChild variant="outline">
              <Link href={LEAD_ROUTES.LIST}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                View leads
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {showOpenSections ? (
            <>
              {(view === FOLLOWUP_VIEWS.ALL ||
                view === FOLLOWUP_VIEWS.OVERDUE) && (
                <FollowUpSection
                  title="Overdue Follow-ups"
                  items={grouped.overdue}
                  onComplete={handleComplete}
                  showEmpty={isFilteredView && view === FOLLOWUP_VIEWS.OVERDUE}
                />
              )}
              {(view === FOLLOWUP_VIEWS.ALL || view === FOLLOWUP_VIEWS.TODAY) && (
                <FollowUpSection
                  title="Today's Follow-ups"
                  items={grouped.today}
                  onComplete={handleComplete}
                  showEmpty={isFilteredView && view === FOLLOWUP_VIEWS.TODAY}
                />
              )}
              {(view === FOLLOWUP_VIEWS.ALL ||
                view === FOLLOWUP_VIEWS.UPCOMING) && (
                <FollowUpSection
                  title="Upcoming Follow-ups"
                  items={grouped.upcoming}
                  onComplete={handleComplete}
                  showEmpty={isFilteredView && view === FOLLOWUP_VIEWS.UPCOMING}
                />
              )}
            </>
          ) : null}

          {showCompletedSection ? (
            <FollowUpSection
              title="Completed Today"
              items={grouped.completed_today}
              onComplete={handleComplete}
              showEmpty={isFilteredView && view === FOLLOWUP_VIEWS.COMPLETED_TODAY}
            />
          ) : null}
        </div>
      )}

      <QuickCompleteDialog
        followUp={selectedFollowUp}
        profileId={profile?.profileId ?? null}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onCompleted={handleCompleted}
      />
    </div>
  );
}
