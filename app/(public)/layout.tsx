import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { CartProvider } from "@/lib/cart";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.storeSettings.upsert({
    where: { id: "store" },
    update: {},
    create: { id: "store" },
  });

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar storeName={settings.name} logoUrl={settings.logoUrl} />
        <main className="flex-1">{children}</main>
        <Footer
          storeName={settings.name}
          address={settings.address}
          phone={settings.phone}
          email={settings.email}
        />
      </div>
    </CartProvider>
  );
}
