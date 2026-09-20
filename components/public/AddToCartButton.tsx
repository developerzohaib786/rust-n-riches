"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCart, type CartProductInput } from "@/lib/cart";

interface AddToCartButtonProps {
  product: CartProductInput;
  // "compact" is a single button for product cards; "full" adds a quantity selector.
  variant?: "compact" | "full";
}

export function AddToCartButton({ product, variant = "compact" }: AddToCartButtonProps) {
  const { addItem, lines } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const inCart = lines.find((line) => line.productId === product.productId)?.quantity ?? 0;
  const soldOut = product.stock <= 0;
  const maxQuantity = Math.max(1, product.stock - inCart);

  function handleAdd() {
    const { added, capped } = addItem(product, variant === "full" ? quantity : 1);

    if (added === 0) {
      toast({
        variant: "destructive",
        title: "Can't add more",
        description: `You already have all ${product.stock} ${product.unit} available in your cart.`,
      });
      return;
    }

    toast({
      title: "Added to cart",
      description: capped
        ? `${product.name}: only ${product.stock} ${product.unit} available, so your cart was capped.`
        : `${added} × ${product.name}`,
    });
    setQuantity(1);
  }

  if (soldOut) {
    return (
      <Button disabled className="w-full" variant="outline" size={variant === "full" ? "lg" : "sm"}>
        Out of Stock
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Button onClick={handleAdd} size="sm" className="w-full">
        <ShoppingCart />
        Add to Cart
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border border-border bg-surface">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
        >
          <Minus />
        </Button>
        <span className="min-w-10 text-center text-base font-medium" aria-live="polite">
          {Math.min(quantity, maxQuantity)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity}
        >
          <Plus />
        </Button>
      </div>
      <Button onClick={handleAdd} size="lg" className="flex-1">
        <ShoppingCart />
        Add to Cart
      </Button>
      {inCart > 0 && (
        <p className="w-full text-sm text-text-secondary">
          {inCart} {product.unit} already in your cart
        </p>
      )}
    </div>
  );
}
