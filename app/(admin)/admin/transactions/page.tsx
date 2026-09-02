import Link from "next/link";
import { Receipt } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionsFilterBar } from "@/components/admin/TransactionsFilterBar";

export const dynamic = "force-dynamic";

interface TransactionsPageProps {
  searchParams: { type?: string; from?: string; to?: string };
}

export default async function AdminTransactionsPage({ searchParams }: TransactionsPageProps) {
  const { type, from, to } = searchParams;

  const where: Prisma.TransactionWhereInput = {
    ...(type === "CREDIT" || type === "PAYMENT" ? { type } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  };

  const transactions = await prisma.transaction.findMany({
    where,
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Transactions
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Full khata transaction history across all customers.
      </p>

      <div className="mt-6">
        <TransactionsFilterBar />
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon={Receipt}
                    title="No transactions found"
                    description="Try adjusting the type or date range filters."
                  />
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/customers/${tx.customer.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {tx.customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.type === "PAYMENT" ? "success" : "warning"}>
                      {tx.type === "PAYMENT" ? "Payment" : "Credit"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.type === "PAYMENT" ? "text-success" : "text-danger"
                    }`}
                  >
                    {tx.type === "PAYMENT" ? "-" : "+"}
                    {tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {tx.items || tx.note || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
