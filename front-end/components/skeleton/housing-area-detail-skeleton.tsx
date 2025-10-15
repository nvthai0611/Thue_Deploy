import { Skeleton } from "@/components/ui/skeleton";

export default function HousingAreaDetailSkeleton() {
  return (
    <div className="mx-auto px-4 bg-primary-foreground">
      <div className="max-w-4xl mx-auto bg-background p-6">
        {/* Breadcrumbs */}
        <Skeleton className="h-6 w-1/3 mb-4" />

        {/* Status */}
        <Skeleton className="h-6 w-32 mb-6" />

        {/* Cover Image */}
        <Skeleton className="w-full h-56 rounded-lg mb-6" />

        {/* Info Section */}
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
        </div>

        {/* Map Section */}
        <Skeleton className="w-full h-40 rounded-lg mb-6" />

        {/* Room Creation Section */}
        <div className="mb-6">
          <Skeleton className="h-10 w-1/2 mb-2" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>

        {/* Room Management Section */}
        <div className="mt-8">
          <Skeleton className="h-6 w-40 mb-4" />
          {/* Room list skeleton items */}
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
