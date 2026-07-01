import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { LEAD_ROUTES } from "@/features/leads/constants/routes";

/**
 * @param {{
 *   activities: import('../types/dashboard').RecentActivityRow[],
 * }} props
 */
export function RecentActivitiesTable({ activities }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activities</CardTitle>
        <CardDescription>
          Today&apos;s latest interactions. Select a row to open lead details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No activities today"
            description="Activities logged today will appear here."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href={LEAD_ROUTES.LIST}>View leads</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="hidden sm:table-cell">Outcome</TableHead>
                <TableHead className="hidden md:table-cell">Performed by</TableHead>
                <TableHead className="hidden lg:table-cell">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="max-w-[10rem] truncate sm:max-w-none">
                    <Link
                      href={LEAD_ROUTES.DETAIL(activity.leadId)}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {activity.organizationName}
                    </Link>
                  </TableCell>
                  <TableCell>{activity.activityTypeName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {activity.outcomeName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {activity.performerName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(activity.occurredAt).toLocaleString()}
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
