"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

// Photos by Unsplash contributors (unsplash.com/license), stored locally in public/hero.
const SLIDES = [
  { src: "/hero/1-gold-collection.jpg", alt: "Gold jewelry collection" },
  { src: "/hero/2-display-case.jpg", alt: "Jewelry display case" },
  { src: "/hero/3-necklace-earrings.jpg", alt: "Gold necklace and earrings" },
  { src: "/hero/4-gold-rings.jpg", alt: "Ornate gold rings" },
  { src: "/hero/5-gold-bracelets.jpg", alt: "Gold bracelets" },
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
      {/* Warm Aubergine overlay keeps the headline readable on any photo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a0f3d]/75 via-[#2a0f3d]/60 to-[#2a0f3d]/80" />
    </div>
  );
}
