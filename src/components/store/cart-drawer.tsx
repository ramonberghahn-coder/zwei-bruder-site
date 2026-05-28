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
      <button type="button" className="text-sm text-neutral-600 hover:text-black" onClick={() => setOpen(true)}>
        Carrinho ({count})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-neutral-200 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Carrinho</h3>
              <button type="button" className="text-sm text-neutral-500" onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {items.length === 0 && <p className="text-sm text-neutral-500">Carrinho vazio.</p>}
              {items.map((item) => (
                <div key={item.productId} className="border-b border-neutral-100 pb-4">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-sm text-neutral-500">{formatCurrency(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                      className="input max-w-20"
                    />
                    <button
                      type="button"
                      className="text-sm text-neutral-500 hover:text-black"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-4">
              <p className="text-sm font-medium">Total {formatCurrency(total)}</p>
              <Link href="/checkout" className="btn btn-primary mt-4 w-full" onClick={() => setOpen(false)}>
                Finalizar
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
