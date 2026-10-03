import Link from "next/link";

interface FooterProps {
  storeName?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export function Footer({ storeName = "AQSAURA", address, phone, email }: FooterProps) {
  return (
    <footer className="bg-[#2a0f3d] text-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="font-serif text-2xl font-medium uppercase tracking-[0.2em] text-white">{storeName}</span>
          <span>Quiet pieces for everyday moments.</span>
        </div>

        <nav className="flex flex-col gap-1">
          <span className="font-medium text-white">Shop</span>
          <Link href="/products" className="hover:text-white">
            All Products
          </Link>
          <Link href="/cart" className="hover:text-white">
            Cart
          </Link>
          <Link href="/track-order" className="hover:text-white">
            Track Order
          </Link>
        </nav>

        <nav className="flex flex-col gap-1">
          <span className="font-medium text-white">Help</span>
          <Link href="/about" className="hover:text-white">
            About Us
          </Link>
          <Link href="/faq" className="hover:text-white">
            FAQ
          </Link>
          <Link href="/delivery-info" className="hover:text-white">
            Delivery Information
          </Link>
          <Link href="/returns" className="hover:text-white">
            Returns &amp; Refunds
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact Us
          </Link>
        </nav>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-white">Contact</span>
          {address && <span>{address}</span>}
          {phone && <span>{phone}</span>}
          {email && <span>{email}</span>}
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </span>
          <span className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
