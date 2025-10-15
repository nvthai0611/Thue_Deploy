import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarouselSpacingProps {
  className?: string;
  images?: string[]; // Array of image URLs
  showArrows?: boolean; // Optional prop to control arrow visibility
}

export function CarouselSpacing({
  className,
  images,
  showArrows,
}: CarouselSpacingProps) {
  // Use images if provided, otherwise fallback to demo items
  const items =
    images && images.length > 0 ? images : Array.from({ length: 5 });

  return (
    <Carousel className={`w-full max-w-full ${className ?? ""}`}>
      <CarouselContent className="-ml-1">
        {items.map((item, index) => (
          <CarouselItem
            key={index}
            className="pl-1 basis-2/3 sm:basis-1/2 md:basis-1/3"
          >
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-0 overflow-hidden">
                  {typeof item === "string" ? (
                    // Render image if images prop is provided
                    <img
                      src={item}
                      alt={`Image ${index + 1}`}
                      className="object-cover w-full h-full rounded"
                    />
                  ) : (
                    // Fallback demo content
                    <span className="text-2xl font-semibold">{index + 1}</span>
                  )}
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {showArrows && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
}
