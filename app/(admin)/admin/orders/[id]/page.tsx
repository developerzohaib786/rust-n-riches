import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderControls } from "@/components/admin/OrderControls";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  orderStatusVariant,
  type OrderStatusValue,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

interface AdminOrderPageProps {
  params: { id: string };
}

// wa.me needs an international number with no leading zero or punctuation.
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id: params.id }, include: { items: true } }),
    prisma.storeSettings.findUnique({ where: { id: "store" } }),
  ]);

  if (!order) notFound();

  const status = order.status as OrderStatusValue;
  const message = `Hi ${order.customerName}, this is ${settings?.name ?? "the store"} about your order #${order.orderNumber} (${formatPrice(order.total)}).`;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Order #{order.orderNumber}
        </h1>
        <Badge variant={orderStatusVariant(status)}>{ORDER_STATUS_LABELS[status]}</Badge>
        <Badge variant={order.paymentStatus === "PAID" ? "success" : "outline"}>
          {order.paymentStatus === "PAID" ? "Paid" : "Payment due (COD)"}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        Placed {order.createdAt.toLocaleString("en-PK", { dateStyle: "long", timeStyle: "short" })}
      </p>

      <div className="mt-6 print:hidden">
        <OrderControls
          orderId={order.id}
          status={status}
          paymentStatus={order.paymentStatus}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <span className="text-text-secondary">
                  <span className="text-text-primary">
                    {item.quantity} × {item.name}
                  </span>{" "}
                  ({formatPrice(item.price)} / {item.unit})
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
                <span>Total to collect</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pt-0 text-sm text-text-secondary">
            <span className="font-medium text-text-primary">{order.customerName}</span>
            <a href={`tel:${order.phone}`} className="hover:text-primary hover:underline">
              {order.phone}
            </a>
            {order.email && <span>{order.email}</span>}
            <span className="mt-2">{order.address}</span>
            <span>{order.city}</span>
            {order.notes && (
              <span className="mt-2 rounded-lg bg-muted p-3 italic">&ldquo;{order.notes}&rdquo;</span>
            )}
            <Button asChild variant="secondary" size="sm" className="mt-4 print:hidden">
              <a
                href={`https://wa.me/${whatsappNumber(order.phone)}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle />
                WhatsApp Customer
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
