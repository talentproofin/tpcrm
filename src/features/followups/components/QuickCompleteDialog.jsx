"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { createActivityValidationSchema } from "@/features/activities/validation";
import {
  getActivityOutcomes,
  getActivityTypes,
} from "@/services/lookups/lookupService";
import { completeFollowUp } from "../services/followUpService";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import {
  combineDateAndTime,
  defaultNextFollowUpDateInput,
  quickCompleteDefaultValues,
  quickCompleteSchema,
} from "../validation";

/**
 * @param {{
 *   followUp: import('../types/followUp').FollowUpWorkspaceItem | null,
 *   profileId: string | null,
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onCompleted?: () => void,
 * }} props
 */
export function QuickCompleteDialog({
  followUp,
  profileId,
  open,
  onOpenChange,
  onCompleted,
}) {
  const [formError, setFormError] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [activityOutcomes, setActivityOutcomes] = useState(
    /** @type {import('@/types/lookups').ActivityOutcomeItem[]} */ ([])
  );
  const [lookupsLoading, setLookupsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(quickCompleteSchema),
    defaultValues: quickCompleteDefaultValues,
  });

  const selectedTypeId = form.watch("activityTypeId");
  const filteredOutcomes = activityOutcomes.filter(
    (outcome) => outcome.activityTypeId === selectedTypeId
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      ...quickCompleteDefaultValues,
      nextFollowUpDate: defaultNextFollowUpDateInput(),
      nextFollowUpTime: "09:00",
    });
    setFormError(null);
  }, [open, followUp, form]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      setLookupsLoading(true);

      try {
        const supabase = getAuthBrowserClient();
        const [types, outcomes] = await Promise.all([
          getActivityTypes(supabase),
          getActivityOutcomes(supabase),
        ]);

        if (!cancelled) {
          setActivityTypes(types);
          setActivityOutcomes(outcomes);
        }
      } catch {
        if (!cancelled) {
          setFormError("Unable to load activity options. Please refresh.");
        }
      } finally {
        if (!cancelled) {
          setLookupsLoading(false);
        }
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values) {
    if (!followUp || !profileId || activityTypes.length === 0) {
      return;
    }

    setFormError(null);

    const nextFollowUpDueAt = combineDateAndTime(
      values.nextFollowUpDate,
      values.nextFollowUpTime
    );

    const activityPayload = {
      activityTypeId: values.activityTypeId,
      activityOutcomeId: values.activityOutcomeId,
      direction: "outbound",
      remark: values.summary,
      performedByProfileId: profileId,
      occurredAt: new Date().toISOString(),
      nextFollowUp: {
        dueAt: nextFollowUpDueAt,
        assignedToProfileId: followUp.assignedToProfileId,
        notes: "",
      },
    };

    const schema = createActivityValidationSchema(
      activityTypes,
      activityOutcomes
    );
    const activityValidation = schema.safeParse(activityPayload);

    if (!activityValidation.success) {
      for (const issue of activityValidation.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in values) {
          form.setError(field, { type: "manual", message: issue.message });
        } else if (issue.path[0] === "activityOutcomeId") {
          form.setError("activityOutcomeId", {
            type: "manual",
            message: issue.message,
          });
        }
      }
      return;
    }

    const supabase = getAuthBrowserClient();
    const { error } = await completeFollowUp(
      supabase,
      profileId,
      activityTypes,
      activityOutcomes,
      {
        followUpId: followUp.id,
        activityTypeId: values.activityTypeId,
        activityOutcomeId: values.activityOutcomeId,
        summary: values.summary,
        nextFollowUpDueAt,
        assignedToProfileId: followUp.assignedToProfileId,
      }
    );

    if (error) {
      setFormError(error.message);
      return;
    }

    onCompleted?.();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={createDialogOpenChangeHandler(isSubmitting, onOpenChange)}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onEscapeKeyDown={preventDialogDismissWhenBusy(isSubmitting)}
        onInteractOutside={preventDialogDismissWhenBusy(isSubmitting)}
      >
        <DialogHeader>
          <DialogTitle>Complete follow-up</DialogTitle>
          <DialogDescription>
            Log the interaction and schedule the next follow-up for{" "}
            {followUp?.lead.organizationName ?? "this lead"}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Unable to complete</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="activityTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("activityOutcomeId", "");
                      }}
                      disabled={lookupsLoading || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger autoFocus>
                          <SelectValue placeholder="Select type" />
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

              <FormField
                control={form.control}
                name="activityOutcomeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outcome</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        lookupsLoading || isSubmitting || !selectedTypeId
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredOutcomes.map((outcome) => (
                          <SelectItem key={outcome.id} value={outcome.id}>
                            {outcome.name}
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
                name="summary"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Brief summary of the interaction"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextFollowUpDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next follow-up date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextFollowUpTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next follow-up time</FormLabel>
                    <FormControl>
                      <Input type="time" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={lookupsLoading || isSubmitting}>
                {isSubmitting ? (
                  <LoadingSpinner label="Saving..." />
                ) : (
                  "Complete & schedule next"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
