import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function CustomersLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6">
        <TableSkeleton columns={6} />
      </div>
    </div>
  );
}
