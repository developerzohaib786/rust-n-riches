"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Store, X } from "lucide-react";

interface NavbarProps {
  storeName?: string;
  logoUrl?: string | null;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({ storeName = "Zain Super Store", logoUrl }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-sm">
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

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="shrink-0 text-text-secondary hover:text-text-primary sm:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2 hover:bg-muted hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
