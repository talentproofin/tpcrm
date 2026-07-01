export const metadata = {
  title: "New Lead | TalentProof Sales CRM",
};

import { LeadForm } from "@/features/leads/components/LeadForm";

export default function NewLeadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create lead</h1>
        <p className="text-sm text-muted-foreground">
          Add a new opportunity to your pipeline.
        </p>
      </div>
      <LeadForm mode="create" />
    </div>
  );
}
