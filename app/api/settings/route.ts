import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { storeSettingsSchema } from "@/lib/validations";

const STORE_SETTINGS_ID = "store";

export async function GET() {
  const settings = await prisma.storeSettings.upsert({
    where: { id: STORE_SETTINGS_ID },
    update: {},
    create: { id: STORE_SETTINGS_ID },
  });

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = storeSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid settings" },
      { status: 400 }
    );
  }

  const data = {
    ...parsed.data,
    logoUrl: parsed.data.logoUrl || null,
    address: parsed.data.address || null,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    whatsapp: parsed.data.whatsapp || null,
  };

  const settings = await prisma.storeSettings.upsert({
    where: { id: STORE_SETTINGS_ID },
    update: data,
    create: { id: STORE_SETTINGS_ID, ...data },
  });

  return NextResponse.json(settings);
}
