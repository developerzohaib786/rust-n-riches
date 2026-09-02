"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { useToast } from "@/components/ui/use-toast";
import { customerSchema, type CustomerInput } from "@/lib/validations";

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  photoUrl: string | null;
  totalDue: number;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  customer?: CustomerRecord | null;
  onSaved: (customer: CustomerRecord, mode: "create" | "edit") => void;
}

const EMPTY_DEFAULTS: CustomerInput = {
  name: "",
  phone: "",
  address: "",
  photoUrl: "",
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  customer,
  onSaved,
}: CustomerFormDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      mode === "edit" && customer
        ? {
            name: customer.name,
            phone: customer.phone,
            address: customer.address ?? "",
            photoUrl: customer.photoUrl ?? "",
          }
        : EMPTY_DEFAULTS
    );
  }, [open, mode, customer, form]);

  async function onSubmit(values: CustomerInput) {
    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/customers" : `/api/customers/${customer!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          form.setError("phone", { type: "manual", message: data.message });
          return;
        }
        throw new Error(data.message ?? "Failed to save customer");
      }

      toast({
        title: mode === "create" ? "Customer added" : "Customer updated",
        description: values.name,
      });
      onSaved(data, mode);
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save customer",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Customer" : "Edit Customer"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new customer to start tracking their khata."
              : `Update details for ${customer?.name}.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Zohaib Irshad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <ImageUploadField value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : mode === "create" ? "Add Customer" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
