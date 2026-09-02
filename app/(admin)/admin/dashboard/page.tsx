import { Users, Package, Wallet, TrendingUp } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CollectionsChart, type CollectionsChartPoint } from "@/components/admin/CollectionsChart";
import { TopCustomersWidget } from "@/components/admin/TopCustomersWidget";
import { LowStockWidget } from "@/components/admin/LowStockWidget";
import { RecentTransactionsWidget } from "@/components/admin/RecentTransactionsWidget";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;
const CHART_DAYS = 30;

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const chartStart = new Date(startOfToday);
  chartStart.setDate(chartStart.getDate() - (CHART_DAYS - 1));

  const [
    totalCustomers,
    totalActiveProducts,
    outstandingAgg,
    todaysCollectionAgg,
    chartTransactions,
    topCustomers,
    lowStockProducts,
    recentTransactions,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.customer.aggregate({ _sum: { totalDue: true } }),
    prisma.transaction.aggregate({
      where: { type: "PAYMENT", createdAt: { gte: startOfToday, lt: startOfTomorrow } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { type: true, amount: true, createdAt: true },
    }),
    prisma.customer.findMany({ orderBy: { totalDue: "desc" }, take: 5 }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lt: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { id: true, name: true } } },
    }),
  ]);

  const buckets = new Map<string, { credit: number; payment: number }>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), { credit: 0, payment: 0 });
  }
  for (const tx of chartTransactions) {
    const key = tx.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (tx.type === "CREDIT") bucket.credit += tx.amount;
    else bucket.payment += tx.amount;
  }
  const chartData: CollectionsChartPoint[] = Array.from(buckets.entries()).map(
    ([date, values]) => ({
      label: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      ...values,
    })
  );

  const totalOutstanding = outstandingAgg._sum.totalDue ?? 0;
  const todaysCollection = todaysCollectionAgg._sum.amount ?? 0;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Overview of your kiryana store activity.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={totalCustomers} icon={Users} tone="primary" />
        <StatCard
          label="Total Active Products"
          value={totalActiveProducts}
          icon={Package}
          tone="accent"
        />
        <StatCard
          label="Total Outstanding Khata"
          value={`₹${totalOutstanding.toFixed(2)}`}
          icon={Wallet}
          tone="danger"
        />
        <StatCard
          label="Today's Collection"
          value={`₹${todaysCollection.toFixed(2)}`}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Collections vs Credit Given</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <CollectionsChart data={chartData} />
          </CardContent>
        </Card>

        <TopCustomersWidget
          customers={topCustomers.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            totalDue: c.totalDue,
          }))}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LowStockWidget
          products={lowStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            unit: p.unit,
          }))}
        />

        <RecentTransactionsWidget
          transactions={recentTransactions.map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            createdAt: tx.createdAt.toISOString(),
            customer: { id: tx.customer.id, name: tx.customer.name },
          }))}
        />
      </div>
    </div>
  );
}
