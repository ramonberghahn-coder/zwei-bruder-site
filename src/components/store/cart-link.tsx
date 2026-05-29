"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";

export default function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/carrinho" className="nav-link">
      Carrinho{ready ? ` (${count})` : ""}
    </Link>
  );
}
