import type { Metadata } from "next";

import { CartView } from "@/components/public/CartView";

export const metadata: Metadata = { title: "Your Cart" };

export default function CartPage() {
  return <CartView />;
}
