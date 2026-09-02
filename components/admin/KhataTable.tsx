import { Receipt } from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export interface KhataTransaction {
  id: string;
  type: "CREDIT" | "PAYMENT";
  amount: number;
  note?: string | null;
  items?: string | null;
  createdAt: string | Date;
  runningBalance: number;
}

interface KhataTableProps {
  transactions: KhataTransaction[];
}

export function KhataTable({ transactions }: KhataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="p-0">
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Add a credit or payment to start this customer's khata."
              />
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={tx.type === "PAYMENT" ? "success" : "warning"}>
                  {tx.type === "PAYMENT" ? "Payment" : "Credit"}
                </Badge>
              </TableCell>
              <TableCell className="text-text-secondary">
                {tx.items || tx.note || "-"}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  tx.type === "PAYMENT" ? "text-success" : "text-danger"
                }`}
              >
                {tx.type === "PAYMENT" ? "-" : "+"}
                {tx.amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-medium text-text-primary">
                ₹{tx.runningBalance.toFixed(2)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
