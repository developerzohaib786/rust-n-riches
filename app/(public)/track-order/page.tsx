import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orderLookupSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Track Your Order" };

interface TrackOrderPageProps {
  searchParams: { orderNumber?: string; phone?: string };
}

// Compare on the last 10 digits so "0300-1234567" matches "+92 300 1234567".
function phoneKey(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const submitted = searchParams.orderNumber !== undefined || searchParams.phone !== undefined;
  let error: string | null = null;

  if (submitted) {
    const parsed = orderLookupSchema.safeParse({
      orderNumber: searchParams.orderNumber ?? "",
      phone: searchParams.phone ?? "",
    });

    if (!parsed.success) {
      error = parsed.error.issues[0]?.message ?? "Please check your details";
    } else {
      const orderNumber = Number(parsed.data.orderNumber.replace("#", ""));
      // Order numbers are int4; anything larger cannot exist (and would make Prisma throw).
      const order =
        Number.isSafeInteger(orderNumber) && orderNumber < 2_147_483_647
          ? await prisma.order.findFirst({
              where: { orderNumber },
              select: { id: true, phone: true },
            })
          : null;

      // Same message whether the number or the phone is wrong, so orders can't be probed.
      if (!order || phoneKey(order.phone) !== phoneKey(parsed.data.phone)) {
        error = "We couldn't find an order matching those details.";
      } else {
        redirect(`/order/${order.id}`);
      }
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Track Your Order</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Enter your order number and the phone number you used at checkout.
      </p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <form method="GET" className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                name="orderNumber"
                placeholder="e.g. 1024"
                inputMode="numeric"
                defaultValue={searchParams.orderNumber ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="03XX XXXXXXX"
                defaultValue={searchParams.phone ?? ""}
                required
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" size="lg">
              Track Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
