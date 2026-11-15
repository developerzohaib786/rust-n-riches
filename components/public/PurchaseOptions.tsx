"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/public/AddToCartButton";
import { formatPrice } from "@/lib/utils";
import type { CartProductInput } from "@/lib/cart";

export interface PurchaseOption {
  label: string; // e.g. "Single" or "Full set (pack of 4)"
  product: CartProductInput;
}

// Lets the customer pick an optional colour and choose between one item or the full pack/stack.
export function PurchaseOptions({
  options,
  initial = 0,
  colors = [],
}: {
  options: PurchaseOption[];
  initial?: number;
  colors?: string[];
}) {
  const [selected, setSelected] = useState(initial);
  // Optional: no colour selected means the default.
  const [color, setColor] = useState<string | null>(null);
  const { product } = options[selected];

  return (
    <div className="flex flex-col gap-4">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-text-secondary">
            Color{color ? `: ${color}` : " (optional)"}
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
            {colors.map((name) => {
              const active = color === name;
              return (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  // Clicking the chosen colour again clears it (back to default).
                  onClick={() => setColor(active ? null : name)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-text-primary hover:border-primary"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {options.length > 1 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Buying option">
          {options.map((option, i) => (
            <button
              key={option.product.productId}
              type="button"
              role="radio"
              aria-checked={i === selected}
              onClick={() => setSelected(i)}
              className={`rounded-xl border p-3 text-left transition ${
                i === selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-surface"
              }`}
            >
              <span className="block text-sm font-medium text-text-primary">{option.label}</span>
              <span className="block text-base font-semibold text-text-primary">
                {formatPrice(option.product.price)}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-2xl font-semibold text-text-primary">
          {formatPrice(product.price)}
          <span className="ml-1 text-base font-normal text-text-secondary">/ {product.unit}</span>
        </p>
        {product.stock >= (product.packSize ?? 1) ? (
          <Badge variant="success">In Stock</Badge>
        ) : (
          <Badge variant="danger">Out of Stock</Badge>
        )}
      </div>

      <AddToCartButton
        key={`${product.productId}-${color ?? ""}`}
        variant="full"
        product={{ ...product, color }}
      />
    </div>
  );
}
