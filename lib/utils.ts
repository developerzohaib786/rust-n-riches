import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dueBadgeVariant(totalDue: number): "success" | "warning" | "danger" {
  if (totalDue <= 0) return "success";
  if (totalDue < 2000) return "warning";
  return "danger";
}
