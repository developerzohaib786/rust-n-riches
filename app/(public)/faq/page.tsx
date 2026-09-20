import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage } from "@/components/public/InfoPage";
import { describeDelivery, getStoreInfo } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const store = await getStoreInfo();

  const faqs: Array<{ question: string; answer: React.ReactNode }> = [
    {
      question: "Do I need an account to order?",
      answer: "No. You can check out as a guest with just your name, phone number and address.",
    },
    {
      question: "How do I pay?",
      answer:
        "We accept Cash on Delivery. You pay the delivery person when your order arrives.",
    },
    {
      question: "How much is delivery?",
      answer: describeDelivery(store),
    },
    {
      question: "How can I check on my order?",
      answer: (
        <>
          Use the{" "}
          <Link href="/track-order" className="text-primary hover:underline">
            Track Order
          </Link>{" "}
          page with your order number and the phone number you used at checkout. You also get a
          private order link right after you place your order.
        </>
      ),
    },
    {
      question: "Can I change or cancel my order?",
      answer: (
        <>
          Contact us as soon as possible and we will help while your order has not been shipped.
          See our{" "}
          <Link href="/contact" className="text-primary hover:underline">
            contact page
          </Link>
          .
        </>
      ),
    },
    {
      question: "What if an item is out of stock?",
      answer:
        "Stock is checked when you check out. If something sells out while you are ordering, we tell you before the order is placed so you can adjust your cart.",
    },
    {
      question: "What if something is wrong with my order?",
      answer: (
        <>
          Tell us within 24 hours of delivery. See our{" "}
          <Link href="/returns" className="text-primary hover:underline">
            Returns &amp; Refunds
          </Link>{" "}
          page for details.
        </>
      ),
    },
  ];

  return (
    <InfoPage title="Frequently Asked Questions" intro="Quick answers to common questions.">
      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <summary className="cursor-pointer list-none text-base font-medium text-text-primary marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-lg text-text-secondary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{faq.answer}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
