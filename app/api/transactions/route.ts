import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  const transactions = await prisma.transaction.findMany({
    where: customerId ? { customerId } : undefined,
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = transactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid transaction" },
      { status: 400 }
    );
  }

  const { customerId, type, amount, note, items, date, productItems } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new ApiError(404, "Customer not found");
      }

      if (type === "PAYMENT" && amount > customer.totalDue) {
        throw new ApiError(
          400,
          `Payment cannot exceed the current due amount of ₹${customer.totalDue.toFixed(2)}`
        );
      }

      if (type === "CREDIT" && productItems && productItems.length > 0) {
        const dbProducts = await tx.product.findMany({
          where: { id: { in: productItems.map((item) => item.productId) } },
        });
        const productsById = new Map(dbProducts.map((p) => [p.id, p]));

        for (const item of productItems) {
          const product = productsById.get(item.productId);
          if (!product) {
            throw new ApiError(400, `Product not found: ${item.name}`);
          }
          if (product.stock < item.quantity) {
            throw new ApiError(
              400,
              `Not enough stock for ${product.name} (only ${product.stock} ${product.unit} left)`
            );
          }
        }

        for (const item of productItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const transaction = await tx.transaction.create({
        data: {
          customerId,
          type,
          amount,
          note: note || null,
          items: items || null,
          createdAt: date ? new Date(date) : undefined,
        },
      });

      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          totalDue:
            type === "CREDIT" ? { increment: amount } : { decrement: amount },
        },
      });

      return { transaction, customer: updatedCustomer };
    }, { timeout: 20000 });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to record transaction" }, { status: 500 });
  }
}

export type TransactionWithCustomer = Prisma.TransactionGetPayload<{
  include: { customer: { select: { id: true; name: true } } };
}>;
