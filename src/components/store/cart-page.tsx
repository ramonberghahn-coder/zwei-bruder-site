"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency, isWaitlist, maxOrderQty } from "@/lib/utils";

type Stage = "cart" | "payment" | "done";

type PaymentData = {
  orderNumber: string;
  pixPayload: string;
  qrDataUrl: string;
  total: number;
  hasWaitlist: boolean;
};

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total, count, ready } = useCart();
  const [stage, setStage] = useState<Stage>("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const cartHasWaitlist = items.some((i) => isWaitlist(i.stock));

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
      setStage("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      setStage("done");
      if (preOpened) preOpened.location.href = data.whatsappUrl;
      else window.location.href = data.whatsappUrl;
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
    return <div className="container py-20 text-center text-sm text-neutral-500">Carregando...</div>;
  }

  // Tela final
  if (stage === "done") {
    return (
      <div className="container py-16 text-center md:py-24">
        <h1 className="font-display text-4xl font-medium">Pedido enviado!</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Pedido <strong>{payment?.orderNumber}</strong> registrado. Se o WhatsApp não abriu
          automaticamente, use o botão abaixo.
        </p>
        <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Abrir conversa no WhatsApp
            </a>
          ) : null}
          <Link href="/" className="btn btn-secondary">
            Voltar à loja
          </Link>
        </div>
      </div>
    );
  }

  // Carrinho vazio
  if (items.length === 0 && stage === "cart") {
    return (
      <div className="container py-16 text-center md:py-24">
        <h1 className="font-display text-4xl font-medium">Seu carrinho está vazio</h1>
        <p className="mt-3 text-sm text-neutral-600">Explore os produtos e adicione seus favoritos.</p>
        <Link href="/#produtos" className="btn btn-primary mt-8 inline-flex">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
        {/* Coluna esquerda: itens ou PIX */}
        <div>
          {stage === "cart" && (
            <>
              <h1 className="font-display text-3xl font-medium md:text-4xl">Carrinho</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {count} {count === 1 ? "item" : "itens"}
              </p>

              <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
                {items.map((item) => {
                  const waitlist = isWaitlist(item.stock);
                  return (
                    <div key={item.productId} className="flex gap-5 py-6">
                      <Link
                        href={`/produto/${item.slug}`}
                        className="h-32 w-28 shrink-0 overflow-hidden bg-neutral-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/produto/${item.slug}`} className="text-base font-medium hover:underline">
                            {item.name}
                          </Link>
                          <p className="shrink-0 text-base font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>

                        <p className="mt-1 text-sm text-neutral-500">{formatCurrency(item.price)} cada</p>

                        {waitlist ? (
                          <span className="mt-2 inline-block w-fit bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                            Fila de espera (sob encomenda)
                          </span>
                        ) : null}

                        <div className="mt-auto flex items-center justify-between pt-4">
                          <div className="inline-flex items-center rounded-full border border-neutral-300">
                            <button
                              type="button"
                              className="px-3 py-1.5 text-base hover:bg-neutral-100 disabled:opacity-30"
                              onClick={() => updateQty(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Diminuir"
                            >
                              −
                            </button>
                            <span className="min-w-9 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              className="px-3 py-1.5 text-base hover:bg-neutral-100 disabled:opacity-30"
                              onClick={() => updateQty(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= maxOrderQty(item.stock)}
                              aria-label="Aumentar"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline"
                            onClick={() => removeItem(item.productId)}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link href="/#produtos" className="mt-6 inline-block text-sm text-neutral-500 hover:text-black">
                ← Continuar comprando
              </Link>
            </>
          )}

          {stage === "payment" && payment && (
            <>
              <h1 className="font-display text-3xl font-medium md:text-4xl">Pagamento PIX</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Pedido {payment.orderNumber} — {formatCurrency(payment.total)}
              </p>

              {payment.hasWaitlist ? (
                <p className="mt-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Seu pedido tem itens em <strong>fila de espera</strong>. Acertamos o prazo pelo WhatsApp.
                </p>
              ) : null}

              <div className="mt-8 grid gap-8 sm:grid-cols-[240px_1fr]">
                {payment.qrDataUrl ? (
                  <div className="flex justify-center border border-neutral-200 p-4">
                    <Image src={payment.qrDataUrl} alt="QR Code PIX" width={208} height={208} unoptimized />
                  </div>
                ) : null}
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-500">Copia e cola PIX</p>
                  <textarea className="textarea mt-2" rows={4} readOnly value={payment.pixPayload} />
                  <button type="button" className="btn btn-secondary mt-2" onClick={copyPix}>
                    Copiar código PIX
                  </button>
                </div>
              </div>

              <div className="mt-8 max-w-md">
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

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </>
          )}
        </div>

        {/* Coluna direita: resumo do pedido */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="border border-neutral-200 p-6">
            <h2 className="text-lg font-medium">Resumo do pedido</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd>{formatCurrency(payment ? payment.total : total)}</dd>
              </div>
              <div className="flex justify-between text-neutral-600">
                <dt>Frete</dt>
                <dd>A combinar pelo WhatsApp</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatCurrency(payment ? payment.total : total)}</dd>
              </div>
            </dl>

            {cartHasWaitlist && stage === "cart" ? (
              <p className="mt-4 text-xs text-amber-800">
                Há itens em fila de espera no carrinho.
              </p>
            ) : null}

            {stage === "cart" && (
              <form onSubmit={reserveOrder} className="mt-6 space-y-3">
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
                    E-mail, endereço ou observações (opcional)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <input name="customerEmail" placeholder="E-mail" className="input" />
                    <input name="address" placeholder="Endereço" className="input" />
                    <textarea name="notes" placeholder="Observações" className="textarea" rows={2} />
                  </div>
                </details>

                <button type="submit" className="btn btn-primary mt-2 w-full" disabled={loading}>
                  {loading ? "Gerando PIX..." : "Finalizar e gerar PIX"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>
            )}

            {stage === "payment" && (
              <button
                type="button"
                className="btn btn-primary mt-6 w-full"
                disabled={sending || !proofFile}
                onClick={sendWhatsApp}
              >
                {sending ? "Enviando..." : "Enviar pedido no WhatsApp"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
