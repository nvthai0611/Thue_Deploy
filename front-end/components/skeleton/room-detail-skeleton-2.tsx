import { Skeleton } from "@/components/ui/skeleton";

export default function RoomDetailSkeleton() {
  return (
    <div className="bg-primary-foreground pt-5">
      <div className="grid grid-cols-3 gap-6 justify-center items-start max-w-5xl mx-auto py-10">
        {/* Room Detail Skeleton */}
        <div className="col-span-2 bg-white rounded-lg p-8 shadow-lg h-[900px] flex flex-col">
          <Skeleton className="h-16 w-1/2 mx-auto mb-6" />
          <Skeleton className="h-6 w-1/3 mx-auto mb-4" />
          <Skeleton className="h-96 w-full mb-4" />
          <div className="flex gap-4 mt-auto">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        {/* Chat & Comment Skeleton */}
        <div className="flex flex-col gap-6">
          {/* Chat Skeleton */}
          <div className="bg-background pb-4 rounded-lg shadow-lg">
            <div className="flex gap-2 items-center pl-4 my-4">
              <Skeleton className="w-[50px] h-[50px] rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
