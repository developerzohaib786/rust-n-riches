import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid product" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: parsed.data,
    include: { category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
