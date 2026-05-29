"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency, isWaitlist, maxOrderQty } from "@/lib/utils";

type Step = "cart" | "payment" | "done";

type PaymentData = {
  orderNumber: string;
  pixPayload: string;
  qrDataUrl: string;
  total: number;
  hasWaitlist: boolean;
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
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const cartHasWaitlist = items.some((i) => isWaitlist(i.stock));

  function closeDrawer() {
    setOpen(false);
    setStep("cart");
    setError(null);
    setPayment(null);
    setProofFile(null);
    setWhatsappUrl(null);
  }

  async function reserveOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    const formData = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const payload = {
        customerName: String(formData.get("customerName") || "").trim(),
        customerPhone: String(formData.get("customerPhone") || "").trim(),
        customerEmail: String(formData.get("customerEmail") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
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
        hasWaitlist: Boolean(data.hasWaitlist),
      });
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reservar pedido");
    } finally {
      setLoading(false);
    }
  }

  async function sendWhatsApp() {
    if (!payment) return;
    if (!proofFile) {
      setError("Envie o comprovante de pagamento antes de continuar.");
      return;
    }

    // Abre a janela JÁ no clique (evita bloqueio de pop-up após o await).
    const preOpened = window.open("", "_blank");

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

      setWhatsappUrl(data.whatsappUrl);
      setStep("done");

      if (preOpened) {
        preOpened.location.href = data.whatsappUrl;
      } else {
        window.location.href = data.whatsappUrl;
      }
    } catch (err) {
      if (preOpened) preOpened.close();
      setError(err instanceof Error ? err.message : "Erro ao abrir WhatsApp");
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
      <button type="button" className="nav-link opacity-50" disabled>
        Carrinho
      </button>
    );
  }

  return (
    <>
      <button type="button" className="nav-link" onClick={() => setOpen(true)}>
        Carrinho ({count})
      </button>

      {open && (
        <div className="drawer-overlay fixed inset-0 z-50 bg-black/30" onClick={closeDrawer}>
          <aside
            className="drawer-panel absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 p-6">
              <h3 className="text-base font-medium">
                {step === "cart" && "Carrinho"}
                {step === "payment" && "Pagamento PIX"}
                {step === "done" && "Pedido enviado"}
              </h3>
              <button type="button" className="text-sm text-neutral-500" onClick={closeDrawer}>
                Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {step === "cart" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {items.length === 0 && (
                      <p className="text-sm text-neutral-500">Seu carrinho está vazio.</p>
                    )}
                    {items.map((item) => {
                      const waitlist = isWaitlist(item.stock);
                      return (
                        <div key={item.productId} className="flex gap-3 border-b border-neutral-100 pb-4">
                          <div className="h-20 w-16 shrink-0 overflow-hidden bg-neutral-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-snug">{item.name}</p>
                              <button
                                type="button"
                                className="shrink-0 text-xs text-neutral-400 hover:text-black"
                                onClick={() => removeItem(item.productId)}
                                aria-label="Remover item"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="mt-0.5 text-sm text-neutral-500">{formatCurrency(item.price)}</p>
                            {waitlist ? (
                              <span className="mt-1 inline-block bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                                Fila de espera
                              </span>
                            ) : null}
                            <div className="mt-2 inline-flex items-center border border-neutral-300">
                              <button
                                type="button"
                                className="px-2.5 py-1 text-sm hover:bg-neutral-100"
                                onClick={() => updateQty(item.productId, item.quantity - 1)}
                                aria-label="Diminuir"
                              >
                                −
                              </button>
                              <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                type="button"
                                className="px-2.5 py-1 text-sm hover:bg-neutral-100 disabled:opacity-30"
                                onClick={() => updateQty(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= maxOrderQty(item.stock)}
                                aria-label="Aumentar"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {items.length > 0 && (
                    <form id="checkout-form" ref={formRef} onSubmit={reserveOrder} className="space-y-3">
                      <p className="text-sm font-medium">Seus dados</p>
                      <div>
                        <label className="text-xs text-neutral-500">Nome completo *</label>
                        <input name="customerName" className="input mt-1" required minLength={2} />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500">WhatsApp com DDD *</label>
                        <input
                          name="customerPhone"
                          className="input mt-1"
                          required
                          inputMode="tel"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <details className="text-sm text-neutral-600">
                        <summary className="cursor-pointer select-none text-xs text-neutral-500">
                          Adicionar e-mail, endereço ou observações (opcional)
                        </summary>
                        <div className="mt-3 space-y-3">
                          <input name="customerEmail" placeholder="E-mail" className="input" />
                          <input name="address" placeholder="Endereço" className="input" />
                          <textarea name="notes" placeholder="Observações" className="textarea" rows={2} />
                        </div>
                      </details>
                    </form>
                  )}
                </div>
              )}

              {step === "payment" && payment && (
                <div className="space-y-5">
                  <p className="text-sm text-neutral-600">
                    Pedido <strong>{payment.orderNumber}</strong> — {formatCurrency(payment.total)}
                  </p>
                  {payment.hasWaitlist ? (
                    <p className="border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      Seu pedido tem itens em <strong>fila de espera</strong>. Acertamos o prazo no WhatsApp.
                    </p>
                  ) : null}
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
                      Após enviar, o WhatsApp abre com o resumo do pedido e o link do comprovante.
                    </p>
                  </div>
                </div>
              )}

              {step === "done" && (
                <div className="space-y-5 text-center">
                  <p className="text-sm text-neutral-600">
                    Pedido <strong>{payment?.orderNumber}</strong> registrado!
                  </p>
                  <p className="text-sm text-neutral-600">
                    Se o WhatsApp não abriu automaticamente, toque no botão abaixo:
                  </p>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full"
                    >
                      Abrir conversa no WhatsApp
                    </a>
                  ) : null}
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </div>

            <div className="border-t border-neutral-200 p-6">
              {step === "cart" && (
                <>
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Total</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                  {cartHasWaitlist ? (
                    <p className="mb-3 text-xs text-amber-800">
                      Há itens em fila de espera no carrinho.
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    form="checkout-form"
                    className="btn btn-primary w-full"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? "Gerando PIX..." : "Finalizar e gerar PIX"}
                  </button>
                </>
              )}

              {step === "payment" && (
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  disabled={sending || !proofFile}
                  onClick={sendWhatsApp}
                >
                  {sending ? "Enviando..." : "Enviar pedido no WhatsApp"}
                </button>
              )}

              {step === "done" && (
                <button type="button" className="btn btn-secondary w-full" onClick={closeDrawer}>
                  Concluir
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
