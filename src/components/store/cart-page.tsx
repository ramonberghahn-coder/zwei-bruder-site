"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency, isWaitlist, maxOrderQty } from "@/lib/utils";
import type { ShippingOption } from "@/lib/shipping";

type Stage = "cart" | "payment" | "done";

type CartSettings = {
  pickupEnabled: boolean;
  pickupAddress: string;
  engravingEnabled: boolean;
  engravingPrice1: number;
  engravingPrice2: number;
};

type PaymentData = {
  orderNumber: string;
  pixPayload: string;
  qrDataUrl: string;
  subtotal: number;
  shippingCost: number;
  engravingCost: number;
  total: number;
  hasWaitlist: boolean;
};

export default function CartPage({ settings }: { settings: CartSettings }) {
  const { items, removeItem, updateQty, clearCart, total, count, ready } = useCart();
  const [stage, setStage] = useState<Stage>("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [sending, setSending] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const [cep, setCep] = useState("");
  const [shipLoading, setShipLoading] = useState(false);
  const [shipError, setShipError] = useState<string | null>(null);
  const [shipOptions, setShipOptions] = useState<ShippingOption[]>([]);
  const [shipDest, setShipDest] = useState<{ uf: string; city: string } | null>(null);
  const [selectedShip, setSelectedShip] = useState<ShippingOption | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("shipping");
  const [engravingOn, setEngravingOn] = useState(false);
  const [engravingSides, setEngravingSides] = useState<1 | 2>(1);
  const [engravingText, setEngravingText] = useState("");

  const cartHasWaitlist = items.some((i) => isWaitlist(i.stock));
  const isPickup = settings.pickupEnabled && deliveryMethod === "pickup";
  const shippingCost = isPickup ? 0 : selectedShip?.price ?? 0;
  const engravingUnit = engravingSides === 2 ? settings.engravingPrice2 : settings.engravingPrice1;
  const engravingCost = settings.engravingEnabled && engravingOn ? engravingUnit : 0;
  const displayTotal = payment
    ? payment.total
    : total + shippingCost + engravingCost;

  async function calcularFrete() {
    setShipError(null);
    setSelectedShip(null);
    setShipOptions([]);
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setShipError("Digite um CEP com 8 dígitos.");
      return;
    }
    setShipLoading(true);
    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: digits,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao calcular frete");
      setShipOptions(data.options ?? []);
      setShipDest({ uf: data.uf, city: data.city });
      setSelectedShip(data.options?.[0] ?? null);
    } catch (err) {
      setShipError(err instanceof Error ? err.message : "Erro ao calcular frete");
    } finally {
      setShipLoading(false);
    }
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
        deliveryMethod,
        shippingCost: isPickup ? 0 : selectedShip?.price ?? 0,
        shippingService: isPickup
          ? "Retirada"
          : selectedShip
            ? `${selectedShip.service} • ${selectedShip.days} dia(s) úteis`
            : undefined,
        shippingCep: !isPickup && shipDest ? cep.replace(/\D/g, "") : undefined,
        engraving:
          settings.engravingEnabled && engravingOn
            ? { sides: engravingSides, text: engravingText.trim() }
            : undefined,
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
        subtotal: data.subtotal ?? orderTotal,
        shippingCost: data.shippingCost ?? 0,
        engravingCost: data.engravingCost ?? 0,
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

    const preOpened = window.open("", "_blank");
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${payment.orderNumber}/proof`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao abrir WhatsApp.");

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
    return <div className="container page-y text-center text-sm text-neutral-500">Carregando...</div>;
  }

  // Tela final
  if (stage === "done") {
    return (
      <div className="container page-y text-center">
        <h1 className="font-display text-4xl font-medium">Pedido enviado!</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Pedido <strong>{payment?.orderNumber}</strong> registrado. No WhatsApp,{" "}
          <strong>anexe o print do comprovante</strong> do PIX para concluir. Se a conversa não abriu
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
      <div className="container page-y text-center">
        <h1 className="font-display text-4xl font-medium">Seu carrinho está vazio</h1>
        <p className="mt-3 text-sm text-neutral-600">Explore os produtos e adicione seus favoritos.</p>
        <Link href="/#produtos" className="btn btn-primary mt-8 inline-flex">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-y">
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
                        className="h-32 w-28 shrink-0 overflow-hidden rounded-[10px] bg-[#f7f4f0]"
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
                            Sob encomenda
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
                  Seu pedido tem itens <strong>sob encomenda</strong>. Acertamos o prazo pelo WhatsApp.
                </p>
              ) : null}

              <div className="mt-8 grid gap-8 sm:grid-cols-[240px_1fr]">
                {payment.qrDataUrl ? (
                  <div className="flex justify-center rounded-[10px] border border-[color:var(--border)] p-4">
                    <Image src={payment.qrDataUrl} alt="QR Code PIX" width={208} height={208} unoptimized />
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-neutral-600">
                    Aponte a câmera do seu banco para o QR Code e pague o valor de{" "}
                    <strong>{formatCurrency(payment.total)}</strong>.
                  </p>
                  {payment.pixPayload ? (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wider text-neutral-500">Copia e cola PIX</p>
                      <textarea className="textarea mt-2" rows={4} readOnly value={payment.pixPayload} />
                      <button type="button" className="btn btn-secondary mt-2" onClick={copyPix}>
                        Copiar código PIX
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 max-w-md">
                <p className="text-sm font-medium">Como concluir</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-600">
                  <li>Pague o valor pelo PIX (QR Code ou copia e cola acima).</li>
                  <li>Clique em &quot;Enviar pedido no WhatsApp&quot;.</li>
                  <li>
                    Na conversa que abrir, <strong>anexe o print do comprovante</strong> do PIX.
                  </li>
                </ol>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </>
          )}
        </div>

        {/* Coluna direita: resumo do pedido */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-medium">Resumo do pedido</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd>{formatCurrency(payment ? payment.subtotal : total)}</dd>
              </div>
              <div className="flex justify-between text-neutral-600">
                <dt>{isPickup ? "Entrega" : "Frete"}</dt>
                <dd>
                  {payment
                    ? payment.shippingCost > 0
                      ? formatCurrency(payment.shippingCost)
                      : isPickup
                        ? "Retirada"
                        : "A combinar"
                    : isPickup
                      ? "Retirada"
                      : selectedShip
                        ? formatCurrency(selectedShip.price)
                        : "Calcular abaixo"}
                </dd>
              </div>
              {(payment ? payment.engravingCost : engravingCost) > 0 ? (
                <div className="flex justify-between text-neutral-600">
                  <dt>
                    Gravação
                    {!payment ? ` (${engravingSides} lado${engravingSides > 1 ? "s" : ""})` : ""}
                  </dt>
                  <dd>{formatCurrency(payment ? payment.engravingCost : engravingCost)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatCurrency(displayTotal)}</dd>
              </div>
            </dl>

            {stage === "cart" && settings.pickupEnabled && (
              <div className="mt-6 border-t border-neutral-200 pt-5">
                <p className="text-sm font-medium">Como deseja receber?</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("shipping")}
                    className={`rounded-md border p-2.5 text-sm transition ${
                      !isPickup
                        ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                        : "border-neutral-200"
                    }`}
                  >
                    Envio
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`rounded-md border p-2.5 text-sm transition ${
                      isPickup
                        ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                        : "border-neutral-200"
                    }`}
                  >
                    Retirada
                  </button>
                </div>
                {isPickup && settings.pickupAddress ? (
                  <p className="mt-3 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
                    <span className="font-medium">Local de retirada:</span> {settings.pickupAddress}
                  </p>
                ) : null}
              </div>
            )}

            {stage === "cart" && !isPickup && (
              <div className="mt-6 border-t border-neutral-200 pt-5">
                <p className="text-sm font-medium">Calcular frete</p>
                <div className="mt-2 flex gap-2">
                  <input
                    inputMode="numeric"
                    placeholder="CEP (só números)"
                    className="input"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    maxLength={9}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary shrink-0"
                    onClick={calcularFrete}
                    disabled={shipLoading || items.length === 0}
                  >
                    {shipLoading ? "..." : "Calcular"}
                  </button>
                </div>
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-neutral-500 hover:text-black"
                >
                  Não sei meu CEP
                </a>

                {shipError ? <p className="mt-2 text-sm text-red-600">{shipError}</p> : null}

                {shipDest && shipOptions.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-neutral-500">
                      Entrega em {shipDest.city} - {shipDest.uf}
                    </p>
                    {shipOptions.map((opt) => (
                      <label
                        key={opt.service}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border p-2.5 text-sm ${
                          selectedShip?.service === opt.service
                            ? "border-[color:var(--accent)] bg-[#faf6f2]"
                            : "border-neutral-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ship"
                            checked={selectedShip?.service === opt.service}
                            onChange={() => setSelectedShip(opt)}
                          />
                          <span>
                            {opt.label}
                            <span className="block text-xs text-neutral-500">
                              até {opt.days} dia(s) úteis
                            </span>
                          </span>
                        </span>
                        <span className="font-medium">{formatCurrency(opt.price)}</span>
                      </label>
                    ))}
                    <p className="text-[11px] text-neutral-500">
                      Estimativa. O valor final é confirmado no WhatsApp.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {stage === "cart" && settings.engravingEnabled && (
              <div className="mt-6 border-t border-neutral-200 pt-5">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={engravingOn}
                    onChange={(e) => setEngravingOn(e.target.checked)}
                  />
                  Adicionar gravação (logo ou nome)
                </label>

                {engravingOn ? (
                  <div className="mt-3 space-y-3">
                    <input
                      className="input"
                      placeholder="Nome ou logo a gravar"
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEngravingSides(1)}
                        className={`rounded-md border p-2.5 text-sm transition ${
                          engravingSides === 1
                            ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                            : "border-neutral-200"
                        }`}
                      >
                        1 lado
                        <span className="block text-xs text-neutral-500">
                          {formatCurrency(settings.engravingPrice1)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEngravingSides(2)}
                        className={`rounded-md border p-2.5 text-sm transition ${
                          engravingSides === 2
                            ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                            : "border-neutral-200"
                        }`}
                      >
                        2 lados
                        <span className="block text-xs text-neutral-500">
                          {formatCurrency(settings.engravingPrice2)}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {cartHasWaitlist && stage === "cart" ? (
              <p className="mt-4 text-xs text-amber-800">
                Há itens sob encomenda no carrinho.
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
                disabled={sending}
                onClick={sendWhatsApp}
              >
                {sending ? "Abrindo..." : "Enviar pedido no WhatsApp"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
