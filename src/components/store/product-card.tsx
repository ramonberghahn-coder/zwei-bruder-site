"use client";

import Link from "next/link";
import { formatCurrency, productImageUrl } from "@/lib/utils";

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
  const image = productImageUrl(product.images[0]);
  const hasCompare = product.compareAt != null && product.compareAt > product.price;

  return (
    <article className="group text-center">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="mt-5 space-y-1.5 px-1">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
        </Link>
        <div className="space-y-0.5">
          <p className="price-label">Preço normal</p>
          <p className="text-sm">{formatCurrency(product.price)}</p>
          {hasCompare ? (
            <p className="text-xs text-neutral-400 line-through">{formatCurrency(product.compareAt!)}</p>
          ) : null}
        </div>
        {product.stock <= 0 ? (
          <p className="pt-1 text-xs uppercase tracking-wider text-neutral-400">Esgotado</p>
        ) : null}
      </div>
    </article>
  );
}
