import type { Metadata } from "next";

import { ContactLine, InfoList, InfoPage, InfoSection } from "@/components/public/InfoPage";
import { getStoreInfo } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPolicyPage() {
  const store = await getStoreInfo();

  return (
    <InfoPage
      title="Privacy Policy"
      intro={`How ${store.name} collects and uses your information.`}
    >
      <InfoSection title="What we collect">
        <p>When you place an order we collect:</p>
        <InfoList
          items={[
            "Your name, phone number and delivery address.",
            "Your email address and order notes, if you choose to give them.",
            "The items, prices and totals of your order.",
          ]}
        />
      </InfoSection>

      <InfoSection title="How we use it">
        <InfoList
          items={[
            "To confirm, prepare and deliver your order.",
            "To contact you about your order, for example by phone or WhatsApp.",
            "To let you look up your order status.",
            "To keep records of sales and handle returns.",
          ]}
        />
        <p>We do not sell your personal information.</p>
      </InfoSection>

      <InfoSection title="Your cart">
        <p>
          Your cart is saved in your own browser (local storage) so it is still there when you come
          back. It is not sent to us until you place an order. We do not use advertising trackers.
        </p>
      </InfoSection>

      <InfoSection title="Who can see your order">
        <p>
          Store staff can see your order details to fulfil it. After you order, you get a private
          link to your order page, so please do not share that link. Orders can also be looked up
          with the order number together with your phone number.
        </p>
      </InfoSection>

      <InfoSection title="Keeping and deleting your data">
        <p>
          We keep order records for as long as we need them to run the store and meet our
          obligations. To ask us to correct or delete your information, contact us.
        </p>
        <ContactLine store={store} />
      </InfoSection>
    </InfoPage>
  );
}
