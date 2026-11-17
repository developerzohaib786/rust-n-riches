import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/public/ProductGallery";
import { DesignProvider, type ProductDesign } from "@/components/public/DesignContext";
import { PurchaseOptions, type PurchaseOption } from "@/components/public/PurchaseOptions";

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

  const toInput = (pack: boolean) => ({
    productId: product.id,
    name: product.name,
    price: pack ? product.packPrice! : product.price,
    unit: pack ? `pack of ${product.packSize}` : product.unit,
    imageUrl: product.imageUrl,
    stock: product.stock,
    packSize: pack ? product.packSize : null,
  });
  const hasPack = Boolean(product.packSize && product.packPrice);
  const options: PurchaseOption[] = hasPack
    ? [
        { label: "Single", product: toInput(false) },
        { label: `Pack of ${product.packSize}`, product: toInput(true) },
      ]
    : [{ label: product.unit, product: toInput(false) }];

  const designs = ((product.designs as unknown as ProductDesign[] | null) ?? []).filter((d) => d?.text && d?.imageUrl);
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

      <DesignProvider>
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
            <PurchaseOptions options={options} colors={product.colors} designs={designs} />
          </div>
        </div>
      </div>
      </DesignProvider>
    </div>
  );
}
