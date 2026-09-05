"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { transactionSchema, type TransactionInput } from "@/lib/validations";

export interface TransactionRecord {
  id: string;
  type: "CREDIT" | "PAYMENT";
  amount: number;
  note: string | null;
  items: string | null;
  createdAt: string;
}

export interface TransactionCustomerRecord {
  id: string;
  totalDue: number;
}

export interface TransactionProductOption {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
}

interface SelectedProduct {
  productId: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  quantity: number;
}

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "CREDIT" | "PAYMENT";
  customerId: string;
  currentDue: number;
  products: TransactionProductOption[];
  onSaved: (result: { transaction: TransactionRecord; customer: TransactionCustomerRecord }) => void;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  type,
  customerId,
  currentDue,
  products,
  onSaved,
}: TransactionFormDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      customerId,
      type,
      amount: 0,
      note: "",
      items: "",
      date: todayIsoDate(),
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      customerId,
      type,
      amount: 0,
      note: "",
      items: "",
      date: todayIsoDate(),
    });
    setSelectedProducts([]);
    setProductSearch("");
  }, [open, type, customerId, form]);

  const isCredit = type === "CREDIT";

  const productsTotal = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [selectedProducts]
  );

  useEffect(() => {
    if (selectedProducts.length > 0) {
      form.setValue("amount", productsTotal, { shouldValidate: true });
    }
  }, [productsTotal, selectedProducts.length, form]);

  const suggestions = useMemo(() => {
    if (!searchFocused) return [];
    const query = productSearch.trim().toLowerCase();
    const selectedIds = new Set(selectedProducts.map((p) => p.productId));
    const available = products.filter((p) => p.stock > 0 && !selectedIds.has(p.id));
    const filtered = query ? available.filter((p) => p.name.toLowerCase().includes(query)) : available;
    return filtered.slice(0, 8);
  }, [searchFocused, productSearch, products, selectedProducts]);

  function addProduct(product: TransactionProductOption) {
    setSelectedProducts((prev) => [
      ...prev,
      { productId: product.id, name: product.name, unit: product.unit, price: product.price, stock: product.stock, quantity: 1 },
    ]);
    setProductSearch("");
  }

  function updateQuantity(productId: string, quantity: number) {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, quantity: Math.max(1, Math.min(quantity, p.stock)) }
          : p
      )
    );
  }

  function removeProduct(productId: string) {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
  }

  async function onSubmit(values: TransactionInput) {
    if (!isCredit && values.amount > currentDue) {
      form.setError("amount", {
        type: "manual",
        message: `Payment cannot exceed the current due of ₹${currentDue.toFixed(2)}`,
      });
      return;
    }

    const productLines = selectedProducts.map((p) => `${p.name} x${p.quantity}`);
    const combinedItems = [values.items?.trim(), ...productLines].filter(Boolean).join(", ");

    const payload: TransactionInput = {
      ...values,
      items: combinedItems || undefined,
      productItems: isCredit && selectedProducts.length > 0
        ? selectedProducts.map((p) => ({
            productId: p.productId,
            name: p.name,
            quantity: p.quantity,
            price: p.price,
          }))
        : undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && !isCredit) {
          form.setError("amount", { type: "manual", message: data.message });
          return;
        }
        throw new Error(data.message ?? "Failed to record transaction");
      }

      toast({
        title: isCredit ? "Credit added" : "Payment recorded",
        description: `₹${values.amount.toFixed(2)}`,
      });
      onSaved(data);
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to record transaction",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCredit ? "Add Credit (Udhaar Diya)" : "Add Payment (Wasooli Aayi)"}
          </DialogTitle>
          <DialogDescription>
            {isCredit
              ? "Record items given to this customer on credit."
              : "Record a payment received from this customer."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  {isCredit && selectedProducts.length > 0 && (
                    <p className="text-xs text-text-secondary">
                      Auto-filled from selected products — edit if needed.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCredit && (
              <>
                <div>
                  <FormLabel>Add Products (optional)</FormLabel>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <Input
                      placeholder="Search products to add..."
                      className="pl-9"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-md">
                        {suggestions.map((product) => (
                          <button
                            type="button"
                            key={product.id}
                            onClick={() => addProduct(product)}
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

                  {selectedProducts.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {selectedProducts.map((p) => (
                        <div
                          key={p.productId}
                          className="flex items-center gap-2 rounded-lg border border-border p-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-primary">{p.name}</p>
                            <p className="text-xs text-text-secondary">
                              ₹{p.price.toFixed(2)} / {p.unit} · {p.stock} in stock
                            </p>
                          </div>
                          <Input
                            type="number"
                            min={1}
                            max={p.stock}
                            step={1}
                            className="w-16 shrink-0"
                            value={p.quantity}
                            onChange={(e) => updateQuantity(p.productId, Number(e.target.value))}
                          />
                          <span className="w-20 shrink-0 text-right text-sm font-medium text-text-primary">
                            ₹{(p.price * p.quantity).toFixed(2)}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 text-danger hover:bg-danger/10"
                            onClick={() => removeProduct(p.productId)}
                            aria-label={`Remove ${p.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-end text-sm font-semibold text-text-primary">
                        Products total: ₹{productsTotal.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Handwritten Items (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2kg rice, 1L oil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional note" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant={isCredit ? "accent" : "success"} disabled={submitting}>
                {submitting ? "Saving..." : isCredit ? "Add Credit" : "Add Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
