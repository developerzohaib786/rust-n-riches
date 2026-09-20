import Link from "next/link";

interface FooterProps {
  storeName?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export function Footer({ storeName = "Rust N Riches", address, phone, email }: FooterProps) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 text-sm text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-text-primary">{storeName}</span>
          <span>Everyday essentials, delivered.</span>
        </div>

        <nav className="flex flex-col gap-1">
          <span className="font-medium text-text-primary">Shop</span>
          <Link href="/products" className="hover:text-text-primary">
            All Products
          </Link>
          <Link href="/cart" className="hover:text-text-primary">
            Cart
          </Link>
          <Link href="/track-order" className="hover:text-text-primary">
            Track Order
          </Link>
        </nav>

        <nav className="flex flex-col gap-1">
          <span className="font-medium text-text-primary">Help</span>
          <Link href="/about" className="hover:text-text-primary">
            About Us
          </Link>
          <Link href="/faq" className="hover:text-text-primary">
            FAQ
          </Link>
          <Link href="/delivery-info" className="hover:text-text-primary">
            Delivery Information
          </Link>
          <Link href="/returns" className="hover:text-text-primary">
            Returns &amp; Refunds
          </Link>
          <Link href="/contact" className="hover:text-text-primary">
            Contact Us
          </Link>
        </nav>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-text-primary">Contact</span>
          {address && <span>{address}</span>}
          {phone && <span>{phone}</span>}
          {email && <span>{email}</span>}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </span>
          <span className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text-primary">
              Terms &amp; Conditions
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
