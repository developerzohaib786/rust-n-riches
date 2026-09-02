import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dueBadgeVariant } from "@/lib/utils";

export interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  totalDue: number;
}

export function TopCustomersWidget({ customers }: { customers: TopCustomer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Customers by Due</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {customers.length === 0 ? (
          <p className="text-sm text-text-secondary">No outstanding dues.</p>
        ) : (
          customers.map((customer, index) => (
            <Link
              key={customer.id}
              href={`/admin/customers/${customer.id}`}
              className="-mx-2 flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-text-secondary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{customer.name}</p>
                  <p className="text-xs text-text-secondary">{customer.phone}</p>
                </div>
              </div>
              <Badge variant={dueBadgeVariant(customer.totalDue)}>
                ₹{customer.totalDue.toFixed(2)}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
