import Link from "next/link";
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
import { leadListHref } from "../constants/routes";

/**
 * @param {{
 *   rows: import('../types/dashboard').TeamPerformanceRow[],
 * }} props
 */
export function TeamPerformanceTable({ rows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team Performance</CardTitle>
        <CardDescription>
          Today&apos;s activity and follow-up counts by team member.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team activity today"
            description="Team performance will appear once members log activities or complete follow-ups."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team member</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead className="hidden sm:table-cell">Completed</TableHead>
                <TableHead className="hidden md:table-cell">Interested</TableHead>
                <TableHead className="hidden lg:table-cell">Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.profileId}>
                  <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-none">
                    <Link
                      href={leadListHref({ ownerProfileId: row.profileId })}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {row.fullName}
                    </Link>
                  </TableCell>
                  <TableCell>{row.activitiesToday}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {row.completedToday}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {row.interestedToday}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {row.overdueFollowUps}
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
