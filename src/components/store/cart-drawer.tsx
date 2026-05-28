"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";

type Step = "cart" | "details" | "payment";

type PaymentData = {
  orderNumber: string;
  pixPayload: string;
  qrDataUrl: string;
  total: number;
};

export default function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, total, count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  function closeDrawer() {
    setOpen(false);
    setStep("cart");
    setError(null);
    setPayment(null);
    setProofFile(null);
  }

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
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };

      const res = await fetch("/api/cart/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao reservar pedido");

      const orderTotal = data.total ?? total;
      clearCart();
      setPayment({
        orderNumber: data.orderNumber,
        pixPayload: data.pixPayload,
        qrDataUrl: data.qrDataUrl,
        total: orderTotal,
      });
      setStep("payment");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao reservar pedido");
    } finally {
      setLoading(false);
    }
  }

  async function sendWhatsApp() {
    if (!payment || !proofFile) {
      setError("Envie o comprovante de pagamento antes de continuar.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("proof", proofFile);
      const res = await fetch(`/api/orders/${payment.orderNumber}/proof`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar comprovante.");

      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      closeDrawer();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao abrir WhatsApp");
    } finally {
      setSending(false);
    }
  }

  function copyPix() {
    if (!payment?.pixPayload) return;
    navigator.clipboard.writeText(payment.pixPayload);
  }

  if (!ready) {
    return (
      <button type="button" className="text-sm text-neutral-600" disabled>
        Carrinho
      </button>
    );
  }

  return (
    <>
      <button type="button" className="text-sm text-neutral-600 hover:text-black" onClick={() => setOpen(true)}>
        Carrinho ({count})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={closeDrawer}>
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 p-6">
              <h3 className="text-base font-medium">
                {step === "cart" && "Carrinho"}
                {step === "details" && "Seus dados"}
                {step === "payment" && "Pagamento PIX"}
              </h3>
              <button type="button" className="text-sm text-neutral-500" onClick={closeDrawer}>
                Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {step === "cart" && (
                <div className="space-y-4">
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
              )}

              {step === "details" && (
                <form id="checkout-form" action={reserveOrder} className="space-y-3">
                  <input name="customerName" placeholder="Nome completo" className="input" required />
                  <input name="customerPhone" placeholder="WhatsApp (com DDD)" className="input" required />
                  <input name="customerEmail" placeholder="Email (opcional)" className="input" />
                  <input name="address" placeholder="Endereço (opcional)" className="input" />
                  <textarea name="notes" placeholder="Observações" className="textarea" rows={3} />
                </form>
              )}

              {step === "payment" && payment && (
                <div className="space-y-5">
                  <p className="text-sm text-neutral-600">
                    Pedido <strong>{payment.orderNumber}</strong> — {formatCurrency(payment.total)}
                  </p>
                  {payment.qrDataUrl ? (
                    <div className="flex justify-center border border-neutral-200 p-4">
                      <Image src={payment.qrDataUrl} alt="QR Code PIX" width={220} height={220} unoptimized />
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs text-neutral-500">Copia e cola PIX</p>
                    <textarea className="textarea mt-1" rows={3} readOnly value={payment.pixPayload} />
                    <button type="button" className="btn btn-secondary mt-2 w-full" onClick={copyPix}>
                      Copiar código PIX
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Comprovante de pagamento</p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="input mt-2"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Após enviar, o WhatsApp abrirá com o pedido e o link do comprovante.
                    </p>
                  </div>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </div>

            <div className="border-t border-neutral-200 p-6">
              {step === "cart" && (
                <>
                  <p className="text-sm font-medium">Total {formatCurrency(total)}</p>
                  <button
                    type="button"
                    className="btn btn-primary mt-4 w-full"
                    disabled={items.length === 0}
                    onClick={() => setStep("details")}
                  >
                    Finalizar pedido
                  </button>
                </>
              )}

              {step === "details" && (
                <button
                  type="submit"
                  form="checkout-form"
                  className="btn btn-primary w-full"
                  disabled={loading || items.length === 0}
                >
                  {loading ? "Gerando PIX..." : "Gerar QR Code PIX"}
                </button>
              )}

              {step === "payment" && (
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  disabled={sending || !proofFile}
                  onClick={sendWhatsApp}
                >
                  {sending ? "Abrindo WhatsApp..." : "Enviar pedido no WhatsApp"}
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
