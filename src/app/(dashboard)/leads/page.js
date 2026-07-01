import { Suspense } from "react";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { LeadListView } from "@/features/leads/components/LeadListView";

export const metadata = {
  title: "Leads | TalentProof Sales CRM",
};

export default function LeadsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
      <LeadListView />
    </Suspense>
  );
}
