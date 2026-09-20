import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  orderStatusVariant,
  type OrderStatusValue,
} from "@/lib/utils";

export interface RecentOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  total: number;
  status: OrderStatusValue;
  createdAt: string;
}

export function RecentOrdersWidget({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {orders.length === 0 ? (
          <p className="text-sm text-text-secondary">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  #{order.orderNumber} · {order.customerName}
                </p>
                <p className="text-xs text-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={orderStatusVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <span className="text-sm font-medium text-text-primary">
                  {formatPrice(order.total)}
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
