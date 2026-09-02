import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { CustomerLedger } from "@/components/admin/CustomerLedger";

export const dynamic = "force-dynamic";

export default async function CustomerKhataLedgerPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) notFound();

  const transactions = await prisma.transaction.findMany({
    where: { customerId: params.id },
    orderBy: { createdAt: "asc" },
  });

  let running = 0;
  const withBalance = transactions.map((tx) => {
    running += tx.type === "CREDIT" ? tx.amount : -tx.amount;
    return {
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      note: tx.note,
      items: tx.items,
      createdAt: tx.createdAt.toISOString(),
      runningBalance: running,
    };
  });

  return (
    <div>
      <CustomerLedger
        customer={{
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          photoUrl: customer.photoUrl,
          totalDue: customer.totalDue,
        }}
        transactions={withBalance.reverse()}
      />
    </div>
  );
}
