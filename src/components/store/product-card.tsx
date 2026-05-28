"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAt?: number | null;
    stock: number;
    images: string[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const image = product.images[0] || "https://picsum.photos/800/600";

  return (
    <article className="card group overflow-hidden">
      <Link href={`/produto/${product.slug}`}>
        <div className="relative aspect-[4/5] bg-neutral-100">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <h3 className="text-xl font-semibold leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
          {product.compareAt ? (
            <span className="text-neutral-500 line-through">
              {formatCurrency(product.compareAt)}
            </span>
          ) : null}
        </div>
        <button
          className="btn btn-secondary w-full"
          disabled={product.stock <= 0}
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image,
              quantity: 1,
              stock: product.stock,
            })
          }
        >
          {product.stock > 0 ? "Adicionar ao carrinho" : "Indisponível"}
        </button>
      </div>
    </article>
  );
}
