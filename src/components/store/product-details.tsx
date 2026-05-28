"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";

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
  const image = product.images[0] || "https://picsum.photos/800/600";

  return (
    <div className="container grid gap-10 py-12 md:grid-cols-[1fr_0.9fr]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
        <Image src={image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="card h-fit p-7">
        <p className="subtitle">Produto</p>
        <h1 className="mt-3 text-5xl font-semibold leading-none">{product.name}</h1>
        <p className="mt-4 text-neutral-700">{product.description}</p>
        <p className="mt-6 text-3xl font-semibold">{formatCurrency(product.price)}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {product.stock > 0 ? `Estoque disponível: ${product.stock}` : "Sem estoque no momento"}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={product.stock}
            className="input max-w-24"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value), product.stock)))}
          />
          <button
            className="btn btn-primary"
            disabled={product.stock <= 0}
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image,
                quantity: qty,
                stock: product.stock,
              })
            }
          >
            {product.stock > 0 ? "Adicionar ao carrinho" : "Indisponível"}
          </button>
        </div>
        <div className="mt-6 border-t pt-5 text-sm text-neutral-600" style={{ borderColor: "var(--border)" }}>
          Couro legítimo, acabamento artesanal e atendimento via WhatsApp para cada pedido.
        </div>
      </div>
    </div>
  );
}
