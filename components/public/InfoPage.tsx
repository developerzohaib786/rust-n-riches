import Link from "next/link";

import type { StoreInfo } from "@/lib/store";

interface InfoPageProps {
  title: string;
  intro?: string;
  children: React.ReactNode;
}

// Shared layout for the static information / policy pages.
export function InfoPage({ title, intro, children }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{title}</h1>
      {intro && <p className="mt-2 text-base text-text-secondary">{intro}</p>}
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 text-sm leading-relaxed text-text-secondary">
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

export function InfoList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// "Questions? Reach us at ..." built from whatever contact details the store has set up.
export function ContactLine({ store }: { store: StoreInfo }) {
  const parts = [store.phone, store.email].filter(Boolean);

  return (
    <p>
      {parts.length > 0 ? (
        <>
          You can reach us at <span className="text-text-primary">{parts.join(" or ")}</span>, or
          use our{" "}
        </>
      ) : (
        <>You can reach us through our </>
      )}
      <Link href="/contact" className="text-primary hover:underline">
        contact page
      </Link>
      .
    </p>
  );
}
