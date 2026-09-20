import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const DEFAULT_STORE_NAME = "Rust N Riches";

// Store profile with safe defaults, for pages that only read settings (info/policy pages).
export async function getStoreInfo() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "store" } });

  return {
    name: settings?.name ?? DEFAULT_STORE_NAME,
    address: settings?.address ?? null,
    phone: settings?.phone ?? null,
    email: settings?.email ?? null,
    whatsapp: settings?.whatsapp ?? null,
    shippingFee: settings?.shippingFee ?? 0,
    freeShippingThreshold: settings?.freeShippingThreshold ?? null,
  };
}

export type StoreInfo = Awaited<ReturnType<typeof getStoreInfo>>;

// e.g. "Delivery costs Rs 150, and is free on orders over Rs 3,000."
export function describeDelivery(store: Pick<StoreInfo, "shippingFee" | "freeShippingThreshold">) {
  const { shippingFee, freeShippingThreshold } = store;

  if (shippingFee === 0) return "Delivery is free on all orders.";
  if (freeShippingThreshold != null) {
    return `Delivery costs ${formatPrice(shippingFee)}, and is free on orders of ${formatPrice(freeShippingThreshold)} or more.`;
  }
  return `Delivery costs ${formatPrice(shippingFee)} per order.`;
}
