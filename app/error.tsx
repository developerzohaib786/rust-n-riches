"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
        <AlertTriangle className="h-8 w-8 text-danger" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-text-secondary">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="secondary" asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </main>
  );
}
