import { Suspense } from "react";
import nextPackage from "next/package.json";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import { SystemInformationView } from "@/features/settings/components/SystemInformationView";

export default function SystemInformationPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={4} columns={2} />}>
      <SystemInformationView
        nodeVersion={process.version}
        nextVersion={nextPackage.version}
      />
    </Suspense>
  );
}
