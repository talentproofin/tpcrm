import { Loader2 } from "lucide-react";

/**
 * @param {{ label?: string, className?: string }} props
 */
export function LoadingSpinner({
  label = "Loading...",
  className = "",
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
