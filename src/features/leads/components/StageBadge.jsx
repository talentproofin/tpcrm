import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

const STAGE_VARIANTS = {
  new: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  contacted: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  interested: "bg-violet-100 text-violet-800 hover:bg-violet-100",
  demo_scheduled: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  demo_completed: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  onboarding_in_progress: "bg-teal-100 text-teal-800 hover:bg-teal-100",
  onboarded: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  lost: "bg-rose-100 text-rose-800 hover:bg-rose-100",
  archived: "bg-slate-200 text-slate-700 hover:bg-slate-200",
};

/**
 * @param {{ stage: import('../types/lead').LeadStageSummary | null | undefined, className?: string }} props
 */
export function StageBadge({ stage, className }) {
  if (!stage) {
    return (
      <Badge variant="outline" className={className}>
        Unknown
      </Badge>
    );
  }

  const variant =
    STAGE_VARIANTS[/** @type {keyof typeof STAGE_VARIANTS} */ (stage.code)] ??
    "bg-muted text-muted-foreground hover:bg-muted";

  return (
    <Badge className={cn("font-medium", variant, className)}>{stage.name}</Badge>
  );
}
