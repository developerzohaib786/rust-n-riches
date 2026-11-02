"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface NewArrival {
  id: string;
  name: string;
  imageUrl: string | null;
  price: string;
}

const STORAGE_KEY = "aqs-new-arrivals-seen";
const SWIPE_THRESHOLD = 90; // px dragged before a card is swiped away
const TAP_TOLERANCE = 6; // px of movement still counted as a click
const VISIBLE_CARDS = 5;

export function NewArrivalsPopup({ products }: { products: NewArrival[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0); // index of the card currently on top
  const [dx, setDx] = useState(0); // live drag offset of the top card
  const [flying, setFlying] = useState<number | null>(null); // direction of a card flying off
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (products.length === 0) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // storage unavailable: just show it
    }
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setOpen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [products.length]);

  if (products.length === 0) return null;

  const count = products.length;

  function swipeAway(direction: number) {
    setFlying(direction);
    setTimeout(() => {
      setTop((t) => (t + 1) % count);
      setFlying(null);
      setDx(0);
    }, 220);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (flying !== null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const delta = e.clientX - drag.current.x;
    if (Math.abs(delta) > TAP_TOLERANCE) drag.current.moved = true;
    setDx(delta);
  }

  function onPointerUp(productId: string) {
    const state = drag.current;
    drag.current = null;
    if (!state) return;

    if (!state.moved) {
      // A tap/click opens the product.
      setDx(0);
      setOpen(false);
      router.push(`/products/${productId}`);
      return;
    }
    if (Math.abs(dx) > SWIPE_THRESHOLD && count > 1) {
      swipeAway(dx > 0 ? 1 : -1);
    } else {
      setDx(0);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-serif font-normal">New Arrivals</DialogTitle>
          <DialogDescription>
            {count > 1 ? "Swipe through, tap a card to view it." : "Tap the card to view it."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2 h-[21rem] w-full select-none">
          {Array.from({ length: Math.min(VISIBLE_CARDS, count) })
            .map((_, depth) => depth)
            .reverse() // paint the back cards first so the top card sits above
            .map((depth) => {
              const product = products[(top + depth) % count];
              const isTop = depth === 0;

              // Fan the deck out to the right, each card tilted a little more.
              let transform = `translateX(${depth * 12}px) rotate(${depth * 3}deg)`;
              let transition = "transform 250ms ease, opacity 250ms ease";
              let opacity = 1;

              if (isTop) {
                if (flying !== null) {
                  transform = `translateX(${flying * 340}px) rotate(${flying * 18}deg)`;
                  opacity = 0;
                } else {
                  transform = `translateX(${dx}px) rotate(${dx / 14}deg)`;
                  if (drag.current) transition = "none";
                }
              }

              return (
                <div
                  key={product.id}
                  onPointerDown={isTop ? onPointerDown : undefined}
                  onPointerMove={isTop ? onPointerMove : undefined}
                  onPointerUp={isTop ? () => onPointerUp(product.id) : undefined}
                  onPointerCancel={
                    isTop
                      ? () => {
                          drag.current = null;
                          setDx(0);
                        }
                      : undefined
                  }
                  // A card peeking out from behind comes to the front when tapped.
                  onClick={!isTop ? () => setTop((t) => (t + depth) % count) : undefined}
                  style={{
                    transform,
                    transformOrigin: "bottom left",
                    transition,
                    opacity,
                    zIndex: VISIBLE_CARDS - depth,
                    touchAction: "pan-y",
                  }}
                  className={`absolute bottom-0 left-0 h-[19rem] w-48 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg ${
                    isTop ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                  }`}
                >
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                      <Package className="h-12 w-12 text-text-secondary" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-12">
                    <p className="truncate text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-white/80">{product.price}</p>
                    <span className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-[#4b1d6e] via-[#8a5cb0] to-[#b8860b] px-3 py-1.5 text-xs font-semibold text-white">
                      View Product
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        {count > 1 && (
          <p className="text-center text-xs text-text-secondary">
            {top + 1} / {count}
          </p>
        )}

        <Button asChild variant="gold" onClick={() => setOpen(false)}>
          <Link href="/products">Shop All New Arrivals</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
