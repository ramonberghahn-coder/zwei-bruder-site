import Link from "next/link";
import CartDrawer from "./cart-drawer";

export default function Header({ storeName }: { storeName: string }) {
  return (
    <header className="border-b" style={{ borderColor: "var(--border)", background: "#f9f7f4" }}>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          {storeName}
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/" className="text-sm text-neutral-700 hover:text-black">Loja</Link>
          <Link href="/checkout" className="text-sm text-neutral-700 hover:text-black">Checkout</Link>
          <Link href="/admin" className="text-sm text-neutral-700 hover:text-black">Admin</Link>
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
