"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reserveOrder(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        customerName: String(formData.get("customerName") || ""),
        customerPhone: String(formData.get("customerPhone") || ""),
        customerEmail: String(formData.get("customerEmail") || ""),
        address: String(formData.get("address") || ""),
        notes: String(formData.get("notes") || ""),
        items,
      };

      const res = await fetch("/api/cart/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao reservar pedido");

      clearCart();
      window.location.href = `/obrigado/${data.orderNumber}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container grid gap-10 py-12 md:grid-cols-2 md:py-16">
      <form action={reserveOrder} className="space-y-4">
        <h1 className="text-2xl font-medium">Checkout</h1>
        <input name="customerName" placeholder="Nome completo" className="input" required />
        <input name="customerPhone" placeholder="WhatsApp (com DDD)" className="input" required />
        <input name="customerEmail" placeholder="Email" className="input" />
        <input name="address" placeholder="Endereço (opcional)" className="input" />
        <textarea name="notes" placeholder="Observações" className="textarea" rows={3} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading || items.length === 0}>
          {loading ? "Reservando..." : "Reservar e gerar PIX"}
        </button>
      </form>

      <aside className="border border-neutral-200 p-6">
        <h2 className="text-sm font-medium">Resumo</h2>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm text-neutral-600">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatCurrency(item.quantity * item.price)}</span>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-neutral-500">Carrinho vazio.</p>}
        </div>
        <p className="mt-6 border-t border-neutral-200 pt-4 text-base font-medium">
          Total {formatCurrency(total)}
        </p>
      </aside>
    </div>
  );
}
