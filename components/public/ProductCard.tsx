import Link from "next/link";
import { Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string | null;
  stock: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card>
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-xl bg-muted">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-10 w-10 text-text-secondary" />
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold tracking-tight text-text-primary">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              ₹{product.price.toFixed(2)} / {product.unit}
            </p>
            {product.stock > 0 ? (
              <Badge variant="success">In Stock</Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
