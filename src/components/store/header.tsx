import Link from "next/link";
import CartDrawer from "./cart-drawer";
import type { StoreSettings } from "@/lib/settings";

export default function Header({ settings }: { settings: StoreSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="container">
        <div className="grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-20">
          <nav className="flex items-center gap-5 md:gap-8">
            <Link href="/#produtos" className="nav-link">
              Produtos
            </Link>
          </nav>

          <Link
            href="/"
            className="font-display text-center text-2xl font-medium tracking-tight md:text-[1.75rem]"
          >
            {settings.storeName}
          </Link>

          <div className="flex items-center justify-end gap-5 md:gap-8">
            <Link href="/#contato" className="nav-link hidden md:inline">
              Contato
            </Link>
            <CartDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
