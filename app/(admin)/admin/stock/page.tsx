import { prisma } from "@/lib/prisma";
import { StockManager } from "@/components/admin/StockManager";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminStockPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Stock
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Update stock levels for each product in your catalog.
      </p>

      <div className="mt-6">
        <StockManager
          initialProducts={products.map((product) => ({
            id: product.id,
            name: product.name,
            unit: product.unit,
            stock: product.stock,
            imageUrl: product.imageUrl,
            category: { id: product.category.id, name: product.category.name },
          }))}
          categories={categories}
          lowStockThreshold={LOW_STOCK_THRESHOLD}
        />
      </div>
    </div>
  );
}
