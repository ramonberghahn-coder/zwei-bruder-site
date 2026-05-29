"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency, isWaitlist, maxOrderQty, productImageUrl } from "@/lib/utils";

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
};

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const image = productImageUrl(product.images[0]);
  const waitlist = isWaitlist(product.stock);
  const maxQty = maxOrderQty(product.stock);

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
    <div className="container grid gap-12 py-12 md:grid-cols-2 md:gap-16 md:py-20">
      <div className="relative aspect-[4/5] bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex flex-col justify-center md:py-4">
        <Link href="/#produtos" className="eyebrow hover:opacity-60">
          ← Voltar aos produtos
        </Link>
        <h1 className="font-display mt-4 text-4xl font-medium leading-tight md:text-5xl">
          {product.name}
        </h1>
        <div className="mt-6 border-t border-neutral-200 pt-6">
          <p className="price-label">Preço normal</p>
          <p className="mt-1 text-xl">{formatCurrency(product.price)}</p>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-neutral-600">{product.description}</p>

        {waitlist ? (
          <p className="mt-6 inline-flex w-fit items-center gap-2 border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
            Esgotado no momento — você pode entrar na <strong>fila de espera</strong> (sob encomenda).
          </p>
        ) : null}

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
            {waitlist ? "Entrar na fila de espera" : "Adicionar ao carrinho"}
          </button>
        </div>
        {added ? (
          <p className="mt-3 text-sm text-green-700">Adicionado ao carrinho.</p>
        ) : null}
      </div>
    </div>
  );
}
