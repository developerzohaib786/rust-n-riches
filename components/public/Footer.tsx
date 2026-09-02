interface FooterProps {
  storeName?: string;
  address?: string | null;
}

export function Footer({ storeName = "Zain Super Store", address }: FooterProps) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-8 text-sm text-text-secondary">
        <span>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </span>
        {address && <span>{address}</span>}
      </div>
    </footer>
  );
}
