"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, removeItem, updateQty, total, count } = useCart();

  return (
    <>
      <button className="btn btn-secondary text-sm" onClick={() => setOpen(true)}>
        Carrinho ({count})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Seu carrinho</h3>
              <button onClick={() => setOpen(false)}>Fechar</button>
            </div>

            <div className="mt-4 space-y-3">
              {items.length === 0 && <p className="text-sm text-neutral-600">Carrinho vazio.</p>}
              {items.map((item) => (
                <div key={item.productId} className="card p-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-neutral-600">{formatCurrency(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                      className="input max-w-20"
                    />
                    <button className="text-sm text-red-600" onClick={() => removeItem(item.productId)}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <p className="font-semibold">Total: {formatCurrency(total)}</p>
              <Link href="/checkout" className="btn btn-primary mt-3 w-full" onClick={() => setOpen(false)}>
                Reservar e pagar
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
