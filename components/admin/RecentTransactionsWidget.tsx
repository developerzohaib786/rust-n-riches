import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface RecentTransaction {
  id: string;
  type: "CREDIT" | "PAYMENT";
  amount: number;
  createdAt: string;
  customer: { id: string; name: string };
}

export function RecentTransactionsWidget({
  transactions,
}: {
  transactions: RecentTransaction[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {transactions.length === 0 ? (
          <p className="text-sm text-text-secondary">No transactions yet.</p>
        ) : (
          transactions.map((tx) => (
            <Link
              key={tx.id}
              href={`/admin/customers/${tx.customer.id}`}
              className="-mx-2 flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{tx.customer.name}</p>
                <p className="text-xs text-text-secondary">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tx.type === "PAYMENT" ? "success" : "warning"}>
                  {tx.type === "PAYMENT" ? "Payment" : "Credit"}
                </Badge>
                <span
                  className={`text-sm font-medium ${
                    tx.type === "PAYMENT" ? "text-success" : "text-danger"
                  }`}
                >
                  {tx.type === "PAYMENT" ? "-" : "+"}₹{tx.amount.toFixed(2)}
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
