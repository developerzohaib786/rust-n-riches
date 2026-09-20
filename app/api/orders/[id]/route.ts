import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { orderUpdateSchema } from "@/lib/validations";
import { ApiError } from "@/lib/api-error";
import { ORDER_STATUS_LABELS, ORDER_TRANSITIONS, type OrderStatusValue } from "@/lib/utils";

// Admin only (covered by the auth middleware).
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid update" },
      { status: 400 }
    );
  }

  const { status, paymentStatus } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!order) throw new ApiError(404, "Order not found");

      const current = order.status as OrderStatusValue;
      const data: { status?: OrderStatusValue; paymentStatus?: "UNPAID" | "PAID" } = {};

      if (status && status !== current) {
        if (!ORDER_TRANSITIONS[current].includes(status)) {
          throw new ApiError(
            400,
            `An order that is ${ORDER_STATUS_LABELS[current].toLowerCase()} cannot be marked ${ORDER_STATUS_LABELS[status].toLowerCase()}`
          );
        }
        data.status = status;

        // Cancelling gives the reserved stock back.
        if (status === "CANCELLED") {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // Cash on delivery: the money is collected when the order is delivered.
        if (status === "DELIVERED" && paymentStatus === undefined) {
          data.paymentStatus = "PAID";
        }
      }

      if (paymentStatus && paymentStatus !== order.paymentStatus) {
        if (current === "CANCELLED" || data.status === "CANCELLED") {
          throw new ApiError(400, "Payment status cannot be changed on a cancelled order");
        }
        data.paymentStatus = paymentStatus;
      }

      if (Object.keys(data).length === 0) return order;

      return tx.order.update({
        where: { id: order.id },
        data,
        include: { items: true },
      });
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("Order update failed", err);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}
