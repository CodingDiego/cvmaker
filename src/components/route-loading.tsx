import { Skeleton } from "@/components/ui/skeleton";

export function RouteLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page"
      className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6"
    >
      <span className="sr-only">Loading page</span>
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="hidden h-64 rounded-xl lg:block" />
      </div>
    </div>
  );
}
