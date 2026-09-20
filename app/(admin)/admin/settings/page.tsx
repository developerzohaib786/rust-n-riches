import { prisma } from "@/lib/prisma";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";

export const dynamic = "force-dynamic";

const STORE_SETTINGS_ID = "store";

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.upsert({
    where: { id: STORE_SETTINGS_ID },
    update: {},
    create: { id: STORE_SETTINGS_ID },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Settings
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Store profile, contact details and delivery charges shown on your online store.
      </p>

      <div className="mt-6 max-w-2xl">
        <StoreSettingsForm
          defaultValues={{
            name: settings.name,
            logoUrl: settings.logoUrl ?? "",
            address: settings.address ?? "",
            phone: settings.phone ?? "",
            email: settings.email ?? "",
            whatsapp: settings.whatsapp ?? "",
            shippingFee: settings.shippingFee,
            freeShippingThreshold: settings.freeShippingThreshold,
          }}
        />
      </div>
    </div>
  );
}
