import { Suspense } from "react";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { LookupManagementView } from "@/features/settings/components/LookupManagementView";

export default function LookupManagementPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
      <LookupManagementView />
    </Suspense>
  );
}
