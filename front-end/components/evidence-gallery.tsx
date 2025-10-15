"use client";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function EvidenceGallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-3">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-zinc-700 cursor-pointer hover:opacity-75"
            alt={`Evidence ${i + 1}`}
          />
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((src) => ({ src }))}
      />
    </>
  );
}
