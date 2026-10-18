"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
}

const INTERVAL_MS = 5000;

// Full-bleed banner photos that cross-fade in turn.
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
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, index) => (
        // Cross-fade between photos.
        <div
          key={slide.src}
          style={{ transition: "opacity 1.5s ease-in-out" }}
          className={cn("absolute inset-0", index === active ? "opacity-100" : "opacity-0")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.src}
            alt={slide.alt}
            loading={index === 0 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ))}
      {/* Light cream wash keeps the dark headline readable on every photo. */}
      <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-[#f6efe6]/70 to-transparent" />
      <div className="absolute left-[6.25%] top-[28%] max-w-[50%]">
        <h1 className="font-serif text-[clamp(2.25rem,6.2vw,5.5rem)] font-medium leading-none tracking-tight text-[#14110f]">
          Wear Your Aura
        </h1>
        <div className="my-[1.6vw] h-px w-[6.5vw] bg-[#c3a574]" />
        <p className="text-[clamp(0.75rem,1.25vw,1.15rem)] leading-relaxed text-[#4a443d]">
          Minimal, anti-tarnish and long-lasting
          <br />
          jewellery made to be lived in
        </p>
      </div>
    </div>
  );
}
