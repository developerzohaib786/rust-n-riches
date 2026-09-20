import Link from "next/link";
import { ArrowRight, Banknote, Package, ShoppingBasket, Truck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/public/ProductCard";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      take: 4, // one row on desktop
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { products: { some: { isActive: true } } },
      orderBy: { name: "asc" },
      take: 8,
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
    prisma.storeSettings.findUnique({ where: { id: "store" } }),
  ]);

  const freeShippingThreshold = settings?.freeShippingThreshold ?? null;

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-20 text-center">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <ShoppingBasket className="h-4 w-4" />
            {settings?.name ?? "Rust N Riches"}
          </div>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Shop everyday essentials online, delivered to your door
          </h1>
          <p className="max-w-xl text-base text-text-secondary">
            Pick what you need, place your order in a minute, and pay in cash when it arrives.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/products">
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Banknote className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">Cash on Delivery</p>
              <p className="text-sm text-text-secondary">Pay when your order arrives</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">Home Delivery</p>
              <p className="text-sm text-text-secondary">
                {freeShippingThreshold != null
                  ? `Free delivery on orders over ${formatPrice(freeShippingThreshold)}`
                  : "Straight to your doorstep"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">Track Your Order</p>
              <p className="text-sm text-text-secondary">
                <Link href="/track-order" className="text-primary hover:underline">
                  Check your order status
                </Link>{" "}
                anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Shop by Category
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-base font-semibold text-text-primary">{category.name}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {category._count.products} item{category._count.products === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            New Arrivals
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
          // A single row: four across on desktop, swipeable sideways on smaller screens.
          <div className="-mx-6 mt-6 flex snap-x gap-6 overflow-x-auto px-6 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
            {featuredProducts.map((product) => (
              <div key={product.id} className="w-64 shrink-0 snap-start lg:w-auto">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
