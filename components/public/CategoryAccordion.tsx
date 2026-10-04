"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccordionCategory {
  id: string;
  name: string;
  count: number;
  imageUrl: string | null;
}

export function CategoryAccordion({ categories }: { categories: AccordionCategory[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex h-[34rem] flex-col gap-1 md:h-[28rem] md:flex-row">
      {categories.map((category, index) => {
        const isActive = index === active;
        return (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            // On touch screens the first tap opens the panel, the second tap follows the link.
            onClick={(event) => {
              if (!isActive) {
                event.preventDefault();
                setActive(index);
              }
            }}
            aria-label={`${category.name}, ${category.count} items`}
            className={cn(
              "group relative isolate min-h-0 min-w-0 overflow-hidden bg-[#2a0f3d] transition-[flex-grow] duration-500 ease-in-out",
              isActive ? "grow-[6]" : "grow-[1]",
              "basis-0",
            )}
          >
            {category.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.imageUrl}
                alt=""
                className={cn(
                  "absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-500",
                  isActive ? "opacity-100" : "opacity-30",
                )}
              />
            )}
            <div
              className={cn(
                "absolute inset-0 -z-10 transition-colors duration-500",
                isActive
                  ? "bg-gradient-to-t from-[#2a0f3d]/90 via-[#4b1d6e]/40 to-[#4b1d6e]/20"
                  : "bg-[#2a0f3d]/70",
              )}
            />

            <span className="absolute right-3 top-3 text-[11px] font-medium text-[#f5d77a]">
              {category.count} {category.count === 1 ? "piece" : "pieces"}
            </span>

            {/* Collapsed label: sideways on desktop, plain on mobile. */}
            <span
              className={cn(
                "absolute font-serif text-lg uppercase tracking-[0.15em] text-white transition-opacity duration-300",
                "left-4 top-1/2 -translate-y-1/2 md:bottom-6 md:left-1/2 md:top-auto md:-translate-x-1/2 md:translate-y-0",
                "md:[writing-mode:vertical-rl] md:rotate-180",
                isActive ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            >
              {category.name}
            </span>

            {/* Expanded label */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-8 text-center transition-all duration-500",
                isActive ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <h3 className="font-serif text-3xl uppercase tracking-[0.2em] text-white">
                {category.name}
              </h3>
              <span className="mt-3 h-px w-24 bg-[#f5d77a]" />
              <p className="mt-3 text-sm text-white/85">
                Browse {category.count} {category.count === 1 ? "piece" : "pieces"} from this collection.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#f5d77a]">
                Shop now
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
