import Link from "next/link";
import CartDrawer from "./cart-drawer";

export default function Header({ storeName }: { storeName: string }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-base font-medium tracking-tight">
          {storeName}
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/#produtos" className="hidden text-sm text-neutral-600 hover:text-black sm:inline">
            Produtos
          </Link>
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
