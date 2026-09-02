import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Add Product
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Create a new product for your catalog.
      </p>

      <div className="mt-6 max-w-3xl">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
