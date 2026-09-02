"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { transactionSchema, type TransactionInput } from "@/lib/validations";

export interface TransactionRecord {
  id: string;
  type: "CREDIT" | "PAYMENT";
  amount: number;
  note: string | null;
  items: string | null;
  createdAt: string;
}

export interface TransactionCustomerRecord {
  id: string;
  totalDue: number;
}

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "CREDIT" | "PAYMENT";
  customerId: string;
  currentDue: number;
  onSaved: (result: { transaction: TransactionRecord; customer: TransactionCustomerRecord }) => void;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  type,
  customerId,
  currentDue,
  onSaved,
}: TransactionFormDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      customerId,
      type,
      amount: 0,
      note: "",
      items: "",
      date: todayIsoDate(),
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      customerId,
      type,
      amount: 0,
      note: "",
      items: "",
      date: todayIsoDate(),
    });
  }, [open, type, customerId, form]);

  const isCredit = type === "CREDIT";

  async function onSubmit(values: TransactionInput) {
    if (!isCredit && values.amount > currentDue) {
      form.setError("amount", {
        type: "manual",
        message: `Payment cannot exceed the current due of ₹${currentDue.toFixed(2)}`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && !isCredit) {
          form.setError("amount", { type: "manual", message: data.message });
          return;
        }
        throw new Error(data.message ?? "Failed to record transaction");
      }

      toast({
        title: isCredit ? "Credit added" : "Payment recorded",
        description: `₹${values.amount.toFixed(2)}`,
      });
      onSaved(data);
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to record transaction",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCredit ? "Add Credit (Udhaar Diya)" : "Add Payment (Wasooli Aayi)"}
          </DialogTitle>
          <DialogDescription>
            {isCredit
              ? "Record items given to this customer on credit."
              : "Record a payment received from this customer."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCredit && (
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Items (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2kg rice, 1L oil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional note" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant={isCredit ? "accent" : "success"} disabled={submitting}>
                {submitting ? "Saving..." : isCredit ? "Add Credit" : "Add Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
