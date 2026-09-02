import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

export function LowStockWidget({ products }: { products: LowStockProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {products.length === 0 ? (
          <p className="text-sm text-text-secondary">All products are well stocked.</p>
        ) : (
          products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="-mx-2 flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted"
            >
              <p className="text-sm font-medium text-text-primary">{product.name}</p>
              <Badge variant={product.stock === 0 ? "danger" : "warning"}>
                {product.stock} {product.unit} left
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
