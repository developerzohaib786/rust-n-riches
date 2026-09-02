"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2, User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { dueBadgeVariant } from "@/lib/utils";
import {
  CustomerFormDialog,
  type CustomerRecord,
} from "@/components/admin/CustomerFormDialog";

interface CustomersTableProps {
  initialCustomers: CustomerRecord[];
}

export function CustomersTable({ initialCustomers }: CustomersTableProps) {
  const { toast } = useToast();

  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(term) || c.phone.includes(term)
    );
  }, [customers, search]);

  function openCreate() {
    setFormMode("create");
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEdit(customer: CustomerRecord) {
    setFormMode("edit");
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function handleSaved(customer: CustomerRecord, mode: "create" | "edit") {
    setCustomers((prev) =>
      mode === "create"
        ? [...prev, customer].sort((a, b) => a.name.localeCompare(b.name))
        : prev.map((c) => (c.id === customer.id ? customer : c))
    );
  }

  function openDelete(customer: CustomerRecord) {
    setDeleteTarget(customer);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/customers/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setDeleteError(data.message ?? "This customer has existing transactions and cannot be deleted.");
          return;
        }
        throw new Error(data.message ?? "Failed to delete customer");
      }

      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast({ title: "Customer deleted", description: `${deleteTarget.name} was removed.` });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Could not delete customer.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Total Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={Users}
                    title="No customers found"
                    description={
                      customers.length === 0
                        ? "Add your first customer to start tracking their khata."
                        : "Try a different name or phone number."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                      {customer.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={customer.photoUrl}
                          alt={customer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-text-secondary" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-text-secondary">{customer.phone}</TableCell>
                  <TableCell className="text-text-secondary">
                    {customer.address || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dueBadgeVariant(customer.totalDue)}>
                      ₹{customer.totalDue.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>View Ledger</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(customer)}
                        aria-label="Edit customer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => openDelete(customer)}
                        aria-label="Delete customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        customer={editingCustomer}
        onSaved={handleSaved}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete customer?</DialogTitle>
            {!deleteError && (
              <DialogDescription>
                This will permanently delete &quot;{deleteTarget?.name}&quot;. This action cannot be undone.
              </DialogDescription>
            )}
          </DialogHeader>

          {deleteError && (
            <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{deleteError}</div>
          )}

          <DialogFooter>
            {deleteError ? (
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
