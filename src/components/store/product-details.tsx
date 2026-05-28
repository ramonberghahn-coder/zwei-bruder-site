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
    <div className="container grid gap-10 py-12 md:grid-cols-2 md:py-16">
      <div className="relative aspect-[4/5] bg-neutral-100">
        <Image src={image} alt={product.name} fill className="object-cover" priority />
      </div>
      <div className="md:pt-6">
        <p className="eyebrow">Produto</p>
        <h1 className="mt-2 text-3xl font-medium">{product.name}</h1>
        <p className="mt-4 text-neutral-600">{product.description}</p>
        <p className="mt-6 text-xl font-medium">{formatCurrency(product.price)}</p>

        <div className="mt-8 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={product.stock}
            className="input max-w-20"
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
      </div>
    </div>
  );
}
