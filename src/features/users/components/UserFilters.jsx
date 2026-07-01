"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_STATUS_OPTIONS } from "../constants";

/**
 * @param {{
 *   search: string,
 *   roleId: string,
 *   status: string,
 *   roles: Array<{ id: string, name: string }>,
 *   onSearchChange: (value: string) => void,
 *   onRoleChange: (value: string) => void,
 *   onStatusChange: (value: string) => void,
 * }} props
 */
export function UserFilters({
  search,
  roleId,
  status,
  roles,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="user-search">Search</Label>
        <Input
          id="user-search"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={roleId || "all"}
          onValueChange={(value) => onRoleChange(value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={status || "all"}
          onValueChange={(value) => onStatusChange(value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {USER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
