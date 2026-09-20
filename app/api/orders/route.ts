import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, type OrderStatusValue } from "@/lib/utils";

// Admin only (covered by the auth middleware).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: ORDER_STATUSES.includes(status as OrderStatusValue)
      ? { status: status as OrderStatusValue }
      : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(orders);
}
