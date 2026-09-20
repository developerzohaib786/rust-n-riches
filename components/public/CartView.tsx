"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CartSummary } from "@/components/public/CartSummary";
import { useCart, type ShippingRules } from "@/lib/cart";
import { calculateShipping, formatPrice } from "@/lib/utils";

export function CartView() {
  const { lines, hydrated, subtotal, setQuantity, removeItem, refresh } = useCart();
  const [rules, setRules] = useState<ShippingRules | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    // Re-sync live prices and stock once per visit, after the stored cart has loaded.
    refresh().then(setRules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Your Cart</h1>
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our products and add something you like."
          className="mt-6"
        />
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasUnavailable = lines.some((line) => line.unavailable);
  const shipping = rules
    ? calculateShipping(subtotal, rules.shippingFee, rules.freeShippingThreshold)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Your Cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {lines.map((line) => (
            <Card key={line.productId} className="flex gap-4 p-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {line.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-8 w-8 text-text-secondary" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${line.productId}`}
                      className="block truncate text-base font-semibold text-text-primary hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="text-sm text-text-secondary">
                      {formatPrice(line.price)} / {line.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="shrink-0 text-text-secondary hover:text-danger"
                    aria-label={`Remove ${line.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {line.unavailable ? (
                  <Badge variant="danger" className="w-fit">
                    No longer available
                  </Badge>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      >
                        <Minus />
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        aria-label="Increase quantity"
                        disabled={line.quantity >= line.stock}
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                    <span className="text-base font-semibold text-text-primary">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </div>
                )}
                {!line.unavailable && line.quantity >= line.stock && (
                  <p className="text-xs text-text-secondary">
                    Only {line.stock} {line.unit} in stock
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div>
          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            freeShippingThreshold={rules?.freeShippingThreshold}
          >
            {hasUnavailable && (
              <p className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Remove the unavailable items to continue.
              </p>
            )}
            {hasUnavailable ? (
              <Button size="lg" className="mt-2 w-full" disabled>
                Proceed to Checkout
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-2 w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </CartSummary>
        </div>
      </div>
    </div>
  );
}
