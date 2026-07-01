"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getLeadStages, getLeadTypes } from "@/services/lookups/lookupService";
import { DEFAULT_PAGE_SIZE } from "../constants/list";
import { LEAD_ROUTES } from "../constants/routes";
import { getAssignableProfiles, getLeadList } from "../services/leadService";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LeadFilters } from "./LeadFilters";
import { LeadTable } from "./LeadTable";
import { PaginationControls } from "./PaginationControls";

export function LeadListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [stageId, setStageId] = useState("");
  const [leadTypeId, setLeadTypeId] = useState("");
  const [ownerProfileId, setOwnerProfileId] = useState("");
  const [includeTrashed, setIncludeTrashed] = useState(false);
  const [page, setPage] = useState(1);
  const [stages, setStages] = useState([]);
  const [leadTypes, setLeadTypes] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [listResult, setListResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: listError } = await getLeadList(supabase, {
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      search,
      stageId: stageId || undefined,
      leadTypeId: leadTypeId || undefined,
      ownerProfileId: ownerProfileId || undefined,
      includeTrashed,
    });

    if (listError) {
      setError(listError.message);
      setListResult(null);
    } else {
      setListResult(data);
    }

    setLoading(false);
  }, [page, search, stageId, leadTypeId, ownerProfileId, includeTrashed]);

  useEffect(() => {
    const stageParam = searchParams.get("stageId");
    const ownerParam = searchParams.get("ownerProfileId");

    if (stageParam) {
      setStageId(stageParam);
    }

    if (ownerParam) {
      setOwnerProfileId(ownerParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      const supabase = getAuthBrowserClient();
      const [stageItems, typeItems, profilesResult] = await Promise.all([
        getLeadStages(supabase),
        getLeadTypes(supabase),
        getAssignableProfiles(supabase),
      ]);

      if (!cancelled) {
        setStages(stageItems);
        setLeadTypes(typeItems);
        setProfiles(profilesResult.data ?? []);
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadLeads();
    }, 250);

    return () => clearTimeout(timeout);
  }, [loadLeads]);

  useEffect(() => {
    setPage(1);
  }, [search, stageId, leadTypeId, ownerProfileId, includeTrashed]);

  const hasActiveFilters = Boolean(
    search || stageId || leadTypeId || ownerProfileId || includeTrashed
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage your sales pipeline.
          </p>
        </div>
        <Button asChild>
          <Link href={LEAD_ROUTES.NEW}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New lead
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search and narrow leads by stage, type, or owner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadFilters
            search={search}
            stageId={stageId}
            leadTypeId={leadTypeId}
            ownerProfileId={ownerProfileId}
            includeTrashed={includeTrashed}
            stages={stages}
            leadTypes={leadTypes}
            profiles={profiles}
            onSearchChange={setSearch}
            onStageChange={setStageId}
            onLeadTypeChange={setLeadTypeId}
            onOwnerChange={setOwnerProfileId}
            onIncludeTrashedChange={setIncludeTrashed}
            disabled={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {error ? (
            <ErrorState
              title="Unable to load leads"
              message={error}
              onRetry={loadLeads}
            />
          ) : (
            <>
              <LeadTable
                items={listResult?.items ?? []}
                loading={loading}
                hasActiveFilters={hasActiveFilters}
                onView={(id) => router.push(LEAD_ROUTES.DETAIL(id))}
              />
              {listResult ? (
                <div className="mt-4">
                  <PaginationControls
                    page={listResult.page}
                    totalPages={listResult.totalPages}
                    total={listResult.total}
                    onPageChange={setPage}
                    disabled={loading}
                  />
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
