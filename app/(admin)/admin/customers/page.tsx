import { prisma } from "@/lib/prisma";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Customers
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage your kiryana store&apos;s customers and their khata balances.
      </p>

      <div className="mt-6">
        <CustomersTable
          initialCustomers={customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            photoUrl: customer.photoUrl,
            totalDue: customer.totalDue,
          }))}
        />
      </div>
    </div>
  );
}
