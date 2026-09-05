import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { productSchema, stockUpdateSchema } from "@/lib/validations";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid product" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = stockUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid stock value" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { stock: parsed.data.stock },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
}
