import { Suspense } from "react";
import { MetricGridSkeleton } from "@/components/feedback/PageSkeletons";
import { DailyReportPage } from "@/features/reports/components/DailyReportPage";

export const metadata = {
  title: "Daily Report | TalentProof Sales CRM",
};

export default function DailyReportRoute() {
  return (
    <Suspense fallback={<MetricGridSkeleton count={6} />}>
      <DailyReportPage />
    </Suspense>
  );
}
