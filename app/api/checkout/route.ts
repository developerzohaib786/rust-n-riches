import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { ApiError } from "@/lib/api-error";
import { calculateShipping } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Public endpoint (guest checkout). Deliberately NOT covered by the auth middleware.
export async function POST(request: Request) {
  if (!rateLimit(`checkout:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { message: "Too many orders from this connection. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 }
    );
  }

  const { customerName, phone, email, address, city, notes, items, website } = parsed.data;

  // Honeypot filled in: pretend it worked so bots do not learn anything.
  if (website) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  // Merge duplicate lines for the same product so stock is checked against the total.
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const dbProducts = await tx.product.findMany({
          where: { id: { in: Array.from(quantities.keys()) } },
        });
        const productsById = new Map(dbProducts.map((p) => [p.id, p]));

        for (const [productId, quantity] of Array.from(quantities.entries())) {
          const product = productsById.get(productId);
          if (!product || !product.isActive) {
            throw new ApiError(400, "One of the items in your cart is no longer available");
          }
          if (product.stock < quantity) {
            throw new ApiError(
              400,
              product.stock === 0
                ? `${product.name} is out of stock`
                : `Not enough stock for ${product.name} (only ${product.stock} ${product.unit} left)`
            );
          }
        }

        // The `stock >= qty` guard in the WHERE clause makes the decrement atomic, so two
        // concurrent checkouts can never oversell the last units.
        for (const [productId, quantity] of Array.from(quantities.entries())) {
          const result = await tx.product.updateMany({
            where: { id: productId, isActive: true, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });
          if (result.count !== 1) {
            const product = productsById.get(productId)!;
            throw new ApiError(400, `${product.name} just sold out. Please update your cart.`);
          }
        }

        const orderItems = Array.from(quantities.entries()).map(([productId, quantity]) => {
          const product = productsById.get(productId)!;
          return {
            productId,
            name: product.name,
            unit: product.unit,
            price: product.price,
            quantity,
            total: Math.round(product.price * quantity),
          };
        });

        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

        const settings = await tx.storeSettings.findUnique({ where: { id: "store" } });
        const shippingFee = Math.round(
          calculateShipping(
            subtotal,
            settings?.shippingFee ?? 0,
            settings?.freeShippingThreshold ?? null
          )
        );

        return tx.order.create({
          data: {
            customerName,
            phone,
            email: email || null,
            address,
            city,
            notes: notes || null,
            subtotal,
            shippingFee,
            total: subtotal + shippingFee,
            items: { create: orderItems },
          },
          select: { id: true, orderNumber: true },
        });
      },
      { timeout: 20000 }
    );

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("Checkout failed", err);
    return NextResponse.json(
      { message: "We could not place your order. Please try again." },
      { status: 500 }
    );
  }
}
