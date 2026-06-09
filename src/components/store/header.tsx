import Link from "next/link";
import CartLink from "./cart-link";
import type { StoreSettings } from "@/lib/settings";

export default function Header({ settings }: { settings: StoreSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#11100f]/90 backdrop-blur-md">
      <div className="container">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-[4.5rem]">
          <nav className="flex items-center gap-5 md:gap-8">
            <Link href="/#produtos" className="nav-link">
              Catálogo
            </Link>
            <Link href="/#contato" className="nav-link hidden sm:inline">
              Contato
            </Link>
          </nav>

          <Link
            href="/"
            className="font-display text-center text-xl font-medium tracking-tight text-[#f4f0ea] md:text-2xl"
          >
            {settings.storeName}
          </Link>

          <div className="flex items-center justify-end gap-5 md:gap-8">
            <CartLink />
          </div>
        </div>
      </div>
    </header>
  );
}
