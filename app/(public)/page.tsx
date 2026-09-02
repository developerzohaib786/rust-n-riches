import Link from "next/link";
import { ArrowRight, Package, Store } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/public/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-20 text-center">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Store className="h-4 w-4" />
            Zain Super Store
          </div>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Everyday groceries from your trusted neighborhood store
          </h1>
          <p className="max-w-xl text-base text-text-secondary">
            Fresh essentials, fair prices, and the same kiryana store you&apos;ve always
            counted on, now browsable online.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/products">
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Check back soon, we're stocking the shelves."
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
