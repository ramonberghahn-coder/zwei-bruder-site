"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency, isWaitlist, maxOrderQty, productImageUrl } from "@/lib/utils";
import { getWhatsAppWebUrl } from "@/lib/whatsapp";

type ProductDetailsProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
  };
  whatsappNumber?: string;
};

export default function ProductDetails({ product, whatsappNumber }: ProductDetailsProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const images = product.images.length ? product.images : [""];
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const image = productImageUrl(images[0]);
  const mainImage = productImageUrl(images[active]);
  const waitlist = isWaitlist(product.stock);
  const maxQty = maxOrderQty(product.stock);

  function openLightbox() {
    setZoomed(false);
    setZoomPos({ x: 50, y: 50 });
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setZoomed(false);
  }

  function handleZoomMove(e: React.MouseEvent<HTMLImageElement>) {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL || "");
  useEffect(() => {
    if (!origin && typeof window !== "undefined") setOrigin(window.location.origin);
  }, [origin]);
  const productLink = origin ? `${origin}/produto/${product.slug}` : "";
  const restockUrl = whatsappNumber
    ? getWhatsAppWebUrl(
        whatsappNumber,
        `Olá! Gostaria de informações sobre a reposição deste produto: ${product.name}.` +
          (productLink ? `\n${productLink}` : "")
      )
    : null;

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image,
      quantity: qty,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="container page-y grid gap-12 md:grid-cols-2 md:gap-16">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={openLightbox}
          className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-[10px] bg-[#f7f4f0]"
          aria-label="Ampliar imagem"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
            Ampliar
          </span>
        </button>
        {images.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 overflow-hidden rounded-md bg-[#f7f4f0] ring-2 transition ${
                  i === active ? "ring-neutral-900" : "ring-transparent hover:ring-neutral-300"
                }`}
                aria-label={`Ver imagem ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImageUrl(img)}
                  alt={`${product.name} ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col justify-center md:py-4">
        <Link href="/#produtos" className="eyebrow hover:opacity-60">
          ← Voltar aos produtos
        </Link>
        <h1 className="font-display mt-4 text-4xl font-medium leading-tight md:text-5xl">
          {product.name}
        </h1>
        <div className="mt-6 border-t border-neutral-200 pt-6">
          {waitlist ? (
            <p className="text-sm font-medium uppercase tracking-wider text-amber-700">Sob encomenda</p>
          ) : (
            <>
              <p className="price-label">Preço normal</p>
              <p className="mt-1 text-xl">{formatCurrency(product.price)}</p>
            </>
          )}
        </div>
        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
          {product.description}
        </p>

        {waitlist ? (
          <>
            <p className="mt-6 inline-flex w-fit items-center gap-2 border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
              Esgotado no momento — disponível <strong>sob encomenda</strong>. Combinamos o prazo no WhatsApp.
            </p>
            <div className="mt-8">
              {restockUrl ? (
                <a
                  href={restockUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Falar no WhatsApp sobre reposição
                </a>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={1}
                max={maxQty}
                className="input max-w-20"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value), maxQty)))}
              />
              <button className="btn btn-primary flex-1 sm:flex-none" onClick={handleAdd}>
                Adicionar ao carrinho
              </button>
            </div>
            {added ? (
              <p className="mt-3 text-sm text-green-700">Adicionado ao carrinho.</p>
            ) : null}
          </>
        )}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25"
            aria-label="Fechar"
          >
            ×
          </button>
          <div
            className="relative flex h-[min(88vh,920px)] w-[min(92vw,720px)] max-h-[92vh] max-w-[92vw] items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt={product.name}
              onClick={() => setZoomed((z) => !z)}
              onMouseMove={handleZoomMove}
              draggable={false}
              style={{
                transform: zoomed ? "scale(2.5)" : "scale(1)",
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                cursor: zoomed ? "zoom-out" : "zoom-in",
              }}
              className={`h-full w-full object-contain select-none ${
                zoomed ? "transition-transform duration-200 ease-out" : ""
              }`}
            />
          </div>
          <p className="mt-4 text-xs uppercase tracking-wider text-white/70">
            {zoomed ? "Clique para voltar ao tamanho grande" : "Clique na imagem para ampliar detalhes"}
          </p>
          {images.length > 1 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2" onClick={(e) => e.stopPropagation()}>
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setZoomed(false);
                  }}
                  className={`relative h-14 w-14 overflow-hidden rounded-md ring-2 transition ${
                    i === active ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Ver imagem ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImageUrl(img)}
                    alt={`${product.name} ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
