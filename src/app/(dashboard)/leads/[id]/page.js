"use client";

import { useEffect, useState } from "react";
import { DetailPageSkeleton } from "@/components/feedback/PageSkeletons";
import { LeadDetailView } from "@/features/leads/components/LeadDetailView";

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default function LeadDetailPage({ params }) {
  const [leadId, setLeadId] = useState(null);

  useEffect(() => {
    params.then((resolved) => setLeadId(resolved.id));
  }, [params]);

  if (!leadId) {
    return <DetailPageSkeleton />;
  }

  return <LeadDetailView leadId={leadId} />;
}
