import type { Metadata } from "next";

import { ContactLine, InfoList, InfoPage, InfoSection } from "@/components/public/InfoPage";
import { describeDelivery, getStoreInfo } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Delivery Information" };

export default async function DeliveryInfoPage() {
  const store = await getStoreInfo();

  return (
    <InfoPage
      title="Delivery Information"
      intro={`How ${store.name} gets your order to you.`}
    >
      <InfoSection title="Delivery charges">
        <p>{describeDelivery(store)}</p>
        <p>The exact amount is shown in your cart and at checkout before you place the order.</p>
      </InfoSection>

      <InfoSection title="Payment">
        <p>
          We currently accept <span className="text-text-primary">Cash on Delivery</span> only.
          Please keep the exact total ready when your order arrives.
        </p>
      </InfoSection>

      <InfoSection title="After you order">
        <InfoList
          items={[
            "We review your order and may contact you by phone or WhatsApp to confirm details.",
            "You can follow its status any time on the Track Order page.",
            "Your order moves through Pending, Confirmed, Shipped and Delivered.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Delivery address">
        <p>
          Please give a complete address and a phone number that is reachable on delivery day. If
          we cannot reach you, delivery may be delayed or the order cancelled.
        </p>
      </InfoSection>

      <InfoSection title="Questions">
        <ContactLine store={store} />
      </InfoSection>
    </InfoPage>
  );
}
