import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 rounded-xl border border-border p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-6 h-24 w-full" />
        <Skeleton className="mt-6 h-11 w-full" />
      </div>
    </div>
  );
}
