"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { getRoleById } from "@/features/auth/services/profileService";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import {
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../constants";
import {
  canAccessSettings,
  canManageSettings,
} from "../constants/permissions";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from "../services/organizationService";
import {
  organizationSettingsDefaultValues,
  organizationSettingsSchema,
} from "../validation";
import { ArchiveConfirmDialog } from "./ArchiveConfirmDialog";

export function OrganizationSettingsView() {
  const { profile } = useCurrentProfile();
  const [roleCode, setRoleCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [savedTimezone, setSavedTimezone] = useState("");
  const [pendingValues, setPendingValues] = useState(null);
  const [timezoneConfirmOpen, setTimezoneConfirmOpen] = useState(false);

  const canAccess = canAccessSettings(roleCode);
  const canManage = canManageSettings(roleCode);

  const form = useForm({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: organizationSettingsDefaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    let cancelled = false;

    async function loadIdentity() {
      if (!profile) {
        return;
      }

      const supabase = getAuthBrowserClient();
      const role = await getRoleById(supabase, profile.roleId);

      if (!cancelled) {
        setRoleCode(role?.code ?? null);
      }
    }

    loadIdentity();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (!canAccess) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const supabase = getAuthBrowserClient();
      const { data, error: loadError } = await getOrganizationSettings(supabase);

      if (cancelled) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
      } else if (data) {
        form.reset(data);
        setSavedTimezone(data.timezone);
      }

      setLoading(false);
    }

    if (roleCode) {
      loadSettings();
    }

    return () => {
      cancelled = true;
    };
  }, [canAccess, form, roleCode]);

  async function saveSettings(values) {
    if (!profile || !canManage) {
      return;
    }

    setFormError(null);

    const supabase = getAuthBrowserClient();
    const { error: saveError } = await updateOrganizationSettings(
      supabase,
      values,
      profile.profileId
    );

    if (saveError) {
      setFormError(saveError.message);
      return;
    }

    setSavedTimezone(values.timezone);
    toast.success("Organization settings updated.");
  }

  async function onSubmit(values) {
    if (values.timezone !== savedTimezone) {
      setPendingValues(values);
      setTimezoneConfirmOpen(true);
      return;
    }

    await saveSettings(values);
  }

  async function handleTimezoneConfirm() {
    if (!pendingValues) {
      return;
    }

    await saveSettings(pendingValues);
    setPendingValues(null);
    setTimezoneConfirmOpen(false);
  }

  if (roleCode && !canAccess) {
    return (
      <EmptyState
        icon={Settings2}
        title="Access restricted"
        description="System settings are not available for your role."
      />
    );
  }

  if (loading) {
    return <TableSkeleton rows={6} columns={2} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Organization settings</CardTitle>
          <CardDescription>
            {canManage
              ? "Manage business information and system defaults for the organization."
              : "Read-only view of organization settings."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {formError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Unable to save settings</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold">Business information</h2>
                  <p className="text-sm text-muted-foreground">
                    Contact and location details for your organization.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Organization name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            disabled={!canManage || isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact phone</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canManage || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold">System settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Timezone, business hours, and display formats.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!canManage || isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIMEZONE_OPTIONS.map((timezone) => (
                              <SelectItem key={timezone} value={timezone}>
                                {timezone}
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
                    name="defaultFollowupTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default follow-up time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            disabled={!canManage || isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessHoursStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business hours start</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            disabled={!canManage || isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessHoursEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business hours end</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            disabled={!canManage || isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date format</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!canManage || isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DATE_FORMAT_OPTIONS.map((format) => (
                              <SelectItem key={format} value={format}>
                                {format}
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
                    name="timeFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time format</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!canManage || isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_FORMAT_OPTIONS.map((format) => (
                              <SelectItem key={format} value={format}>
                                {format}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {canManage ? (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>

      <ArchiveConfirmDialog
        open={timezoneConfirmOpen}
        onOpenChange={setTimezoneConfirmOpen}
        title="Change organization timezone?"
        description={`Timezone will change from ${savedTimezone || "current"} to ${pendingValues?.timezone ?? "selected"}. Scheduled times and reports may be affected.`}
        confirmLabel="Change timezone"
        busy={isSubmitting}
        onConfirm={handleTimezoneConfirm}
      />
    </>
  );
}
