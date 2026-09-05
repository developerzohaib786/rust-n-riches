"use client";

import { useMemo, useState } from "react";
import { Package, Plus, Printer, Receipt, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "@/components/ui/empty-state";

export interface BillingProductOption {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
}

interface SelectedItem {
  productId: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  quantity: number;
}

interface CompletedBill {
  id: string;
  billNumber: number;
  customerName: string | null;
  totalAmount: number;
  createdAt: string;
  items: { name: string; unit: string; price: number; quantity: number; total: number }[];
}

export function InstantBilling({ initialProducts }: { initialProducts: BillingProductOption[] }) {
  const { toast } = useToast();

  const [products, setProducts] = useState(initialProducts);
  const [customerName, setCustomerName] = useState("");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [completedBill, setCompletedBill] = useState<CompletedBill | null>(null);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const suggestions = useMemo(() => {
    if (!searchFocused) return [];
    const query = search.trim().toLowerCase();
    const selectedIds = new Set(items.map((item) => item.productId));
    const available = products.filter((p) => p.stock > 0 && !selectedIds.has(p.id));
    const filtered = query ? available.filter((p) => p.name.toLowerCase().includes(query)) : available;
    return filtered.slice(0, 8);
  }, [searchFocused, search, products, items]);

  function addItem(product: BillingProductOption) {
    setItems((prev) => [
      ...prev,
      { productId: product.id, name: product.name, unit: product.unit, price: product.price, stock: product.stock, quantity: 1 },
    ]);
    setSearch("");
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function startNewBill() {
    setCompletedBill(null);
    setItems([]);
    setCustomerName("");
    setSearch("");
  }

  async function handleCompleteBill() {
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || undefined,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create bill");

      setProducts((prev) =>
        prev.map((p) => {
          const sold = items.find((item) => item.productId === p.id);
          return sold ? { ...p, stock: p.stock - sold.quantity } : p;
        })
      );
      setCompletedBill(data);
      setItems([]);
      setCustomerName("");
      toast({ title: `Bill #${data.billNumber} created`, description: `₹${data.totalAmount.toFixed(2)}` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create bill",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (completedBill) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="items-center text-center">
          <Receipt className="h-8 w-8 text-success" />
          <CardTitle>Bill #{completedBill.billNumber}</CardTitle>
          <CardDescription>
            {new Date(completedBill.createdAt).toLocaleString()}
            {completedBill.customerName ? ` · ${completedBill.customerName}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {completedBill.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2 text-sm">
                <div>
                  <p className="font-medium text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-secondary">
                    {item.quantity} {item.unit} × ₹{item.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-medium text-text-primary">₹{item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-lg font-semibold text-text-primary">
            <span>Total</span>
            <span>₹{completedBill.totalAmount.toFixed(2)}</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button className="flex-1" onClick={startNewBill}>
              <Plus className="h-4 w-4" />
              New Bill
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <Input
          placeholder="Customer name (optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search products to add..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-md">
              {suggestions.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => addItem(product)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="font-medium text-text-primary">{product.name}</span>
                  <span className="text-xs text-text-secondary">
                    ₹{product.price.toFixed(2)} / {product.unit} · {product.stock} left
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No items added yet"
            description="Search and add products above to start a bill."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-secondary">
                    ₹{item.price.toFixed(2)} / {item.unit} · {item.stock} in stock
                  </p>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={item.stock}
                  step={1}
                  className="w-16 shrink-0"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                />
                <span className="w-20 shrink-0 text-right text-sm font-medium text-text-primary">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-danger hover:bg-danger/10"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4 text-lg font-semibold text-text-primary">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        <Button size="lg" disabled={items.length === 0 || submitting} onClick={handleCompleteBill}>
          {submitting ? "Creating Bill..." : "Complete Bill"}
        </Button>
      </CardContent>
    </Card>
  );
}
