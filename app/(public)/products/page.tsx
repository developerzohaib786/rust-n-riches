import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/public/ProductCard";
import { ProductsFilterBar } from "@/components/public/ProductsFilterBar";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

interface ProductsPageProps {
  searchParams: { q?: string; category?: string; page?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const query = searchParams.q?.trim();
  const categoryId = searchParams.category;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("category", categoryId);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Products
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {totalCount} product{totalCount === 1 ? "" : "s"} available.
      </p>

      <div className="mt-6">
        <ProductsFilterBar categories={categories} />
      </div>

      <div className="mt-6">
        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={query || categoryId ? "No products match your search" : "No products yet"}
            description={
              query || categoryId
                ? "Try a different search term or category."
                : "Check back soon, we're stocking the shelves."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={pageHref(page - 1)}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link
              href={pageHref(page + 1)}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
