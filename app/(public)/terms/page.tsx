import type { Metadata } from "next";
import Link from "next/link";

import { ContactLine, InfoList, InfoPage, InfoSection } from "@/components/public/InfoPage";
import { describeDelivery, getStoreInfo } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default async function TermsPage() {
  const store = await getStoreInfo();

  return (
    <InfoPage
      title="Terms & Conditions"
      intro={`By placing an order with ${store.name} you agree to the terms below.`}
    >
      <InfoSection title="Orders">
        <InfoList
          items={[
            "An order is a request to buy. It is accepted when we confirm it.",
            "We may decline or cancel an order, for example if an item is unavailable or we cannot reach you to confirm the delivery.",
            "Please make sure your name, phone number and address are correct.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Prices and availability">
        <p>
          Prices are in Pakistani Rupees (Rs) and can change. The price you pay is the price shown
          at checkout when you place the order. Stock is limited and is checked when you check
          out.
        </p>
      </InfoSection>

      <InfoSection title="Delivery and payment">
        <p>{describeDelivery(store)}</p>
        <p>
          Payment is Cash on Delivery. The full total must be paid when the order is delivered. See
          our{" "}
          <Link href="/delivery-info" className="text-primary hover:underline">
            Delivery Information
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection title="Returns and refunds">
        <p>
          Problems with an order must be reported within 24 hours of delivery. See our{" "}
          <Link href="/returns" className="text-primary hover:underline">
            Returns &amp; Refunds
          </Link>{" "}
          policy.
        </p>
      </InfoSection>

      <InfoSection title="Your information">
        <p>
          How we handle your personal information is described in our{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection title="Changes to these terms">
        <p>We may update these terms from time to time. The version on this page applies.</p>
        <ContactLine store={store} />
      </InfoSection>
    </InfoPage>
  );
}
