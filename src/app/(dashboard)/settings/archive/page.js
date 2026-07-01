import { Suspense } from "react";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { ArchiveManagementView } from "@/features/settings/components/ArchiveManagementView";

export default function ArchiveManagementPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
      <ArchiveManagementView />
    </Suspense>
  );
}
