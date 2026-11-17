"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { useDesign } from "@/components/public/DesignContext";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const { design, setDesign } = useDesign();
  const mainImage = design?.imageUrl || images[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mainImage} alt={design ? `${name} - ${design.text}` : name} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => {
                setActive(index);
                setDesign(null);
              }}
              aria-label={`Show photo ${index + 1}`}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border bg-muted",
                !design && index === active ? "border-primary ring-1 ring-primary" : "border-border",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
