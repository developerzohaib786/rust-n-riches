import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
}

export type OrderStatusValue = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export const ORDER_STATUSES: OrderStatusValue[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function orderStatusVariant(
  status: OrderStatusValue
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "danger";
    case "PENDING":
      return "warning";
    default:
      return "default";
  }
}

// Which statuses an order may move to from its current one.
export const ORDER_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

// Shipping is free once the subtotal reaches the store's threshold (if one is set).
export function calculateShipping(
  subtotal: number,
  shippingFee: number,
  freeShippingThreshold: number | null
): number {
  if (freeShippingThreshold != null && subtotal >= freeShippingThreshold) return 0;
  return shippingFee;
}
