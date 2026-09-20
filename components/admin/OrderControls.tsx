"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ORDER_STATUS_LABELS, ORDER_TRANSITIONS, type OrderStatusValue } from "@/lib/utils";

interface OrderControlsProps {
  orderId: string;
  status: OrderStatusValue;
  paymentStatus: "UNPAID" | "PAID";
}

export function OrderControls({ orderId, status, paymentStatus }: OrderControlsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const nextSteps = ORDER_TRANSITIONS[status];
  const forward = nextSteps.filter((s) => s !== "CANCELLED");
  const canCancel = nextSteps.includes("CANCELLED");

  async function update(body: { status?: OrderStatusValue; paymentStatus?: "UNPAID" | "PAID" }) {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update order");

      toast({
        title: "Order updated",
        description: body.status
          ? `Marked as ${ORDER_STATUS_LABELS[body.status].toLowerCase()}.`
          : `Payment marked as ${body.paymentStatus === "PAID" ? "paid" : "unpaid"}.`,
      });
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update order",
      });
    } finally {
      setSaving(false);
      setConfirmCancel(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {forward.map((next) => (
        <Button key={next} disabled={saving} onClick={() => update({ status: next })}>
          Mark as {ORDER_STATUS_LABELS[next]}
        </Button>
      ))}

      {status !== "CANCELLED" && (
        <Button
          variant="outline"
          disabled={saving}
          onClick={() =>
            update({ paymentStatus: paymentStatus === "PAID" ? "UNPAID" : "PAID" })
          }
        >
          Mark as {paymentStatus === "PAID" ? "Unpaid" : "Paid"}
        </Button>
      )}

      {canCancel && (
        <Button variant="danger" disabled={saving} onClick={() => setConfirmCancel(true)}>
          Cancel Order
        </Button>
      )}

      <Button variant="ghost" onClick={() => window.print()} className="print:hidden">
        <Printer />
        Print
      </Button>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              The ordered items will be returned to stock. A cancelled order cannot be reopened.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)} disabled={saving}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={() => update({ status: "CANCELLED" })}
              disabled={saving}
            >
              {saving ? "Cancelling..." : "Yes, Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
