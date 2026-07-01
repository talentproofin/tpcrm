import { Button } from "@/components/ui/button";

/**
 * @param {{
 *   page: number,
 *   totalPages: number,
 *   total: number,
 *   onPageChange: (page: number) => void,
 *   disabled?: boolean,
 * }} props
 */
export function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} lead{total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
