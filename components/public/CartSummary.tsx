import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
  // null while the shipping rules have not loaded yet.
  shipping: number | null;
  freeShippingThreshold?: number | null;
  children?: React.ReactNode;
}

export function CartSummary({ subtotal, shipping, freeShippingThreshold, children }: CartSummaryProps) {
  const total = subtotal + (shipping ?? 0);
  const remainingForFree =
    freeShippingThreshold != null && shipping !== null && shipping > 0
      ? freeShippingThreshold - subtotal
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal</span>
          <span className="text-text-primary">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Delivery</span>
          <span className="text-text-primary">
            {shipping === null ? "Calculating..." : shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        {remainingForFree > 0 && (
          <p className="text-xs text-text-secondary">
            Add {formatPrice(remainingForFree)} more for free delivery.
          </p>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-text-primary">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-text-secondary">Payment: Cash on Delivery</p>
        {children}
      </CardContent>
    </Card>
  );
}
