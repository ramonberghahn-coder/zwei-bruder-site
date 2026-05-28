import Link from "next/link";
import CartDrawer from "./cart-drawer";

export default function Header({ storeName }: { storeName: string }) {
  return (
    <header
      className="border-b"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-wide">
            {storeName}
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm uppercase tracking-wider text-neutral-700 hover:text-black">
              Produtos
            </Link>
            <Link href="/checkout" className="text-sm uppercase tracking-wider text-neutral-700 hover:text-black">
              Checkout
            </Link>
            <Link href="/admin" className="text-sm uppercase tracking-wider text-neutral-700 hover:text-black">
              Painel
            </Link>
          </nav>
        </div>
        <nav className="flex items-center gap-3">
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
