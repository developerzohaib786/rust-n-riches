import { prisma } from "@/lib/prisma";
import { InstantBilling } from "@/components/admin/InstantBilling";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Instant Billing
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Select items to create a walk-in bill. Stock is updated immediately.
      </p>

      <div className="mt-6">
        <InstantBilling
          initialProducts={products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            unit: p.unit,
            stock: p.stock,
          }))}
        />
      </div>
    </div>
  );
}
