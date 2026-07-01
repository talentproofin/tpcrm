import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * @param {{
 *   rows: import('../types/report').TeamSummaryRow[],
 * }} props
 */
export function TeamSummarySection({ rows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team Summary</CardTitle>
        <CardDescription>
          Per-executive breakdown for today&apos;s sales activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No executive data"
            description="Executive profiles will appear here once BDE, Marketing, or Recruiter users are active."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Executive</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead className="hidden sm:table-cell">Activities</TableHead>
                <TableHead className="hidden md:table-cell">Interested</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Follow-ups Completed
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  Demos Scheduled
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.profileId}>
                  <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-none">
                    {row.fullName}
                  </TableCell>
                  <TableCell>{row.calls}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {row.activities}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {row.interested}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {row.followUpsCompleted}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {row.demosScheduled}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
