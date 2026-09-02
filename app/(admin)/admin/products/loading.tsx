import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function ProductsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6">
        <TableSkeleton columns={7} />
      </div>
    </div>
  );
}
