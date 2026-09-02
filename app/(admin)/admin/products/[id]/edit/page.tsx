import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Edit Product
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Update details for {product.name}.
      </p>

      <div className="mt-6 max-w-3xl">
        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          defaultValues={{
            name: product.name,
            description: product.description ?? "",
            price: product.price,
            unit: product.unit,
            stock: product.stock,
            imageUrl: product.imageUrl ?? "",
            categoryId: product.categoryId,
            isActive: product.isActive,
          }}
        />
      </div>
    </div>
  );
}
