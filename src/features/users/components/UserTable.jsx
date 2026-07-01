"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USER_STATUS_CODES } from "../constants";

const STATUS_VARIANTS = {
  [USER_STATUS_CODES.ACTIVE]: "default",
  [USER_STATUS_CODES.INACTIVE]: "outline",
  [USER_STATUS_CODES.SUSPENDED]: "destructive",
  [USER_STATUS_CODES.INVITED]: "secondary",
};

/**
 * @param {{
 *   users: import('../types/user').ManagedUser[],
 *   canManage: boolean,
 *   onEdit: (user: import('../types/user').ManagedUser) => void,
 *   onSetPassword: (user: import('../types/user').ManagedUser) => void,
 *   onResendInvite: (user: import('../types/user').ManagedUser) => void,
 *   onSendRecovery: (user: import('../types/user').ManagedUser) => void,
 *   actionProfileId?: string | null,
 *   currentProfileId?: string | null,
 * }} props
 */
export function UserTable({
  users,
  canManage,
  onEdit,
  onSetPassword,
  onResendInvite,
  onSendRecovery,
  actionProfileId = null,
  currentProfileId = null,
}) {
  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No users match your filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead>Created</TableHead>
            {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.profileId}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role?.name ?? "—"}</TableCell>
              <TableCell>{user.manager?.fullName ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[user.status] ?? "outline"}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : "—"}
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              {canManage ? (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(user)}
                    >
                      Edit
                    </Button>
                    {user.profileId !== currentProfileId ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onSetPassword(user)}
                      >
                        Set password
                      </Button>
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={actionProfileId === user.profileId}
                        >
                          {actionProfileId === user.profileId
                            ? "Sending..."
                            : "Email"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onResendInvite(user)}>
                          Resend invite email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSendRecovery(user)}>
                          Send password recovery email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
