import { Skeleton } from "@/components/ui/skeleton";

export default function RoomDetailSkeleton() {
  return (
    <div className="bg-primary-foreground">
      <div className="max-w-5xl mx-auto bg-background shadow-lg p-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main image skeleton + carousel */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Main image */}
            <Skeleton className="w-full h-72 md:h-96 rounded-lg mb-2" />
            {/* Carousel thumbnails */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1/3">
                  <Skeleton className="aspect-video rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          {/* Room details skeleton */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <Skeleton className="h-8 w-2/3 rounded mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-6 w-24 rounded" />
              </div>
              <Skeleton className="h-5 w-32 rounded mb-2" />
              <Skeleton className="h-5 w-40 rounded mb-2" />
              <Skeleton className="h-5 w-48 rounded mb-2" />
              <div className="mt-4">
                <Skeleton className="h-6 w-24 rounded mb-2" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-6 w-16 rounded" />
                  ))}
                </div>
                <div className="mt-8 flex gap-4">
                  <Skeleton className="h-10 w-32 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tenant Table Skeleton */}
        <div className="mt-10">
          <Skeleton className="h-6 w-40 rounded mb-4" />
          <div className="rounded-xl border bg-background shadow">
            <div className="w-full table-fixed">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex border-b last:border-0">
                  {[1, 2, 3, 4].map((col) => (
                    <Skeleton key={col} className="h-10 flex-1 rounded m-2" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
