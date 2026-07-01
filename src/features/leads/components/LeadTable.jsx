import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LEAD_ROUTES } from "../constants/routes";
import { StageBadge } from "./StageBadge";

/**
 * @param {{
 *   items: import('../types/lead').LeadListItem[],
 *   onView: (id: string) => void,
 *   loading?: boolean,
 *   hasActiveFilters?: boolean,
 * }} props
 */
export function LeadTable({
  items,
  onView,
  loading = false,
  hasActiveFilters = false,
}) {
  if (loading) {
    return <TableSkeleton rows={6} columns={5} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? "No matching leads" : "No leads yet"}
        description={
          hasActiveFilters
            ? "Try adjusting your filters or search to find leads."
            : "Create your first lead to start building your pipeline."
        }
        action={
          hasActiveFilters ? null : (
            <Button asChild>
              <Link href={LEAD_ROUTES.NEW}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create lead
              </Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead className="hidden md:table-cell">Owner</TableHead>
          <TableHead className="hidden lg:table-cell">Contact email</TableHead>
          <TableHead className="hidden sm:table-cell">Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="max-w-[12rem] truncate font-medium sm:max-w-none">
              {lead.organizationName}
            </TableCell>
            <TableCell>{lead.leadType?.name ?? "—"}</TableCell>
            <TableCell>
              <StageBadge stage={lead.stage} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {lead.owner?.fullName ?? "—"}
            </TableCell>
            <TableCell className="hidden max-w-[10rem] truncate lg:table-cell">
              {lead.primaryContactEmail ?? "—"}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {new Date(lead.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onView(lead.id)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
