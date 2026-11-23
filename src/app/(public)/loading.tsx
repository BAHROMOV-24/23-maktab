import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10" aria-busy="true" aria-label="Yuklanmoqda">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    </div>
  );
}
