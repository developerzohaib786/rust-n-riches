"use client";

import * as React from "react";

import { CHECKOUT_MAX_LINES, CHECKOUT_MAX_QUANTITY } from "@/lib/validations";

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  unit: string;
  imageUrl: string | null;
  stock: number;
  quantity: number;
  // Set by refresh() when the product was deactivated or deleted since it was added.
  unavailable?: boolean;
}

export type CartProductInput = Omit<CartLine, "quantity" | "unavailable">;

export interface ShippingRules {
  shippingFee: number;
  freeShippingThreshold: number | null;
}

interface CartContextValue {
  lines: CartLine[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProductInput, quantity?: number) => { added: number; capped: boolean };
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  refresh: () => Promise<ShippingRules | null>;
}

const STORAGE_KEY = "rust-n-riches-cart-v1";

const CartContext = React.createContext<CartContextValue | null>(null);

function maxFor(stock: number) {
  return Math.max(0, Math.min(stock, CHECKOUT_MAX_QUANTITY));
}

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        line &&
        typeof line.productId === "string" &&
        typeof line.name === "string" &&
        typeof line.price === "number" &&
        typeof line.quantity === "number" &&
        line.quantity > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const linesRef = React.useRef(lines);
  linesRef.current = lines;

  React.useEffect(() => {
    setLines(readStorage());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage may be unavailable (private mode); the cart just won't persist.
    }
  }, [lines, hydrated]);

  // Keep several open tabs in sync.
  React.useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setLines(readStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = React.useCallback<CartContextValue["addItem"]>((product, quantity = 1) => {
    const current = linesRef.current;
    const existing = current.find((line) => line.productId === product.productId);
    const limit = maxFor(product.stock);
    const desired = (existing?.quantity ?? 0) + quantity;
    const next = Math.min(desired, limit);
    const added = Math.max(0, next - (existing?.quantity ?? 0));

    if (!existing && current.length >= CHECKOUT_MAX_LINES) {
      return { added: 0, capped: true };
    }
    if (next <= 0) return { added: 0, capped: true };

    setLines((prev) => {
      const found = prev.find((line) => line.productId === product.productId);
      if (found) {
        return prev.map((line) =>
          line.productId === product.productId
            ? { ...line, ...product, quantity: next, unavailable: false }
            : line
        );
      }
      return [...prev, { ...product, quantity: next }];
    });

    return { added, capped: desired > limit };
  }, []);

  const setQuantity = React.useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      prev.flatMap((line) => {
        if (line.productId !== productId) return [line];
        if (quantity <= 0) return [];
        return [{ ...line, quantity: Math.min(quantity, Math.max(1, maxFor(line.stock))) }];
      })
    );
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clear = React.useCallback(() => setLines([]), []);

  // Re-sync price, stock and availability with the database.
  const refresh = React.useCallback(async (): Promise<ShippingRules | null> => {
    const productIds = linesRef.current.map((line) => line.productId);

    try {
      const res = await fetch("/api/cart/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // An empty cart has nothing to sync, but shipping rules are still useful.
        body: JSON.stringify({ productIds: productIds.length ? productIds : ["_"] }),
      });
      if (!res.ok) return null;

      const data: {
        products: Array<CartProductInput & { id: string; isActive: boolean }>;
        shippingFee: number;
        freeShippingThreshold: number | null;
      } = await res.json();
      const byId = new Map(data.products.map((p) => [p.id, p]));

      setLines((prev) =>
        prev.map((line) => {
          const fresh = byId.get(line.productId);
          if (!fresh || !fresh.isActive || fresh.stock <= 0) {
            return { ...line, unavailable: true, stock: fresh?.stock ?? 0 };
          }
          return {
            ...line,
            name: fresh.name,
            price: fresh.price,
            unit: fresh.unit,
            imageUrl: fresh.imageUrl,
            stock: fresh.stock,
            quantity: Math.min(line.quantity, maxFor(fresh.stock)),
            unavailable: false,
          };
        })
      );

      return {
        shippingFee: data.shippingFee,
        freeShippingThreshold: data.freeShippingThreshold,
      };
    } catch {
      return null;
    }
  }, []);

  const value = React.useMemo<CartContextValue>(() => {
    const available = lines.filter((line) => !line.unavailable);
    return {
      lines,
      hydrated,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: available.reduce((sum, line) => sum + line.price * line.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
      refresh,
    };
  }, [lines, hydrated, addItem, setQuantity, removeItem, clear, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
