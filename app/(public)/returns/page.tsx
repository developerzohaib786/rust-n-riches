import type { Metadata } from "next";

import { ContactLine, InfoList, InfoPage, InfoSection } from "@/components/public/InfoPage";
import { getStoreInfo } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Returns & Refunds" };

export default async function ReturnsPage() {
  const store = await getStoreInfo();

  return (
    <InfoPage
      title="Returns & Refunds"
      intro={`If something is not right with your ${store.name} order, we will make it right.`}
    >
      <InfoSection title="Report a problem within 24 hours">
        <p>Contact us within 24 hours of delivery if:</p>
        <InfoList
          items={[
            "An item is damaged, spoiled or past its date.",
            "An item is missing or different from what you ordered.",
            "You were charged more than the total shown on your order.",
          ]}
        />
        <p>Please have your order number ready, and a photo of the item if it is damaged.</p>
      </InfoSection>

      <InfoSection title="What we can do">
        <p>
          Depending on the problem, we will replace the item, deliver what was missing, or refund
          the amount for it. Because we sell groceries, we cannot take back perishable items that
          were delivered in good condition.
        </p>
      </InfoSection>

      <InfoSection title="Refunds">
        <p>
          Orders are paid in cash on delivery, so refunds are made in cash on a later delivery or
          by another method we agree with you.
        </p>
      </InfoSection>

      <InfoSection title="Cancelling an order">
        <p>
          You can ask us to cancel an order before it has been shipped. Once it is out for
          delivery, please report any problem using the steps above instead.
        </p>
      </InfoSection>

      <InfoSection title="Contact us">
        <ContactLine store={store} />
      </InfoSection>
    </InfoPage>
  );
}
