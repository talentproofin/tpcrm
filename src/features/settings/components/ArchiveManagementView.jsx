"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Archive, Loader2, RotateCcw, Trash2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getRoleById } from "@/features/auth/services/profileService";
import { LEAD_ROUTES } from "@/features/leads/constants/routes";
import { PaginationControls } from "@/features/leads/components/PaginationControls";
import { DEFAULT_PAGE_SIZE } from "@/features/leads/constants/list";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { getDemoStatuses } from "@/services/lookups/lookupService";
import {
  canAccessSettings,
  canManageSettings,
} from "../constants/permissions";
import {
  getArchivedContacts,
  getArchivedDemos,
  getArchivedLeads,
  permanentDeleteArchivedEntity,
  restoreArchivedEntity,
} from "../services/archiveService";
import { ArchiveConfirmDialog } from "./ArchiveConfirmDialog";

const TABS = [
  { id: "leads", label: "Leads" },
  { id: "contacts", label: "Contacts" },
  { id: "demos", label: "Demos" },
];

function formatTimestamp(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

export function ArchiveManagementView() {
  const { profile } = useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);
  const [activeTab, setActiveTab] = useState("leads");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [cancelledStatusId, setCancelledStatusId] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const canAccess = canAccessSettings(roleCode);
  const canManage = canManageSettings(roleCode);

  const loadArchives = useCallback(async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const options = { page, pageSize: DEFAULT_PAGE_SIZE };

    if (activeTab === "leads") {
      const { data, error: loadError } = await getArchivedLeads(supabase, options);
      if (loadError) {
        setError(loadError.message);
        setResult(null);
      } else {
        setResult(data);
      }
    } else if (activeTab === "contacts") {
      const { data, error: loadError } = await getArchivedContacts(supabase, options);
      if (loadError) {
        setError(loadError.message);
        setResult(null);
      } else {
        setResult(data);
      }
    } else if (cancelledStatusId) {
      const { data, error: loadError } = await getArchivedDemos(
        supabase,
        cancelledStatusId,
        options
      );
      if (loadError) {
        setError(loadError.message);
        setResult(null);
      } else {
        setResult(data);
      }
    }

    setLoading(false);
  }, [activeTab, canAccess, cancelledStatusId, page]);

  useEffect(() => {
    let cancelled = false;

    async function loadIdentity() {
      if (!profile) {
        return;
      }

      const supabase = getAuthBrowserClient();
      const role = await getRoleById(supabase, profile.roleId);

      if (!cancelled) {
        setRoleCode(role?.code ?? null);
      }
    }

    loadIdentity();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    async function loadCancelledStatus() {
      const supabase = getAuthBrowserClient();
      const statuses = await getDemoStatuses(supabase, { activeOnly: false });
      const cancelledStatus = statuses.find((item) => item.code === "cancelled");

      if (!cancelled) {
        setCancelledStatusId(cancelledStatus?.id ?? null);
      }
    }

    loadCancelledStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (roleCode) {
      loadArchives();
    }
  }, [loadArchives, roleCode]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  async function handleRestore(entityType, entityId) {
    if (!profile || !canManage) {
      return;
    }

    setActionId(entityId);

    const supabase = getAuthBrowserClient();
    const { error: restoreError } = await restoreArchivedEntity(
      supabase,
      entityType,
      entityId,
      profile.profileId
    );

    setActionId(null);

    if (restoreError) {
      toast.error(restoreError.message);
      return;
    }

    toast.success("Record restored.");
    loadArchives();
  }

  async function handlePermanentDelete() {
    if (!profile || !canManage || !confirmState) {
      return;
    }

    setActionId(confirmState.entityId);

    const supabase = getAuthBrowserClient();
    const { error: deleteError } = await permanentDeleteArchivedEntity(
      supabase,
      confirmState.entityType,
      confirmState.entityId,
      profile.profileId
    );

    setActionId(null);
    setConfirmState(null);

    if (deleteError) {
      toast.error(deleteError.message);
      return;
    }

    toast.success("Record permanently deleted.");
    loadArchives();
  }

  if (roleCode && !canAccess) {
    return (
      <EmptyState
        icon={Archive}
        title="Access restricted"
        description="Archive management is not available for your role."
      />
    );
  }

  const items = result?.items ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Archive management</CardTitle>
          <CardDescription>
            {canManage
              ? "Restore archived records or permanently delete them when allowed."
              : "Read-only view of archived leads, contacts, and cancelled demos."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                size="sm"
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {loading ? <TableSkeleton rows={5} columns={4} /> : null}
          {!loading && error ? (
            <ErrorState message={error} onRetry={loadArchives} />
          ) : null}
          {!loading && !error ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {activeTab === "leads" ? (
                        <>
                          <TableHead>Organization</TableHead>
                          <TableHead>Deleted at</TableHead>
                        </>
                      ) : null}
                      {activeTab === "contacts" ? (
                        <>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Archived at</TableHead>
                        </>
                      ) : null}
                      {activeTab === "demos" ? (
                        <>
                          <TableHead>Lead</TableHead>
                          <TableHead>Scheduled at</TableHead>
                          <TableHead>Cancelled at</TableHead>
                        </>
                      ) : null}
                      {canManage ? (
                        <TableHead className="text-right">Actions</TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={canManage ? 4 : 3}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No archived records found.
                        </TableCell>
                      </TableRow>
                    ) : null}

                    {activeTab === "leads"
                      ? items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.organizationName}
                            </TableCell>
                            <TableCell>{formatTimestamp(item.deletedAt)}</TableCell>
                            {canManage ? (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRestore("lead", item.id)}
                                    disabled={actionId === item.id}
                                    aria-label="Restore lead"
                                  >
                                    {actionId === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      setConfirmState({
                                        entityType: "lead",
                                        entityId: item.id,
                                        title: "Permanently delete lead?",
                                        description:
                                          "This action cannot be undone. The lead will only be deleted if no dependencies remain.",
                                      })
                                    }
                                    disabled={actionId === item.id}
                                    aria-label="Permanently delete lead"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))
                      : null}

                    {activeTab === "contacts"
                      ? items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.fullName}
                              {item.isPrimary ? " (Primary)" : ""}
                            </TableCell>
                            <TableCell>{item.email ?? "—"}</TableCell>
                            <TableCell>{formatTimestamp(item.archivedAt)}</TableCell>
                            {canManage ? (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRestore("contact", item.id)}
                                    disabled={actionId === item.id}
                                    aria-label="Restore contact"
                                  >
                                    {actionId === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      setConfirmState({
                                        entityType: "contact",
                                        entityId: item.id,
                                        title: "Permanently delete contact?",
                                        description:
                                          "This action cannot be undone. Primary contacts cannot be permanently deleted.",
                                      })
                                    }
                                    disabled={actionId === item.id || item.isPrimary}
                                    aria-label="Permanently delete contact"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))
                      : null}

                    {activeTab === "demos"
                      ? items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.leadId ? (
                                <Link
                                  href={LEAD_ROUTES.DETAIL(item.leadId)}
                                  className="text-sm underline-offset-4 hover:underline"
                                >
                                  View lead
                                </Link>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>{formatTimestamp(item.scheduledAt)}</TableCell>
                            <TableCell>{formatTimestamp(item.cancelledAt)}</TableCell>
                            {canManage ? (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRestore("demo", item.id)}
                                    disabled={actionId === item.id}
                                    aria-label="Restore demo"
                                  >
                                    {actionId === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      setConfirmState({
                                        entityType: "demo",
                                        entityId: item.id,
                                        title: "Permanently delete demo?",
                                        description:
                                          "This action cannot be undone. The cancelled demo record will be removed permanently.",
                                      })
                                    }
                                    disabled={actionId === item.id}
                                    aria-label="Permanently delete demo"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))
                      : null}
                  </TableBody>
                </Table>
              </div>

              {result ? (
                <PaginationControls
                  page={result.page}
                  totalPages={result.totalPages}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <ArchiveConfirmDialog
        open={Boolean(confirmState)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmState(null);
          }
        }}
        title={confirmState?.title ?? ""}
        description={confirmState?.description ?? ""}
        confirmLabel="Permanently delete"
        busy={Boolean(actionId)}
        onConfirm={handlePermanentDelete}
      />
    </div>
  );
}
