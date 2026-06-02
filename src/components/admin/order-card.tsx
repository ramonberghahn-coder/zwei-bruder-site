"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";
import {
  canConfirmPayment,
  canMarkComplete,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  isAwaitingPayment,
} from "@/lib/order-status";
import { formatCurrency } from "@/lib/utils";

export type OrderCardData = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string | null;
  shippingService: string | null;
  engravingInfo: string | null;
  total: number;
  paymentProofUrl: string | null;
  whatsappSent: boolean;
  createdAt: string;
};

export default function OrderCard({ order }: { order: OrderCardData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order.status);

  const label = getOrderStatusLabel(status, order.deliveryMethod);
  const badgeClass = getOrderStatusBadgeClass(status);
  const isPickup = order.deliveryMethod === "pickup";

  async function updateStatus(action: "confirm_payment" | "complete") {
    setLoading(true);
    const res = await adminFetch("/api/admin/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, action }),
    });
    if (!res.ok) {
      alert(await readAdminError(res));
      setLoading(false);
      return;
    }
    const data = await res.json();
    setStatus(data.status);
    setLoading(false);
    router.refresh();
  }

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-medium leading-snug ${badgeClass}`}
        >
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm text-neutral-600">
        {order.customerName} · {order.customerPhone}
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        {isPickup ? "Retirada" : "Envio"}
        {order.shippingService && !isPickup ? ` · ${order.shippingService}` : ""}
      </p>
      {order.engravingInfo ? (
        <p className="mt-1 text-sm text-neutral-600">{order.engravingInfo}</p>
      ) : null}

      {isAwaitingPayment(status) && order.whatsappSent ? (
        <p className="mt-2 text-xs text-amber-800">
          Cliente enviou o pedido pelo WhatsApp — confira o comprovante e confirme o pagamento.
        </p>
      ) : null}

      <p className="mt-3 text-base font-semibold">Total: {formatCurrency(order.total)}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        {canConfirmPayment(status) ? (
          <button
            type="button"
            className="btn btn-primary text-sm"
            disabled={loading}
            onClick={() => updateStatus("confirm_payment")}
          >
            {loading ? "Salvando..." : "Confirmar pagamento"}
          </button>
        ) : null}
        {canMarkComplete(status) ? (
          <button
            type="button"
            className="btn btn-secondary text-sm"
            disabled={loading}
            onClick={() => updateStatus("complete")}
          >
            {loading
              ? "Salvando..."
              : isPickup
                ? "Marcar como retirado"
                : "Marcar como entregue"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
