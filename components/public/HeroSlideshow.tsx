"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
}

const INTERVAL_MS = 5000;

// Slides are the category cover photos, so the hero always shows our own products.
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    // Respect users who have asked the OS to minimise motion: keep the first photo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {slides.map((slide, index) => (
        // Cross-fade between photos.
        <div
          key={slide.src}
          style={{ transition: "opacity 1.5s ease-in-out" }}
          className={cn("absolute inset-0", index === active ? "opacity-100" : "opacity-0")}
        >
          {/* Blurred copy fills the frame so the photo itself can be shown whole, uncropped. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.src}
            alt=""
            loading={index === 0 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.src}
            alt={slide.alt}
            loading={index === 0 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-contain md:object-right"
          />
        </div>
      ))}
      {/* Warm Aubergine overlay keeps the headline readable on any photo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a0f3d]/75 via-[#2a0f3d]/60 to-[#2a0f3d]/80" />
    </div>
  );
}
