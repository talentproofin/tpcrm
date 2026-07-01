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
import { getActivityTypes } from "@/services/lookups/lookupService";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { saveAdminLookup } from "../services/lookupAdminService";
import { lookupFormDefaultValues, lookupFormSchema } from "../validation";

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   tableName: string,
 *   requiresActivityType?: boolean,
 *   lookup?: import('../types/settings').AdminLookupItem | null,
 *   defaultActivityTypeId?: string,
 *   onSaved?: () => void,
 * }} props
 */
export function LookupFormDialog({
  open,
  onOpenChange,
  tableName,
  requiresActivityType = false,
  lookup = null,
  defaultActivityTypeId = "",
  onSaved,
}) {
  const { profile } = useCurrentProfile();
  const [formError, setFormError] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const isEdit = Boolean(lookup);

  const form = useForm({
    resolver: zodResolver(lookupFormSchema),
    defaultValues: lookupFormDefaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!open || !requiresActivityType) {
      return;
    }

    let cancelled = false;

    async function loadActivityTypes() {
      const supabase = getAuthBrowserClient();
      const items = await getActivityTypes(supabase, { activeOnly: false });

      if (!cancelled) {
        setActivityTypes(items);
      }
    }

    loadActivityTypes();

    return () => {
      cancelled = true;
    };
  }, [open, requiresActivityType]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormError(null);

    if (lookup) {
      form.reset({
        code: lookup.code,
        name: lookup.name,
        displayOrder: lookup.displayOrder,
        activityTypeId: lookup.activityTypeId ?? "",
      });
      return;
    }

    form.reset({
      ...lookupFormDefaultValues,
      activityTypeId: defaultActivityTypeId,
      displayOrder: 1,
    });
  }, [defaultActivityTypeId, form, lookup, open]);

  async function onSubmit(values) {
    if (!profile) {
      return;
    }

    setFormError(null);

    const supabase = getAuthBrowserClient();
    const { error } = await saveAdminLookup(supabase, {
      tableName,
      recordId: lookup?.id ?? null,
      code: values.code,
      name: values.name,
      displayOrder: values.displayOrder,
      activityTypeId: values.activityTypeId || null,
      profileId: profile.profileId,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    onOpenChange(false);
    onSaved?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={createDialogOpenChangeHandler(isSubmitting, onOpenChange)}
    >
      <DialogContent
        onEscapeKeyDown={preventDialogDismissWhenBusy(isSubmitting)}
        onInteractOutside={preventDialogDismissWhenBusy(isSubmitting)}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lookup" : "Add lookup"}</DialogTitle>
          <DialogDescription>
            Codes must be unique and display order controls list sorting.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unable to save lookup</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            {requiresActivityType ? (
              <FormField
                control={form.control}
                name="activityTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting || isEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display order</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
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
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save lookup"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
