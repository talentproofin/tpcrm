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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { getDemoOutcomes } from "@/services/lookups/lookupService";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import { completeDemo, updateCompletedDemo } from "../services/demoService";
import {
  demoCompleteDefaultValues,
  demoCompleteSchema,
  demoCompletedEditDefaultValues,
  demoCompletedEditSchema,
} from "../validation";

/**
 * @param {{
 *   demo: import('../types/demo').Demo | null,
 *   mode: 'complete' | 'editCompleted',
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onSaved?: () => void,
 * }} props
 */
export function DemoActionDialog({
  demo,
  mode,
  open,
  onOpenChange,
  onSaved,
}) {
  const { profile } = useCurrentProfile();
  const [formError, setFormError] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const isComplete = mode === "complete";

  const form = useForm({
    resolver: zodResolver(
      isComplete ? demoCompleteSchema : demoCompletedEditSchema
    ),
    defaultValues: isComplete
      ? demoCompleteDefaultValues
      : demoCompletedEditDefaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadOutcomes() {
      if (!isComplete) {
        return;
      }

      const supabase = getAuthBrowserClient();
      const data = await getDemoOutcomes(supabase);
      if (!cancelled) {
        setOutcomes(data ?? []);
      }
    }

    loadOutcomes();
    setFormError(null);

    if (isComplete) {
      form.reset(demoCompleteDefaultValues);
    } else {
      form.reset({
        summary: demo?.summary ?? "",
        internalNotes: demo?.internalNotes ?? "",
      });
    }

    return () => {
      cancelled = true;
    };
  }, [open, demo, isComplete, form]);

  async function onSubmit(values) {
    if (!profile || !demo) {
      return;
    }

    setFormError(null);
    const supabase = getAuthBrowserClient();

    if (isComplete) {
      const { error } = await completeDemo(
        supabase,
        profile.profileId,
        demo.id,
        values
      );

      if (error) {
        setFormError(error.message);
        return;
      }
    } else {
      const { error } = await updateCompletedDemo(
        supabase,
        profile.profileId,
        demo,
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
          <DialogTitle>
            {isComplete ? "Complete demo" : "Edit demo summary"}
          </DialogTitle>
          <DialogDescription>
            {isComplete
              ? `Record the outcome and summary for the demo on ${demo ? new Date(demo.scheduledAt).toLocaleString() : "this lead"}.`
              : "Update the summary and internal notes for this completed demo."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Unable to save</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            {isComplete ? (
              <FormField
                control={form.control}
                name="demoOutcomeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outcome</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outcomes.map((outcome) => (
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
            ) : null}

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      autoFocus
                      placeholder="What happened during the demo?"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isComplete ? (
              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Private notes for your team"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

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
                ) : isComplete ? (
                  "Complete demo"
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
