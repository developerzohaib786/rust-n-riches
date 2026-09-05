"use client";

import { useState } from "react";
import { Phone, MapPin, User, Send } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KhataTable, type KhataTransaction } from "@/components/admin/KhataTable";
import {
  TransactionFormDialog,
  type TransactionRecord,
  type TransactionCustomerRecord,
  type TransactionProductOption,
} from "@/components/admin/TransactionFormDialog";
import { PaymentReminderDialog } from "@/components/admin/PaymentReminderDialog";
import { dueBadgeVariant } from "@/lib/utils";

export interface CustomerLedgerData {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  photoUrl: string | null;
  totalDue: number;
}

interface CustomerLedgerProps {
  customer: CustomerLedgerData;
  transactions: KhataTransaction[];
  products: TransactionProductOption[];
}

export function CustomerLedger({
  customer: initialCustomer,
  transactions: initialTransactions,
  products,
}: CustomerLedgerProps) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [dialogType, setDialogType] = useState<"CREDIT" | "PAYMENT" | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);

  function handleSaved({
    transaction,
    customer: updatedCustomer,
  }: {
    transaction: TransactionRecord;
    customer: TransactionCustomerRecord;
  }) {
    setCustomer((prev) => ({ ...prev, totalDue: updatedCustomer.totalDue }));
    setTransactions((prev) => [
      { ...transaction, runningBalance: updatedCustomer.totalDue },
      ...prev,
    ]);
  }

  return (
    <div>
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
              {customer.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={customer.photoUrl}
                  alt={customer.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-7 w-7 text-text-secondary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                {customer.name}
              </h1>
              <div className="mt-1 flex flex-col gap-1 text-sm text-text-secondary sm:flex-row sm:gap-4">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {customer.phone}
                </span>
                {customer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {customer.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Total Due
            </span>
            <Badge
              variant={dueBadgeVariant(customer.totalDue)}
              className="px-4 py-1.5 text-2xl font-semibold"
            >
              ₹{customer.totalDue.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" onClick={() => setDialogType("CREDIT")}>
          Add Credit (Udhaar Diya)
        </Button>
        <Button variant="success" onClick={() => setDialogType("PAYMENT")}>
          Add Payment (Wasooli Aayi)
        </Button>
        {customer.totalDue > 0 && (
          <Button variant="outline" onClick={() => setReminderOpen(true)}>
            <Send className="h-4 w-4" />
            Send Reminder
          </Button>
        )}
      </div>

      <div className="mt-6">
        <KhataTable transactions={transactions} />
      </div>

      {dialogType && (
        <TransactionFormDialog
          open={!!dialogType}
          onOpenChange={(open) => !open && setDialogType(null)}
          type={dialogType}
          customerId={customer.id}
          currentDue={customer.totalDue}
          products={products}
          onSaved={handleSaved}
        />
      )}

      <PaymentReminderDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        customerName={customer.name}
        customerPhone={customer.phone}
        totalDue={customer.totalDue}
      />
    </div>
  );
}
