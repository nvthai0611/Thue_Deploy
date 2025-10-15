"use client";

import { useEffect, useState } from "react";
import chat1 from "@/assets/chat1.jpg";
import chat2 from "@/assets/chat2.jpg";

const images = [chat1, chat2];

export default function SimpleCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full max-w-xl mx-auto overflow-hidden">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={`slide-${i}`}
          className={`absolute my-auto h-1/2 inset-0 w-full object-cover object-center transition-opacity duration-700 ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />
      ))}
    </div>
  );
}
