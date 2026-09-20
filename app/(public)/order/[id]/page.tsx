import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusTracker } from "@/components/public/OrderStatusTracker";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  orderStatusVariant,
  type OrderStatusValue,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

// Order confirmation pages are private links; keep them out of search engines.
export const metadata: Metadata = { title: "Order Confirmation", robots: { index: false } };

interface OrderPageProps {
  params: { id: string };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id: params.id }, include: { items: true } }),
    prisma.storeSettings.findUnique({ where: { id: "store" } }),
  ]);

  if (!order) notFound();

  const status = order.status as OrderStatusValue;
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "");
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        `Hi, I have a question about my order #${order.orderNumber}.`
      )}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Thank you, {order.customerName.split(" ")[0]}!
        </h1>
        <p className="text-text-secondary">
          Your order <span className="font-semibold text-text-primary">#{order.orderNumber}</span>{" "}
          has been placed. Keep{" "}
          <span className="font-semibold text-text-primary">{formatPrice(order.total)}</span> ready
          in cash on delivery.
        </p>
        <p className="text-xs text-text-secondary">
          Bookmark this page, or use{" "}
          <Link href="/track-order" className="text-primary hover:underline">
            Track Order
          </Link>{" "}
          with your order number and phone to check back later.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Order Status</CardTitle>
          <Badge variant={orderStatusVariant(status)}>{ORDER_STATUS_LABELS[status]}</Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <OrderStatusTracker status={status} />
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pt-0 text-sm text-text-secondary">
            <span className="font-medium text-text-primary">{order.customerName}</span>
            <span>{order.phone}</span>
            {order.email && <span>{order.email}</span>}
            <span>{order.address}</span>
            <span>{order.city}</span>
            {order.notes && <span className="mt-2 italic">&ldquo;{order.notes}&rdquo;</span>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pt-0 text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Cash on Delivery</span>
            <span>
              Status:{" "}
              <span className="text-text-primary">
                {order.paymentStatus === "PAID" ? "Paid" : "To be paid on delivery"}
              </span>
            </span>
            <span>Placed on {order.createdAt.toLocaleDateString("en-PK", { dateStyle: "long" })}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4">
              <span className="text-text-secondary">
                {item.quantity} × {item.name}{" "}
                <span className="text-xs">
                  ({formatPrice(item.price)} / {item.unit})
                </span>
              </span>
              <span className="shrink-0 text-text-primary">{formatPrice(item.total)}</span>
            </div>
          ))}
          <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="text-text-primary">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Delivery</span>
              <span className="text-text-primary">
                {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold text-text-primary">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
        {whatsappHref && (
          <Button asChild variant="secondary">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle />
              Message us on WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
