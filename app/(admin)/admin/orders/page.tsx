import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, ShoppingBag } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cn,
  formatPrice,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  orderStatusVariant,
  type OrderStatusValue,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface AdminOrdersPageProps {
  searchParams: { status?: string; q?: string; page?: string };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const query = searchParams.q?.trim();
  const status = ORDER_STATUSES.includes(searchParams.status as OrderStatusValue)
    ? (searchParams.status as OrderStatusValue)
    : undefined;

  const digits = query?.replace(/^#/, "");
  const orderNumber =
    digits && /^\d{1,9}$/.test(digits) ? Number(digits) : undefined;

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            ...(orderNumber !== undefined ? [{ orderNumber }] : []),
            { phone: { contains: query } },
            { customerName: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, totalCount, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const countByStatus = new Map(statusCounts.map((row) => [row.status, row._count._all]));
  const allCount = statusCounts.reduce((sum, row) => sum + row._count._all, 0);

  function href(overrides: { status?: string; page?: number }) {
    const params = new URLSearchParams();
    const nextStatus = "status" in overrides ? overrides.status : status;
    if (nextStatus) params.set("status", nextStatus);
    if (query) params.set("q", query);
    if (overrides.page && overrides.page > 1) params.set("page", String(overrides.page));
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  }

  const tabs: Array<{ label: string; value?: OrderStatusValue; count: number }> = [
    { label: "All", count: allCount },
    ...ORDER_STATUSES.map((s) => ({
      label: ORDER_STATUS_LABELS[s],
      value: s,
      count: countByStatus.get(s) ?? 0,
    })),
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Orders</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Orders placed through your online store.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.value === status;
            return (
              <Link
                key={tab.label}
                href={href({ status: tab.value })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-text-secondary hover:bg-muted"
                )}
              >
                {tab.label} <span className="opacity-70">({tab.count})</span>
              </Link>
            );
          })}
        </div>

        <form method="GET" className="relative w-full sm:max-w-xs">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            name="q"
            placeholder="Order #, name or phone..."
            className="pl-9"
            defaultValue={query ?? ""}
          />
        </form>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <EmptyState
                    icon={ShoppingBag}
                    title="No orders found"
                    description={
                      allCount === 0
                        ? "Orders will show up here as soon as customers check out."
                        : "Try a different status or search term."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const orderStatus = order.status as OrderStatusValue;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-text-secondary">{order.phone}</div>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {order.createdAt.toLocaleDateString("en-PK", { dateStyle: "medium" })}
                    </TableCell>
                    <TableCell>{order._count.items}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={order.paymentStatus === "PAID" ? "success" : "outline"}>
                        {order.paymentStatus === "PAID" ? "Paid" : "COD"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={orderStatusVariant(orderStatus)}>
                        {ORDER_STATUS_LABELS[orderStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={href({ page: page - 1 })}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={href({ page: page + 1 })}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
