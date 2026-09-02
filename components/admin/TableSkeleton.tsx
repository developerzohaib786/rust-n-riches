import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showFilters?: boolean;
}

export function TableSkeleton({ columns = 5, rows = 6, showFilters = true }: TableSkeletonProps) {
  return (
    <div>
      {showFilters && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full sm:max-w-xs" />
          <Skeleton className="h-10 w-40" />
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <div className="flex h-11 items-center gap-4 bg-muted px-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1 bg-border" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex h-16 items-center gap-4 border-t border-border px-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
