import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/public/ProductGallery";
import { PurchaseOptions, type PurchaseOption } from "@/components/public/PurchaseOptions";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: { id: string };
  searchParams: { option?: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { id: params.id, isActive: true },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description ?? undefined };
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const product = await prisma.product.findFirst({
    where: { id: params.id, isActive: true },
    include: { category: true },
  });

  if (!product) notFound();

  // A single item links to its pack (packProductId); a pack is found by the reverse lookup.
  const [pack, single] = await Promise.all([
    product.packProductId
      ? prisma.product.findFirst({ where: { id: product.packProductId, isActive: true } })
      : null,
    prisma.product.findFirst({ where: { packProductId: product.id, isActive: true } }),
  ]);
  const toInput = (p: { id: string; name: string; price: number; unit: string; imageUrl: string | null; stock: number }) => ({
    productId: p.id,
    name: p.name,
    price: p.price,
    unit: p.unit,
    imageUrl: p.imageUrl,
    stock: p.stock,
  });
  const options: PurchaseOption[] = pack
    ? [
        { label: "Single", product: toInput(product) },
        { label: `Full set (${pack.unit})`, product: toInput(pack) },
      ]
    : single
      ? [
          { label: "Single", product: toInput(single) },
          { label: `Full set (${product.unit})`, product: toInput(product) },
        ]
      : [{ label: product.unit, product: toInput(product) }];
  // ?option=set keeps the "full set" choice selected when the customer switches colour.
    const initialIndex = single ? 1 : searchParams.option === "set" && pack ? 1 : 0;

  // Colours come from this product; a single and its pack fall back to each other's list.
  const colors = product.colors.length ? product.colors : (single?.colors ?? pack?.colors ?? []);

  const gallery = [product.imageUrl, ...(product.images ?? [])].filter((url): url is string => Boolean(url));

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
        {gallery.length > 0 ? (
          <ProductGallery images={gallery} name={product.name} />
        ) : (
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            <Package className="h-16 w-16 text-text-secondary" />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {product.category.name}
          </span>

          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-base text-text-secondary">{product.description}</p>
          )}

          <div className="mt-2">
            <PurchaseOptions key={`${product.id}-${initialIndex}`} options={options} initial={initialIndex} colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
}
