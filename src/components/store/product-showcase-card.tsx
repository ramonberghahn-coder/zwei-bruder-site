"use client";

import Link from "next/link";
import { formatCurrency, productImageUrl } from "@/lib/utils";

export type ShowcaseProduct = {
  slug: string;
  name: string;
  price: number;
  compareAt?: number | null;
  stock: number;
  category: string;
  images: string[];
};

export default function ProductShowcaseCard({
  product,
  className = "",
}: {
  product: ShowcaseProduct;
  className?: string;
}) {
  const image = productImageUrl(product.images[0]);
  const hasCompare = product.compareAt != null && product.compareAt > product.price;
  const waitlist = product.stock <= 0;

  return (
    <Link
      href={`/produto/${product.slug}`}
      className={`showcase-card group ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={product.name} loading="lazy" />
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-5">
        {product.category ? (
          <span className="w-fit rounded-sm bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
            {product.category}
          </span>
        ) : (
          <span />
        )}
        <div>
          <h3 className="font-display text-xl font-medium leading-tight text-white md:text-2xl">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs uppercase tracking-[0.1em] text-white/75">
            {waitlist ? (
              "Sob encomenda"
            ) : (
              <>
                {formatCurrency(product.price)}
                {hasCompare ? (
                  <span className="ml-2 text-white/45 line-through">
                    {formatCurrency(product.compareAt!)}
                  </span>
                ) : null}
              </>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
