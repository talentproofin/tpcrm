"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ListTree,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { getActivityTypes } from "@/services/lookups/lookupService";
import { LOOKUP_DEFINITIONS } from "../constants";
import {
  canAccessSettings,
  canManageSettings,
} from "../constants/permissions";
import {
  getAdminLookups,
  reorderAdminLookup,
  setAdminLookupActive,
} from "../services/lookupAdminService";
import { LookupFormDialog } from "./LookupFormDialog";

export function LookupManagementView() {
  const { profile } = useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);
  const [selectedLookupId, setSelectedLookupId] = useState(
    LOOKUP_DEFINITIONS[0].id
  );
  const [activityTypeId, setActivityTypeId] = useState("");
  const [activityTypes, setActivityTypes] = useState([]);
  const [lookups, setLookups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLookup, setEditingLookup] = useState(null);

  const canAccess = canAccessSettings(roleCode);
  const canManage = canManageSettings(roleCode);

  const selectedDefinition = useMemo(
    () =>
      LOOKUP_DEFINITIONS.find((item) => item.id === selectedLookupId) ??
      LOOKUP_DEFINITIONS[0],
    [selectedLookupId]
  );

  const loadLookups = useCallback(async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getAdminLookups(
      supabase,
      selectedDefinition.table,
      {
        activityTypeId: selectedDefinition.requiresActivityType
          ? activityTypeId || undefined
          : undefined,
      }
    );

    if (loadError) {
      setError(loadError.message);
      setLookups([]);
    } else {
      setLookups(data ?? []);
    }

    setLoading(false);
  }, [
    activityTypeId,
    canAccess,
    selectedDefinition.requiresActivityType,
    selectedDefinition.table,
  ]);

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

    async function loadActivityTypes() {
      if (!selectedDefinition.requiresActivityType || !canAccess) {
        return;
      }

      const supabase = getAuthBrowserClient();
      const items = await getActivityTypes(supabase, { activeOnly: false });

      if (!cancelled) {
        setActivityTypes(items);
        if (!activityTypeId && items[0]) {
          setActivityTypeId(items[0].id);
        }
      }
    }

    loadActivityTypes();

    return () => {
      cancelled = true;
    };
  }, [activityTypeId, canAccess, selectedDefinition.requiresActivityType]);

  useEffect(() => {
    if (roleCode) {
      loadLookups();
    }
  }, [loadLookups, roleCode]);

  function openCreate() {
    setEditingLookup(null);
    setFormOpen(true);
  }

  function openEdit(lookup) {
    setEditingLookup(lookup);
    setFormOpen(true);
  }

  async function handleToggleActive(lookup) {
    if (!profile || !canManage) {
      return;
    }

    setActionId(lookup.id);

    const supabase = getAuthBrowserClient();
    const { error: toggleError } = await setAdminLookupActive(supabase, {
      tableName: selectedDefinition.table,
      recordId: lookup.id,
      isActive: !lookup.isActive,
      profileId: profile.profileId,
    });

    setActionId(null);

    if (toggleError) {
      toast.error(toggleError.message);
      return;
    }

    toast.success(lookup.isActive ? "Lookup archived." : "Lookup activated.");
    loadLookups();
  }

  async function handleReorder(lookup, direction) {
    if (!profile || !canManage) {
      return;
    }

    const nextOrder =
      direction === "up"
        ? Math.max(1, lookup.displayOrder - 1)
        : lookup.displayOrder + 1;

    if (nextOrder === lookup.displayOrder) {
      return;
    }

    setActionId(lookup.id);

    const supabase = getAuthBrowserClient();
    const { error: reorderError } = await reorderAdminLookup(
      supabase,
      selectedDefinition.table,
      lookup.id,
      nextOrder,
      profile.profileId,
      lookup.activityTypeId
    );

    setActionId(null);

    if (reorderError) {
      toast.error(reorderError.message);
      return;
    }

    loadLookups();
  }

  if (roleCode && !canAccess) {
    return (
      <EmptyState
        icon={ListTree}
        title="Access restricted"
        description="Lookup management is not available for your role."
      />
    );
  }

  const requiresActivityType = selectedDefinition.requiresActivityType;
  const showActivityTypePicker = requiresActivityType && activityTypes.length > 0;
  const disableLookupActions =
    requiresActivityType && !activityTypeId && activityTypes.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Lookup management</CardTitle>
            <CardDescription>
              {canManage
                ? "Add, edit, archive, activate, and reorder lookup values."
                : "Read-only view of lookup values."}
            </CardDescription>
          </div>
          {canManage ? (
            <Button
              size="sm"
              onClick={openCreate}
              disabled={disableLookupActions}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add lookup
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={selectedLookupId} onValueChange={setSelectedLookupId}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select lookup" />
              </SelectTrigger>
              <SelectContent>
                {LOOKUP_DEFINITIONS.map((definition) => (
                  <SelectItem key={definition.id} value={definition.id}>
                    {definition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showActivityTypePicker ? (
              <Select value={activityTypeId} onValueChange={setActivityTypeId}>
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          {loading ? <TableSkeleton rows={5} columns={5} /> : null}
          {!loading && error ? (
            <ErrorState message={error} onRetry={loadLookups} />
          ) : null}
          {!loading && !error ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage ? (
                      <TableHead className="text-right">Actions</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lookups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={canManage ? 5 : 4}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No lookup values found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lookups.map((lookup) => (
                      <TableRow key={lookup.id}>
                        <TableCell className="font-mono text-xs">
                          {lookup.code}
                        </TableCell>
                        <TableCell>{lookup.name}</TableCell>
                        <TableCell>{lookup.displayOrder}</TableCell>
                        <TableCell>
                          <Badge variant={lookup.isActive ? "default" : "outline"}>
                            {lookup.isActive ? "Active" : "Archived"}
                          </Badge>
                        </TableCell>
                        {canManage ? (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleReorder(lookup, "up")}
                                disabled={actionId === lookup.id}
                                aria-label="Move up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleReorder(lookup, "down")}
                                disabled={actionId === lookup.id}
                                aria-label="Move down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => openEdit(lookup)}
                                disabled={actionId === lookup.id}
                                aria-label="Edit lookup"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleToggleActive(lookup)}
                                disabled={actionId === lookup.id}
                                aria-label={
                                  lookup.isActive ? "Archive lookup" : "Activate lookup"
                                }
                              >
                                {actionId === lookup.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : lookup.isActive ? (
                                  <Archive className="h-4 w-4" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <LookupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tableName={selectedDefinition.table}
        requiresActivityType={requiresActivityType}
        lookup={editingLookup}
        defaultActivityTypeId={activityTypeId}
        onSaved={() => {
          toast.success(editingLookup ? "Lookup updated." : "Lookup added.");
          loadLookups();
        }}
      />
    </div>
  );
}
