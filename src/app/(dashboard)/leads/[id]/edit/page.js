"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DetailPageSkeleton } from "@/components/feedback/PageSkeletons";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { LeadForm } from "@/features/leads/components/LeadForm";
import { LEAD_ROUTES } from "@/features/leads/constants/routes";
import { getLead } from "@/features/leads/services/leadService";

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default function EditLeadPage({ params }) {
  const [leadId, setLeadId] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    params.then((resolved) => setLeadId(resolved.id));
  }, [params]);

  const loadLead = useCallback(async () => {
    if (!leadId) {
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getLead(supabase, leadId);

    if (loadError) {
      setError(loadError.message);
      setLead(null);
    } else {
      setLead(data);
    }

    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  if (!leadId || loading) {
    return <DetailPageSkeleton />;
  }

  if (error || !lead) {
    return (
      <ErrorState
        title="Unable to edit lead"
        message={error ?? "Lead not found."}
        onRetry={loadLead}
      />
    );
  }

  if (lead.deletedAt) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Lead is trashed</AlertTitle>
        <AlertDescription>
          Trashed leads cannot be edited.{" "}
          <Link href={LEAD_ROUTES.DETAIL(lead.id)} className="underline">
            View lead
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit lead</h1>
        <p className="text-sm text-muted-foreground">
          Update details for {lead.organizationName}.
        </p>
      </div>
      <LeadForm mode="edit" lead={lead} />
    </div>
  );
}
