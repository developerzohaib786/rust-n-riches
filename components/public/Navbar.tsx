"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, Store, X } from "lucide-react";

import { useCart } from "@/lib/cart";

interface NavbarProps {
  storeName?: string;
  logoUrl?: string | null;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({ storeName = "Rust N Riches", logoUrl }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, hydrated } = useCart();

  return (
    // Frosted glass: translucent cream over a backdrop blur, with a near-opaque
    // fallback for browsers without backdrop-filter support.
    <header className="sticky top-0 z-30 border-b border-white/40 bg-[rgba(250,246,241,0.95)] shadow-[0_4px_24px_rgba(47,27,18,0.08)] supports-[backdrop-filter]:bg-[rgba(250,246,241,0.65)] supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setMenuOpen(false)}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} className="h-7 w-7 shrink-0 rounded object-cover" />
          ) : (
            <Store className="h-5 w-5 shrink-0 text-primary" />
          )}
          <span className="truncate text-lg font-semibold tracking-tight text-text-primary">
            {storeName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/cart"
            className="relative text-text-secondary hover:text-text-primary"
            aria-label={`Cart${hydrated && itemCount > 0 ? `, ${itemCount} items` : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingCart className="h-6 w-6" />
            {hydrated && itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="text-text-secondary hover:text-text-primary sm:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/40 px-4 py-3 text-sm font-medium text-text-secondary sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2 hover:bg-white/50 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
