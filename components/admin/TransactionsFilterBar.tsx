"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TransactionsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(value) => updateParams({ type: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="CREDIT">Credit</SelectItem>
          <SelectItem value="PAYMENT">Payment</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          className="w-full sm:w-40"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(e) => updateParams({ from: e.target.value || undefined })}
          aria-label="From date"
        />
        <span className="text-sm text-text-secondary">to</span>
        <Input
          type="date"
          className="w-full sm:w-40"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(e) => updateParams({ to: e.target.value || undefined })}
          aria-label="To date"
        />
      </div>
    </div>
  );
}
