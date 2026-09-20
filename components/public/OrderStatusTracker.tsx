import { Check, XCircle } from "lucide-react";

import { cn, ORDER_STATUS_LABELS, type OrderStatusValue } from "@/lib/utils";

const STEPS: OrderStatusValue[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export function OrderStatusTracker({ status }: { status: OrderStatusValue }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
        <XCircle className="h-5 w-5" />
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <ol className="flex items-start">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full",
                  index <= currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-text-secondary"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                done ? "text-text-primary" : "text-text-secondary"
              )}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
