import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { ApiError } from "@/lib/api-error";
import {
  calculateShipping,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
} from "@/lib/utils";
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

  // One order line per product + colour + buying mode (single or pack); a missing colour
  // means the default. Duplicate lines are merged so stock is checked against the total.
  const lineQuantities = new Map<
    string,
    { productId: string; color: string | null; pack: boolean; quantity: number }
  >();
  for (const item of items) {
    const color = item.color?.trim() || null;
    const pack = item.pack === true;
    const key = `${item.productId}::${color ?? ""}::${pack ? "pack" : ""}`;
    const line = lineQuantities.get(key);
    if (line) line.quantity += item.quantity;
    else lineQuantities.set(key, { productId: item.productId, color, pack, quantity: item.quantity });
  }
  const productIds = Array.from(new Set(items.map((item) => item.productId)));

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const dbProducts = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productsById = new Map(dbProducts.map((p) => [p.id, p]));

        // Stock is counted in single pieces; a pack uses packSize pieces.
        const units = new Map<string, number>();
        const lines = Array.from(lineQuantities.values());
        for (const { productId, color, pack, quantity } of lines) {
          const product = productsById.get(productId);
          if (!product || !product.isActive) {
            throw new ApiError(400, "One of the items in your cart is no longer available");
          }
          if (pack && (!product.packSize || !product.packPrice)) {
            throw new ApiError(400, `The pack option for ${product.name} is no longer available`);
          }
          if (color && !product.colors.some((c) => c.toLowerCase() === color.toLowerCase())) {
            throw new ApiError(400, `${color} is no longer available for ${product.name}`);
          }
          units.set(productId, (units.get(productId) ?? 0) + quantity * (pack ? product.packSize! : 1));
        }

        for (const [productId, needed] of Array.from(units.entries())) {
          const product = productsById.get(productId)!;
          if (product.stock < needed) {
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
        for (const [productId, needed] of Array.from(units.entries())) {
          const result = await tx.product.updateMany({
            where: { id: productId, isActive: true, stock: { gte: needed } },
            data: { stock: { decrement: needed } },
          });
          if (result.count !== 1) {
            const product = productsById.get(productId)!;
            throw new ApiError(400, `${product.name} just sold out. Please update your cart.`);
          }
        }

        const orderItems = lines.map(({ productId, color, pack, quantity }) => {
          const product = productsById.get(productId)!;
          const price = pack ? product.packPrice! : product.price;
          return {
            productId,
            name: pack ? `${product.name} (Pack of ${product.packSize})` : product.name,
            unit: pack ? `pack of ${product.packSize}` : product.unit,
            color: color ? product.colors.find((c) => c.toLowerCase() === color.toLowerCase()) ?? color : null,
            packSize: pack ? product.packSize : null,
            price,
            quantity,
            total: Math.round(price * quantity),
          };
        });

        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

        const settings = await tx.storeSettings.findUnique({ where: { id: "store" } });
        const shippingFee = Math.round(
          calculateShipping(
            subtotal,
            settings?.shippingFee ?? DEFAULT_SHIPPING_FEE,
            settings ? settings.freeShippingThreshold : DEFAULT_FREE_SHIPPING_THRESHOLD
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
