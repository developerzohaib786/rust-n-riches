"use client";

import { useMemo, useState } from "react";
import { Check, Package, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "@/components/ui/empty-state";

export interface StockProductRow {
  id: string;
  name: string;
  unit: string;
  stock: number;
  imageUrl: string | null;
  category: { id: string; name: string };
}

interface CategoryOption {
  id: string;
  name: string;
}

interface StockManagerProps {
  initialProducts: StockProductRow[];
  categories: CategoryOption[];
  lowStockThreshold: number;
}

export function StockManager({ initialProducts, categories, lowStockThreshold }: StockManagerProps) {
  const { toast } = useToast();

  const [products, setProducts] = useState(initialProducts);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category.id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function getValue(product: StockProductRow) {
    return drafts[product.id] ?? String(product.stock);
  }

  function isDirty(product: StockProductRow) {
    const draft = drafts[product.id];
    return draft !== undefined && draft !== String(product.stock);
  }

  async function handleSave(product: StockProductRow) {
    const draft = drafts[product.id];
    if (draft === undefined) return;

    const nextStock = Number(draft);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Enter a valid, non-negative whole number for stock.",
      });
      return;
    }

    setSavingId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextStock }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update stock");

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: nextStock } : p))
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      toast({ title: "Stock updated", description: `${product.name}: ${nextStock} ${product.unit}` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update stock",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={Package}
                    title="No products found"
                    description={
                      products.length === 0
                        ? "Add products to your catalog to manage their stock here."
                        : "Try adjusting your search or category filter."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const dirty = isDirty(product);
                const lowStock = product.stock < lowStockThreshold;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-text-secondary" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.name}
                        {lowStock && !dirty && <Badge variant={product.stock === 0 ? "danger" : "warning"}>Low</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{product.category.name}</TableCell>
                    <TableCell className="text-text-secondary">{product.unit}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        className="w-24"
                        value={getValue(product)}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [product.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleSave(product)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={dirty ? "default" : "outline"}
                        size="sm"
                        disabled={!dirty || savingId === product.id}
                        onClick={() => handleSave(product)}
                      >
                        <Check className="h-4 w-4" />
                        {savingId === product.id ? "Saving..." : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
