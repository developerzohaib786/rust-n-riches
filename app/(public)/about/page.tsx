import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ContactLine, InfoPage, InfoSection } from "@/components/public/InfoPage";
import { describeDelivery, getStoreInfo } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const store = await getStoreInfo();

  return (
    <InfoPage
      title={`About ${store.name}`}
      intro="Quiet pieces for everyday moments, delivered to your door."
    >
      <InfoSection title="Who we are">
        <p>
          {store.name} is a jewelry label that takes orders online. We make thoughtful, everyday
          pieces in small batches, and we bring them to your door.
        </p>
      </InfoSection>

      <InfoSection title="How ordering works">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Browse the store and add what you need to your cart.</li>
          <li>Check out as a guest. There is no account to create.</li>
          <li>We confirm your order and deliver it to your address.</li>
          <li>Pay in cash when it arrives.</li>
        </ol>
        <p>{describeDelivery(store)}</p>
      </InfoSection>

      <InfoSection title="Visit or contact us">
        {store.address && <p>{store.address}</p>}
        <ContactLine store={store} />
      </InfoSection>

      <div>
        <Button asChild size="lg">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    </InfoPage>
  );
}
