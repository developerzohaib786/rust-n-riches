import { Clock, Package, ShoppingBag, TrendingUp } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SalesChart, type SalesChartPoint } from "@/components/admin/SalesChart";
import { LowStockWidget } from "@/components/admin/LowStockWidget";
import { RecentOrdersWidget } from "@/components/admin/RecentOrdersWidget";
import { formatPrice, type OrderStatusValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;
const CHART_DAYS = 30;

// Local calendar day as YYYY-MM-DD, so buckets line up with the server's "today".
function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const chartStart = new Date(startOfToday);
  chartStart.setDate(chartStart.getDate() - (CHART_DAYS - 1));

  const [
    pendingOrders,
    todaysOrders,
    totalActiveProducts,
    revenueAgg,
    chartOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: chartStart } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: chartStart }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lt: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const buckets = new Map<string, { revenue: number; orders: number; date: Date }>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    buckets.set(dayKey(d), { revenue: 0, orders: 0, date: d });
  }
  for (const order of chartOrders) {
    const bucket = buckets.get(dayKey(order.createdAt));
    if (!bucket) continue;
    bucket.revenue += order.total;
    bucket.orders += 1;
  }
  const chartData: SalesChartPoint[] = Array.from(buckets.values()).map((bucket) => ({
    label: bucket.date.toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
    revenue: bucket.revenue,
    orders: bucket.orders,
  }));

  const revenue = revenueAgg._sum.total ?? 0;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Overview of your online store activity.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Orders" value={pendingOrders} icon={Clock} tone="accent" />
        <StatCard label="Orders Today" value={todaysOrders} icon={ShoppingBag} tone="primary" />
        <StatCard
          label="Revenue (30 days)"
          value={formatPrice(revenue)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Active Products"
          value={totalActiveProducts}
          icon={Package}
          tone="primary"
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue and Orders</CardTitle>
            <CardDescription>Last 30 days, excluding cancelled orders</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrdersWidget
          orders={recentOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            total: order.total,
            status: order.status as OrderStatusValue,
            createdAt: order.createdAt.toISOString(),
          }))}
        />

        <LowStockWidget
          products={lowStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            unit: p.unit,
          }))}
        />
      </div>
    </div>
  );
}
