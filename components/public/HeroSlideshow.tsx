"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

// Photos by Unsplash contributors (unsplash.com/license), stored locally in public/hero.
const SLIDES = [
  { src: "/hero/1-produce-shelves.jpg", alt: "Supermarket shelves stocked with fresh vegetables" },
  { src: "/hero/2-bright-aisle.jpg", alt: "Brightly lit grocery store aisle" },
  { src: "/hero/3-fresh-market.jpg", alt: "Market stall full of fruits and vegetables" },
  { src: "/hero/4-fresh-vegetables.jpg", alt: "Fresh carrots, potatoes, peppers and radishes" },
  { src: "/hero/5-store-aisle.jpg", alt: "Grocery aisle with packaged goods on both sides" },
];

const INTERVAL_MS = 5000;

export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Respect users who have asked the OS to minimise motion: keep the first photo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {SLIDES.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          // Cross-fade between photos, with a slow zoom on the visible one.
          style={{ transition: "opacity 1.5s ease-in-out, transform 6s ease-out" }}
          className={cn(
            "object-cover",
            index === active ? "scale-105 opacity-100" : "scale-100 opacity-0",
          )}
        />
      ))}
      {/* Warm Bistre overlay keeps the headline readable on any photo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2f1b12]/75 via-[#2f1b12]/60 to-[#2f1b12]/80" />
    </div>
  );
}
