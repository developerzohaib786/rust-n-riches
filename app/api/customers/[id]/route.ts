import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });

  if (!customer) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid customer" },
      { status: 400 }
    );
  }

  const conflict = await prisma.customer.findFirst({
    where: { phone: parsed.data.phone, NOT: { id: params.id } },
  });
  if (conflict) {
    return NextResponse.json(
      { message: "A customer with this phone number already exists." },
      { status: 409 }
    );
  }

  try {
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }

  const transactionCount = await prisma.transaction.count({
    where: { customerId: params.id },
  });

  if (transactionCount > 0) {
    return NextResponse.json(
      {
        message: `Cannot delete ${customer.name}: they have ${transactionCount} existing transaction${
          transactionCount === 1 ? "" : "s"
        }. Remove their transactions first.`,
      },
      { status: 409 }
    );
  }

  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
