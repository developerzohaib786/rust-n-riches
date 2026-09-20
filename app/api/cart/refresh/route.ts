import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cartRefreshSchema } from "@/lib/validations";

// Public endpoint: lets the cart re-sync live prices and stock. Deliberately NOT covered
// by the auth middleware (unlike /api/products).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = cartRefreshSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,
      stock: true,
      imageUrl: true,
      isActive: true,
    },
  });

  const settings = await prisma.storeSettings.findUnique({ where: { id: "store" } });

  return NextResponse.json({
    products,
    shippingFee: settings?.shippingFee ?? 0,
    freeShippingThreshold: settings?.freeShippingThreshold ?? null,
  });
}
