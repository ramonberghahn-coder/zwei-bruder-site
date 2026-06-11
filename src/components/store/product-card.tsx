"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, productImageUrl } from "@/lib/utils";
import { getWhatsAppWebUrl } from "@/lib/whatsapp";

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
  whatsappNumber?: string;
};

export default function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const image = productImageUrl(product.images[0]);
  const hasCompare = product.compareAt != null && product.compareAt > product.price;
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

  return (
    <article className="group text-center">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-[#f7f4f0]">
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
          {product.stock <= 0 ? (
            restockUrl ? (
              <a
                href={restockUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium uppercase tracking-wider text-amber-700 underline-offset-4 hover:underline"
              >
                Sob encomenda
              </a>
            ) : (
              <p className="text-sm font-medium uppercase tracking-wider text-amber-700">
                Sob encomenda
              </p>
            )
          ) : (
            <>
              <p className="price-label">Preço normal</p>
              <p className="text-sm">{formatCurrency(product.price)}</p>
              {hasCompare ? (
                <p className="text-xs text-neutral-400 line-through">
                  {formatCurrency(product.compareAt!)}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
