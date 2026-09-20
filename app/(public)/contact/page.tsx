import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "store" } });
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "");

  const items = [
    settings?.phone && {
      icon: Phone,
      label: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/[^\d+]/g, "")}`,
    },
    whatsappDigits && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: `+${whatsappDigits}`,
      href: `https://wa.me/${whatsappDigits}`,
    },
    settings?.email && {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings?.address && {
      icon: MapPin,
      label: "Address",
      value: settings.address,
      href: undefined,
    },
  ].filter(Boolean) as Array<{
    icon: typeof Phone;
    label: string;
    value: string;
    href: string | undefined;
  }>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Contact Us</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Questions about an order or a product? Get in touch with {settings?.name ?? "us"}.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-text-secondary">
          Contact details will be available soon.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, label, value, href }) => (
            <Card key={label}>
              <CardContent className="flex items-start gap-3 p-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="break-words text-sm text-text-secondary hover:text-primary hover:underline"
                      {...(href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="break-words text-sm text-text-secondary">{value}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
