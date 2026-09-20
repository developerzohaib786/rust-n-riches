import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Products
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage the products in your online store.
      </p>

      <div className="mt-6">
        <ProductsTable
          initialProducts={products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            stock: product.stock,
            imageUrl: product.imageUrl,
            isActive: product.isActive,
            category: { id: product.category.id, name: product.category.name },
          }))}
          categories={categories}
        />
      </div>
    </div>
  );
}
