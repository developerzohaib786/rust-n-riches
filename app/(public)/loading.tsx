import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function HomeLoading() {
  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-20 text-center">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="h-9 w-full max-w-2xl" />
          <Skeleton className="h-9 w-2/3 max-w-xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <Skeleton className="mt-2 h-11 w-44 rounded-lg" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Skeleton className="h-7 w-48" />
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-3 h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
