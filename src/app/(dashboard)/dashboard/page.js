import { Suspense } from "react";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export const metadata = {
  title: "Dashboard | TalentProof Sales CRM",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<MetricGridSkeleton count={4} />}>
      <DashboardView />
    </Suspense>
  );
}
