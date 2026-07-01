"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { USER_STATUS_OPTIONS } from "../constants";
import { getManagerCandidates, updateUser } from "../services/userService";
import {
  userCreateDefaultValues,
  userCreateSchema,
  userUpdateDefaultValues,
  userUpdateSchema,
} from "../validation";

/**
 * @param {{
 *   user?: import('../types/user').ManagedUser | null,
 *   mode: 'create' | 'edit',
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onSaved?: () => void,
 *   roles: Array<{ id: string, name: string }>,
 * }} props
 */
export function UserFormDialog({
  user,
  mode,
  open,
  onOpenChange,
  onSaved,
  roles,
}) {
  const { profile } = useCurrentProfile();
  const [formError, setFormError] = useState(null);
  const [managers, setManagers] = useState([]);
  const isCreate = mode === "create";

  const form = useForm({
    resolver: zodResolver(isCreate ? userCreateSchema : userUpdateSchema),
    defaultValues: isCreate ? userCreateDefaultValues : userUpdateDefaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadManagers() {
      const supabase = getAuthBrowserClient();
      const { data } = await getManagerCandidates(supabase);
      if (!cancelled) {
        setManagers(data ?? []);
      }
    }

    loadManagers();
    setFormError(null);

    if (!isCreate && user) {
      form.reset({
        fullName: user.fullName,
        roleId: user.role?.id ?? "",
        managerProfileId: user.managerProfileId ?? "",
        phone: user.phone ?? "",
        status: user.status,
      });
      return;
    }

    form.reset(userCreateDefaultValues);

    return () => {
      cancelled = true;
    };
  }, [open, user, isCreate, form]);

  async function onSubmit(values) {
    if (!profile) {
      return;
    }

    setFormError(null);

    if (isCreate) {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormError(payload.error ?? "Unable to create user.");
        return;
      }
    } else if (user) {
      if (values.managerProfileId === user.profileId) {
        setFormError("A user cannot be assigned as their own manager.");
        return;
      }

      const supabase = getAuthBrowserClient();
      const { error } = await updateUser(
        supabase,
        user.profileId,
        profile.profileId,
        values
      );

      if (error) {
        setFormError(error.message);
        return;
      }
    }

    onOpenChange(false);
    onSaved?.();
  }

  const titles = {
    create: "Create user",
    edit: "Edit user",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={createDialogOpenChangeHandler(isSubmitting, onOpenChange)}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        onEscapeKeyDown={preventDialogDismissWhenBusy(isSubmitting)}
        onInteractOutside={preventDialogDismissWhenBusy(isSubmitting)}
      >
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "A Supabase Auth account and profile will be created. A Supabase invite email is sent automatically."
              : "Email cannot be changed. Update role, manager, or status to control access."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError ? (
              <Alert variant={isCreate ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Notice</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCreate ? (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="off"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input value={user?.email ?? ""} disabled readOnly />
              </div>
            )}

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerProfileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager</FormLabel>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No manager</SelectItem>
                      {managers
                        .filter((manager) => manager.profileId !== user?.profileId)
                        .map((manager) => (
                          <SelectItem
                            key={manager.profileId}
                            value={manager.profileId}
                          >
                            {manager.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : isCreate ? (
                  "Create user"
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
