import Link from "next/link";
import { Store } from "lucide-react";

interface NavbarProps {
  storeName?: string;
  logoUrl?: string | null;
}

export function Navbar({ storeName = "Zain Super Store", logoUrl }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} className="h-7 w-7 rounded object-cover" />
          ) : (
            <Store className="h-5 w-5 text-primary" />
          )}
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            {storeName}
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-text-secondary">
          <Link href="/" className="hover:text-text-primary">
            Home
          </Link>
          <Link href="/products" className="hover:text-text-primary">
            Products
          </Link>
          <Link href="/contact" className="hover:text-text-primary">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
