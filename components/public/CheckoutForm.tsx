"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { CartSummary } from "@/components/public/CartSummary";
import { useCart, type ShippingRules } from "@/lib/cart";
import { calculateShipping, formatPrice } from "@/lib/utils";
import { checkoutFormSchema, type CheckoutFormInput } from "@/lib/validations";

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { lines, hydrated, subtotal, clear, refresh } = useCart();
  const [rules, setRules] = useState<ShippingRules | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  // Set once the order is placed so clearing the cart does not bounce us back to /cart.
  const orderPlaced = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);

  const form = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { customerName: "", phone: "", email: "", address: "", city: "", notes: "" },
  });

  useEffect(() => {
    if (!hydrated) return;
    if (lines.length === 0 && !orderPlaced.current) {
      router.replace("/cart");
      return;
    }
    refresh().then((result) => {
      setRules(result);
      setRefreshed(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  const hasUnavailable = lines.some((line) => line.unavailable);
  const shipping = rules
    ? calculateShipping(subtotal, rules.shippingFee, rules.freeShippingThreshold)
    : null;

  async function onSubmit(values: CheckoutFormInput) {
    if (hasUnavailable) {
      toast({
        variant: "destructive",
        title: "Cart needs attention",
        description: "Remove unavailable items from your cart first.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
          website: honeypot.current?.value ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to place order");

      orderPlaced.current = true;
      clear();
      router.push(`/order/${data.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not place order",
        description: err instanceof Error ? err.message : "Something went wrong",
      });
      // Prices or stock may have changed; re-sync so the summary is accurate.
      refresh().then(setRules);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Checkout</h1>
      <p className="mt-1 text-sm text-text-secondary">
        No account needed. Pay with cash when your order arrives.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Form {...form}>
              <form
                id="checkout-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input autoComplete="name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            autoComplete="tel"
                            placeholder="03XX XXXXXXX"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea
                          autoComplete="street-address"
                          placeholder="House / street / area"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input autoComplete="address-level2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Anything we should know for delivery?"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Honeypot: hidden from people, tempting to bots. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input
                      ref={honeypot}
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Items</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0 text-sm">
              {lines.map((line) => (
                <div key={line.productId} className="flex justify-between gap-3">
                  <span
                    className={line.unavailable ? "text-danger line-through" : "text-text-secondary"}
                  >
                    {line.quantity} × {line.name}
                  </span>
                  <span className="shrink-0 text-text-primary">
                    {line.unavailable ? "Unavailable" : formatPrice(line.price * line.quantity)}
                  </span>
                </div>
              ))}
              <Link href="/cart" className="mt-1 text-xs font-medium text-primary hover:underline">
                Edit cart
              </Link>
            </CardContent>
          </Card>

          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            freeShippingThreshold={rules?.freeShippingThreshold}
          >
            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              className="mt-2 w-full"
              disabled={submitting || !refreshed || hasUnavailable}
            >
              {submitting ? "Placing order..." : "Place Order (Cash on Delivery)"}
            </Button>
            <p className="text-xs text-text-secondary">
              By placing your order you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
            {hasUnavailable && (
              <p className="text-xs text-danger">
                Some items are unavailable. Please{" "}
                <Link href="/cart" className="underline">
                  update your cart
                </Link>
                .
              </p>
            )}
          </CartSummary>
        </div>
      </div>
    </div>
  );
}
