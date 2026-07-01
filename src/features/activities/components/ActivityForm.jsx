"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { getAssignableProfiles } from "@/features/leads/services/leadService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { OwnerSelect } from "@/features/leads/components/OwnerSelect";
import { FormSkeleton } from "@/components/feedback/PageSkeletons";
import {
  getActivityOutcomes,
  getActivityTypes,
} from "@/services/lookups/lookupService";
import { createActivity } from "../services/activityService";
import {
  ACTIVITY_DIRECTION_LABELS,
  ACTIVITY_DIRECTIONS,
  DEFAULT_ACTIVITY_DIRECTION,
} from "../constants/direction";
import {
  createActivityDefaultValues,
  createActivitySchema,
  createActivityValidationSchema,
} from "../validation";
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "../utils/datetime";

/**
 * @param {{
 *   leadId: string,
 *   disabled?: boolean,
 *   onSuccess?: () => void,
 *   onCancel?: () => void,
 *   onSubmittingChange?: (isSubmitting: boolean) => void,
 * }} props
 */
export function ActivityForm({
  leadId,
  disabled = false,
  onSuccess,
  onCancel,
  onSubmittingChange,
}) {
  const { profile } = useCurrentProfile();
  const [formError, setFormError] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [activityOutcomes, setActivityOutcomes] = useState(
    /** @type {import('@/types/lookups').ActivityOutcomeItem[]} */ ([])
  );
  const [profiles, setProfiles] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      ...createActivityDefaultValues,
      occurredAt: new Date().toISOString(),
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.reset({
      ...createActivityDefaultValues,
      performedByProfileId: profile.profileId,
      occurredAt: new Date().toISOString(),
      nextFollowUp: {
        dueAt: "",
        assignedToProfileId: profile.profileId,
        notes: "",
      },
    });
  }, [profile, form]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      setLookupsLoading(true);

      try {
        const supabase = getAuthBrowserClient();
        const [types, outcomes, profilesResult] = await Promise.all([
          getActivityTypes(supabase),
          getActivityOutcomes(supabase),
          getAssignableProfiles(supabase),
        ]);

        if (!cancelled) {
          setActivityTypes(types);
          setActivityOutcomes(outcomes);
          setProfiles(profilesResult.data ?? []);
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

  const selectedTypeId = form.watch("activityTypeId");
  const filteredOutcomes = activityOutcomes.filter(
    (outcome) => outcome.activityTypeId === selectedTypeId
  );

  const isSubmitting = form.formState.isSubmitting;
  const isLoading = lookupsLoading;

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  async function onSubmit(values) {
    if (!profile || activityTypes.length === 0 || activityOutcomes.length === 0) {
      return;
    }

    setFormError(null);

    const schema = createActivityValidationSchema(
      activityTypes,
      activityOutcomes
    );
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    const supabase = getAuthBrowserClient();
    const { error } = await createActivity(
      supabase,
      profile.profileId,
      leadId,
      parsed.data
    );

    if (error) {
      setFormError(error.message);
      return;
    }

    onSuccess?.();
  }

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Unable to log activity</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
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
                  disabled={disabled || isLoading || isSubmitting}
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
                    disabled ||
                    isLoading ||
                    isSubmitting ||
                    !selectedTypeId
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedTypeId
                            ? "Select outcome"
                            : "Select activity type first"
                        }
                      />
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
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction</FormLabel>
                <Select
                  value={field.value ?? DEFAULT_ACTIVITY_DIRECTION}
                  onValueChange={field.onChange}
                  disabled={disabled || isLoading || isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Outbound" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACTIVITY_DIRECTIONS.map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {ACTIVITY_DIRECTION_LABELS[direction]}
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
            name="performedByProfileId"
            render={({ field }) => (
              <FormItem>
                <OwnerSelect
                  label="Performed by"
                  profiles={profiles}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled || isLoading || isSubmitting}
                  placeholder="Select performer"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occurredAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occurred at</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    disabled={disabled || isLoading || isSubmitting}
                    value={toDateTimeLocalValue(field.value)}
                    onChange={(event) =>
                      field.onChange(fromDateTimeLocalValue(event.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remark"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Remark</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="What happened during this touchpoint?"
                    disabled={disabled || isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-md border p-4">
          <p className="mb-4 text-sm font-medium">Next follow-up</p>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="nextFollowUp.dueAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due at</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={disabled || isLoading || isSubmitting}
                      value={toDateTimeLocalValue(field.value)}
                      onChange={(event) =>
                        field.onChange(
                          fromDateTimeLocalValue(event.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextFollowUp.assignedToProfileId"
              render={({ field }) => (
                <FormItem>
                  <OwnerSelect
                    label="Assigned to"
                    profiles={profiles}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled || isLoading || isSubmitting}
                    placeholder="Select assignee"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextFollowUp.notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Follow-up notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Optional context for the next touchpoint"
                      disabled={disabled || isLoading || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={disabled || isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Log activity"
            )}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
