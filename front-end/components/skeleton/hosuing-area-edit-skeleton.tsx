import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function HousingAreaEditSkeleton() {
  return (
    <div className="bg-primary-foreground px-4 md:px-6">
      <div className="max-w-5xl mx-auto bg-background p-6 min-h-screen">
        <div className="bg-background mx-auto flex flex-col md:flex-row gap-8 p-6">
          <div className="md:w-1/5 pt-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="border border-dashed rounded-lg aspect-square flex flex-col items-center justify-center">
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
          <div className="md:w-4/5">
            <div className="bg-background rounded-lg md:p-6 mb-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-40 w-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-end px-6">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
