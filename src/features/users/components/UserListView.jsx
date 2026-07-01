"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getRoleById } from "@/features/auth/services/profileService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { PaginationControls } from "@/features/leads/components/PaginationControls";
import { DEFAULT_PAGE_SIZE } from "../constants";
import {
  canAccessUserManagement,
  canManageUsers,
} from "../constants/permissions";
import { getUserList } from "../services/userService";
import { UserFilters } from "./UserFilters";
import { UserFormDialog } from "./UserFormDialog";
import { UserStatsSummary } from "./UserStatsSummary";
import { UserTable } from "./UserTable";

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
async function loadRoles(supabase) {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, code")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to load roles.");
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
  }));
}

export function UserListView() {
  const { profile } = useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [listResult, setListResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [formOpen, setFormOpen] = useState(false);
  const [actionProfileId, setActionProfileId] = useState(null);

  const canAccess = canAccessUserManagement(roleCode);
  const canManage = canManageUsers(roleCode);

  const loadUsers = useCallback(async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: listError } = await getUserList(supabase, {
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      search,
      roleId: roleId || undefined,
      status: status || undefined,
    });

    if (listError) {
      setError(listError.message);
      setListResult(null);
    } else {
      setListResult(data);
    }

    setLoading(false);
  }, [canAccess, page, search, roleId, status]);

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

    async function loadLookups() {
      const supabase = getAuthBrowserClient();

      try {
        const roleItems = await loadRoles(supabase);
        if (!cancelled) {
          setRoles(roleItems);
        }
      } catch (lookupError) {
        if (!cancelled) {
          setError(
            lookupError instanceof Error
              ? lookupError.message
              : "Unable to load roles."
          );
        }
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers();
    }, 250);

    return () => clearTimeout(timeout);
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleId, status]);

  function openCreate() {
    setSelectedUser(null);
    setFormMode("create");
    setFormOpen(true);
  }

  function openEdit(user) {
    setSelectedUser(user);
    setFormMode("edit");
    setFormOpen(true);
  }

  async function handleResendInvite(user) {
    setActionProfileId(user.profileId);

    const response = await fetch(`/api/users/${user.profileId}/resend-invite`, {
      method: "POST",
    });

    const payload = await response.json().catch(() => ({}));
    setActionProfileId(null);

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to resend invite email.");
      return;
    }

    toast.success(`Invite email sent to ${user.email}.`);
  }

  async function handleSendRecovery(user) {
    setActionProfileId(user.profileId);

    const response = await fetch(`/api/users/${user.profileId}/send-recovery`, {
      method: "POST",
    });

    const payload = await response.json().catch(() => ({}));
    setActionProfileId(null);

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to send password recovery email.");
      return;
    }

    toast.success(`Password recovery email sent to ${user.email}.`);
  }

  if (roleCode && !canAccess) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Access restricted"
        description="User management is not available for your role."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User management</h1>
          <p className="text-sm text-muted-foreground">
            {canManage
              ? "Create and manage CRM users, roles, and access status."
              : "View users visible to your role."}
          </p>
        </div>
        {canManage ? (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create user
          </Button>
        ) : null}
      </div>

      {canAccess ? <UserStatsSummary /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users</CardTitle>
          <CardDescription>
            Search and filter by role or status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserFilters
            search={search}
            roleId={roleId}
            status={status}
            roles={roles}
            onSearchChange={setSearch}
            onRoleChange={setRoleId}
            onStatusChange={setStatus}
          />

          {loading ? (
            <TableSkeleton rows={6} columns={canManage ? 8 : 7} />
          ) : error ? (
            <ErrorState
              title="Unable to load users"
              message={error}
              onRetry={loadUsers}
            />
          ) : listResult && listResult.items.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting your search or filters."
              action={
                canManage ? (
                  <Button type="button" size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create user
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <UserTable
                users={listResult?.items ?? []}
                canManage={canManage}
                onEdit={openEdit}
                onResendInvite={handleResendInvite}
                onSendRecovery={handleSendRecovery}
                actionProfileId={actionProfileId}
              />
              {listResult ? (
                <PaginationControls
                  page={listResult.page}
                  totalPages={listResult.totalPages}
                  total={listResult.total}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <UserFormDialog
          user={selectedUser}
          mode={formMode}
          open={formOpen}
          onOpenChange={setFormOpen}
          roles={roles}
          onSaved={() => {
            toast.success(
              formMode === "create"
                ? "User created and invite email sent."
                : "User updated."
            );
            loadUsers();
          }}
        />
      ) : null}
    </div>
  );
}
