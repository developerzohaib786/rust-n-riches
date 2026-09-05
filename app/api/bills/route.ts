import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { billSchema } from "@/lib/validations";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function GET() {
  const bills = await prisma.bill.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(bills);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = billSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid bill" },
      { status: 400 }
    );
  }

  const { customerName, items } = parsed.data;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const dbProducts = await tx.product.findMany({
          where: { id: { in: items.map((item) => item.productId) } },
        });
        const productsById = new Map(dbProducts.map((p) => [p.id, p]));

        for (const item of items) {
          const product = productsById.get(item.productId);
          if (!product) {
            throw new ApiError(400, "One of the selected products no longer exists");
          }
          if (product.stock < item.quantity) {
            throw new ApiError(
              400,
              `Not enough stock for ${product.name} (only ${product.stock} ${product.unit} left)`
            );
          }
        }

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const billItems = items.map((item) => {
          const product = productsById.get(item.productId)!;
          return {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            price: product.price,
            quantity: item.quantity,
            total: product.price * item.quantity,
          };
        });
        const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0);

        const bill = await tx.bill.create({
          data: {
            customerName: customerName || null,
            totalAmount,
            items: { create: billItems },
          },
          include: { items: true },
        });

        return bill;
      },
      { timeout: 20000 }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to create bill" }, { status: 500 });
  }
}
