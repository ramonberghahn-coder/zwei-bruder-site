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
    <div className="container grid gap-8 py-10 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
        <Image src={image} alt={product.name} fill className="object-cover" />
      </div>
      <div>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="mt-3 text-neutral-600">{product.description}</p>
        <p className="mt-4 text-2xl font-semibold">{formatCurrency(product.price)}</p>
        <p className="mt-1 text-sm text-neutral-500">Estoque: {product.stock}</p>

        <div className="mt-5 flex items-center gap-3">
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
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
