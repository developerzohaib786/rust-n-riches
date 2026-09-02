import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid customer" },
      { status: 400 }
    );
  }

  const existing = await prisma.customer.findUnique({ where: { phone: parsed.data.phone } });
  if (existing) {
    return NextResponse.json(
      { message: "A customer with this phone number already exists." },
      { status: 409 }
    );
  }

  const customer = await prisma.customer.create({ data: parsed.data });
  return NextResponse.json(customer, { status: 201 });
}
