import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/public/AddToCartButton";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { id: params.id, isActive: true },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description ?? undefined };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await prisma.product.findFirst({
    where: { id: params.id, isActive: true },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-16 w-16 text-text-secondary" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {product.category.name}
          </span>

          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold text-text-primary">
              {formatPrice(product.price)}
              <span className="ml-1 text-base font-normal text-text-secondary">
                / {product.unit}
              </span>
            </p>
            {product.stock > 0 ? (
              <Badge variant="success">In Stock</Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>

          {product.description && (
            <p className="text-base text-text-secondary">{product.description}</p>
          )}

          <div className="mt-2">
            <AddToCartButton
              variant="full"
              product={{
                productId: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                imageUrl: product.imageUrl,
                stock: product.stock,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
