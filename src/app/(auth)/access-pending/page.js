import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AccessPendingView } from "@/features/auth/components/AccessPendingView";

export const metadata = {
  title: "Access Pending | TalentProof Sales CRM",
};

function AccessPendingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

export default function AccessPendingPage() {
  return (
    <Suspense fallback={<AccessPendingFallback />}>
      <AccessPendingView />
    </Suspense>
  );
}
