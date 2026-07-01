"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
import {
  getLeadSources,
  getLeadStages,
  getLeadTypes,
} from "@/services/lookups/lookupService";
import { LEAD_ERROR_CODES } from "../constants/errors";
import { LEAD_ROUTES } from "../constants/routes";
import {
  createLead,
  getAssignableProfiles,
  updateLead,
} from "../services/leadService";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import {
  createLeadDefaultValues,
  createLeadSchema,
  updateLeadSchema,
} from "../validation";
import { OwnerSelect } from "./OwnerSelect";
import { FormSkeleton } from "@/components/feedback/PageSkeletons";
import { ErrorState } from "@/components/feedback/ErrorState";

/**
 * @param {{
 *   mode: 'create' | 'edit',
 *   lead?: import('../types/lead').Lead,
 * }} props
 */
export function LeadForm({ mode, lead }) {
  const { profile, loading: profileLoading, error: profileError } =
    useCurrentProfile();
  const [formError, setFormError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [stages, setStages] = useState([]);
  const [leadTypes, setLeadTypes] = useState([]);
  const [sources, setSources] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);

  const isEdit = mode === "edit";
  const schema = isEdit ? updateLeadSchema : createLeadSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: createLeadDefaultValues,
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    if (!isEdit) {
      form.reset({
        ...createLeadDefaultValues,
        ownerProfileId: profile.profileId,
        assignedToProfileId: profile.profileId,
        stageId: stages[0]?.id ?? "",
        leadTypeId: leadTypes[0]?.id ?? "",
      });
      return;
    }

    if (lead) {
      form.reset({
        organizationName: lead.organizationName,
        website: lead.website ?? "",
        phone: lead.phone ?? "",
        leadTypeId: lead.leadTypeId,
        primaryContactName: lead.primaryContactName ?? "",
        primaryContactPhone: lead.primaryContactPhone ?? "",
        primaryContactEmail: lead.primaryContactEmail ?? "",
        stageId: lead.stageId,
        leadSourceId: lead.leadSourceId ?? "",
        description: lead.description ?? "",
        ownerProfileId: lead.ownerProfileId,
        assignedToProfileId: lead.assignedToProfileId ?? "",
        allowDuplicate: false,
      });
    }
  }, [profile, lead, isEdit, stages, leadTypes, form]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      setLookupsLoading(true);

      try {
        const supabase = getAuthBrowserClient();
        const [stageItems, typeItems, sourceItems, profilesResult] =
          await Promise.all([
            getLeadStages(supabase),
            getLeadTypes(supabase),
            getLeadSources(supabase),
            getAssignableProfiles(supabase),
          ]);

        if (!cancelled) {
          setStages(stageItems);
          setLeadTypes(typeItems);
          setSources(sourceItems);
          setProfiles(profilesResult.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setFormError("Unable to load form options. Please refresh the page.");
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
  const isLoading = profileLoading || lookupsLoading;

  async function onSubmit(values) {
    if (!profile) {
      return;
    }

    setFormError(null);
    setDuplicateWarning(null);

    const supabase = getAuthBrowserClient();

    if (isEdit && lead) {
      const { data, error } = await updateLead(
        supabase,
        profile.profileId,
        lead.id,
        values
      );

      if (error) {
        if (error.code === LEAD_ERROR_CODES.DUPLICATE) {
          setDuplicateWarning(error.message);
          return;
        }

        setFormError(error.message);
        return;
      }

      if (data) {
        toast.success("Lead updated successfully.");
        window.location.href = LEAD_ROUTES.DETAIL(lead.id);
      }

      return;
    }

    const { data, error } = await createLead(supabase, profile.profileId, values);

    if (error) {
      if (error.code === LEAD_ERROR_CODES.DUPLICATE) {
        setDuplicateWarning(error.message);
        return;
      }

      setFormError(error.message);
      return;
    }

    if (data) {
      toast.success("Lead created successfully.");
      window.location.href = LEAD_ROUTES.DETAIL(data.id);
    }
  }

  async function handleCreateAnyway() {
    form.setValue("allowDuplicate", true);
    await form.handleSubmit(onSubmit)();
  }

  if (profileError) {
    return (
      <ErrorState title="Profile required" message={profileError} />
    );
  }

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Unable to save lead</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        {duplicateWarning ? (
          <Alert>
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Possible duplicate</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{duplicateWarning}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={handleCreateAnyway}
              >
                Save anyway
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Organization name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Institute"
                    autoFocus
                    disabled={isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading || isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leadTypes.map((type) => (
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    disabled={isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 555 0100"
                    disabled={isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary contact name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Doe"
                    disabled={isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary contact phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 555 0101"
                    disabled={isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryContactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary contact email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    disabled={isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading || isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
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
            name="leadSourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(value) =>
                    field.onChange(value === "__none__" ? "" : value)
                  }
                  disabled={isLoading || isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
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
            name="ownerProfileId"
            render={({ field }) => (
              <FormItem>
                <OwnerSelect
                  label="Owner"
                  profiles={profiles}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading || isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedToProfileId"
            render={({ field }) => (
              <FormItem>
                <OwnerSelect
                  label="Assigned to"
                  profiles={profiles}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={isLoading || isSubmitting}
                  placeholder="Select assignee"
                  allowEmpty
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Additional context about this lead..."
                    disabled={isLoading || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create lead"
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link
              href={
                isEdit && lead ? LEAD_ROUTES.DETAIL(lead.id) : LEAD_ROUTES.LIST
              }
            >
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
