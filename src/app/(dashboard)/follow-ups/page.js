import { Suspense } from "react";
import { CardListSkeleton } from "@/components/feedback/PageSkeletons";
import { FollowUpWorkspace } from "@/features/followups/components/FollowUpWorkspace";

export const metadata = {
  title: "Follow-ups | TalentProof Sales CRM",
};

export default function FollowUpsPage() {
  return (
    <Suspense fallback={<CardListSkeleton count={3} />}>
      <FollowUpWorkspace />
    </Suspense>
  );
}
