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
      intro="An aura is more than what you wear. It's what you leave behind."
    >
      <InfoSection title="Who we are">
        <p>
          At AQS AURA, we believe an aura is more than what you wear — it&apos;s what you leave
          behind. Born from a passion for timeless elegance and modern sophistication, AQS AURA is
          a luxury lifestyle brand dedicated to crafting experiences that awaken the senses. Every
          creation is a blend of artistry, purity, and precision, designed for those who carry
          confidence quietly and leave an unforgettable presence.
        </p>
        <p>
          We are not just selling a product. We are curating an identity. Whether it&apos;s a
          fragrance, an outfit, or a lifestyle essential, AQS AURA stands for quality without
          compromise, luxury without pretense, and beauty that lasts.
        </p>
      </InfoSection>

      <InfoSection title="Our Promise">
        <p>Authenticity in every detail. Excellence in every experience.</p>
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
