import { prisma } from "@/lib/prisma";
import { CategoriesTable } from "@/components/admin/CategoriesTable";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Categories
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage the categories used to organize your product catalog.
      </p>

      <div className="mt-6">
        <CategoriesTable
          initialCategories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            productCount: category._count.products,
          }))}
        />
      </div>
    </div>
  );
}
