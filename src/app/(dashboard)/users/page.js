import { Suspense } from "react";
import { UserListView } from "@/features/users/components/UserListView";
import { TableSkeleton } from "@/components/feedback/PageSkeletons";

export default function UsersPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={7} />}>
      <UserListView />
    </Suspense>
  );
}
