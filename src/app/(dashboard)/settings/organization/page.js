import { Suspense } from "react";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { OrganizationSettingsView } from "@/features/settings/components/OrganizationSettingsView";

export default function OrganizationSettingsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={4} columns={2} />}>
      <OrganizationSettingsView />
    </Suspense>
  );
}
