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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { OwnerSelect } from "@/features/leads/components/OwnerSelect";
import { getAssignableProfiles } from "@/features/leads/services/leadService";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { DEMO_MODE_OPTIONS } from "../constants";
import {
  rescheduleDemo,
  scheduleDemo,
  updateDemo,
} from "../services/demoService";
import {
  demoScheduleDefaultValues,
  demoScheduleSchema,
} from "../validation";
import { toDateTimeLocalValue } from "@/features/activities/utils/datetime";

/**
 * @param {{
 *   leadId: string,
 *   demo?: import('../types/demo').Demo | null,
 *   mode: 'schedule' | 'edit' | 'reschedule',
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onSaved?: () => void,
 *   disabled?: boolean,
 * }} props
 */
export function DemoFormDialog({
  leadId,
  demo,
  mode,
  open,
  onOpenChange,
  onSaved,
  disabled = false,
}) {
  const { profile } = useCurrentProfile();
  const [formError, setFormError] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const form = useForm({
    resolver: zodResolver(demoScheduleSchema),
    defaultValues: demoScheduleDefaultValues,
  });

  const demoMode = form.watch("demoMode");
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadProfiles() {
      const supabase = getAuthBrowserClient();
      const { data } = await getAssignableProfiles(supabase);
      if (!cancelled) {
        setProfiles(data ?? []);
      }
    }

    loadProfiles();
    setFormError(null);

    if (demo && (mode === "edit" || mode === "reschedule")) {
      const local = toDateTimeLocalValue(demo.scheduledAt);
      const [demoDate, demoTime] = local.split("T");

      form.reset({
        demoDate: demoDate ?? demoScheduleDefaultValues.demoDate,
        demoTime: demoTime ?? demoScheduleDefaultValues.demoTime,
        durationMinutes: demo.durationMinutes,
        demoMode: demo.demoMode,
        meetingLink: demo.meetingLink ?? "",
        venue: demo.venue ?? "",
        presenterProfileId: demo.presenterProfileId,
        attendees: demo.attendees ?? "",
        internalNotes: demo.internalNotes ?? "",
      });
      return;
    }

    form.reset({
      ...demoScheduleDefaultValues,
      presenterProfileId: profile?.profileId ?? "",
    });

    return () => {
      cancelled = true;
    };
  }, [open, demo, mode, form, profile]);

  async function onSubmit(values) {
    if (!profile) {
      return;
    }

    setFormError(null);
    const supabase = getAuthBrowserClient();

    if (mode === "schedule") {
      const { error } = await scheduleDemo(
        supabase,
        profile.profileId,
        leadId,
        values
      );

      if (error) {
        setFormError(error.message);
        return;
      }
    } else if (mode === "edit" && demo) {
      const { error } = await updateDemo(
        supabase,
        profile.profileId,
        demo.id,
        values
      );

      if (error) {
        setFormError(error.message);
        return;
      }
    } else if (mode === "reschedule" && demo) {
      const { error } = await rescheduleDemo(
        supabase,
        profile.profileId,
        demo.id,
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
    schedule: "Schedule demo",
    edit: "Edit demo",
    reschedule: "Reschedule demo",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={createDialogOpenChangeHandler(isSubmitting, onOpenChange)}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onEscapeKeyDown={preventDialogDismissWhenBusy(isSubmitting)}
        onInteractOutside={preventDialogDismissWhenBusy(isSubmitting)}
      >
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            {mode === "reschedule"
              ? "The demo date and time will be updated. The previous schedule is recorded in the audit log."
              : "A follow-up will be created automatically for the demo date when scheduled."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Unable to save demo</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="demoDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={disabled || isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="demoTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo time</FormLabel>
                    <FormControl>
                      <Input type="time" disabled={disabled || isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        disabled={disabled || isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="demoMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo mode</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={disabled || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEMO_MODE_OPTIONS.map((option) => (
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

              <FormField
                control={form.control}
                name="presenterProfileId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <OwnerSelect
                      label="Presenter"
                      profiles={profiles}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={disabled || isSubmitting}
                      placeholder="Select presenter"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {demoMode === "online" ? (
                <FormField
                  control={form.control}
                  name="meetingLink"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Meeting link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://meet.example.com/room"
                          disabled={disabled || isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Office address or meeting room"
                          disabled={disabled || isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Attendees</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Names or roles attending the demo"
                        disabled={disabled || isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Internal notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Preparation notes or agenda"
                        disabled={disabled || isSubmitting}
                        {...field}
                      />
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
              <Button type="submit" disabled={disabled || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : mode === "schedule" ? (
                  "Schedule demo"
                ) : mode === "reschedule" ? (
                  "Reschedule demo"
                ) : (
                  "Save demo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
