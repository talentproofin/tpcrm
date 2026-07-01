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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import { createContact, updateContact } from "../services/contactService";
import { contactDefaultValues, contactSchema } from "../validation";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";

/**
 * @param {{
 *   leadId: string,
 *   contact?: import('../types/contact').Contact | null,
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onSaved?: () => void,
 *   disabled?: boolean,
 * }} props
 */
export function ContactFormDialog({
  leadId,
  contact,
  open,
  onOpenChange,
  onSaved,
  disabled = false,
}) {
  const { profile } = useCurrentProfile();
  const [formError, setFormError] = useState(null);
  const isEdit = Boolean(contact);

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: contactDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormError(null);

    if (contact) {
      form.reset({
        fullName: contact.fullName,
        designation: contact.designation ?? "",
        department: contact.department ?? "",
        mobileNumber: contact.mobileNumber ?? "",
        alternateNumber: contact.alternateNumber ?? "",
        email: contact.email ?? "",
        linkedinProfileUrl: contact.linkedinProfileUrl ?? "",
        notes: contact.notes ?? "",
        isPrimary: contact.isPrimary,
        isActive: contact.isActive,
      });
      return;
    }

    form.reset(contactDefaultValues);
  }, [open, contact, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values) {
    if (!profile) {
      return;
    }

    setFormError(null);

    const supabase = getAuthBrowserClient();

    if (isEdit && contact) {
      const { error } = await updateContact(
        supabase,
        profile.profileId,
        contact.id,
        values
      );

      if (error) {
        setFormError(error.message);
        return;
      }
    } else {
      const { error } = await createContact(
        supabase,
        profile.profileId,
        leadId,
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
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onEscapeKeyDown={preventDialogDismissWhenBusy(isSubmitting)}
        onInteractOutside={preventDialogDismissWhenBusy(isSubmitting)}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit contact" : "Add contact"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update contact details. Primary contacts sync to the lead record."
              : "Add a new contact for this lead."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Unable to save contact</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder="Jane Doe"
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
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Director of Admissions"
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Admissions"
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
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 555 0100"
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
                name="alternateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 555 0101"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jane@example.com"
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
                name="linkedinProfileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn profile URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/janedoe"
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Additional context about this contact..."
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
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-start gap-3 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border border-input"
                        checked={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                        disabled={
                          disabled ||
                          isSubmitting ||
                          (contact?.isPrimary && isEdit)
                        }
                        aria-label="Mark as primary contact"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-medium">Primary contact</FormLabel>
                      <FormDescription>
                        Syncs name, mobile, and email to the lead&apos;s primary
                        contact fields.
                        {contact?.isPrimary && isEdit
                          ? " Assign another primary contact before removing this flag."
                          : ""}
                      </FormDescription>
                    </div>
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
                ) : isEdit ? (
                  "Save contact"
                ) : (
                  "Add contact"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
