"use client";

import { useRef } from "react";
import ProductShowcaseCard, { type ShowcaseProduct } from "./product-showcase-card";

export default function ProductCarousel({
  title,
  products,
}: {
  title?: string;
  products: ShowcaseProduct[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scrollBy(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 420);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <section className="mt-4 md:mt-6">
      <div className="flex justify-end">
        {title ? (
          <h2 className="font-display mr-auto text-3xl font-medium md:text-4xl">{title}</h2>
        ) : null}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="flex h-10 w-10 items-center justify-center border border-white/20 text-lg text-white/80 transition hover:border-white/50 hover:text-white"
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="ml-2 flex h-10 w-10 items-center justify-center border border-white/20 text-lg text-white/80 transition hover:border-white/50 hover:text-white"
          aria-label="Próximo"
        >
          ›
        </button>
      </div>

      <div
        ref={trackRef}
        className={`catalog-scroll flex gap-1.5 overflow-x-auto pb-2 md:gap-2 ${title ? "mt-4" : "mt-2"}`}
      >
        {products.map((product) => (
          <div
            key={product.slug}
            className="w-[min(78vw,280px)] shrink-0 md:w-[min(32vw,300px)]"
          >
            <ProductShowcaseCard product={product} className="min-h-[300px] md:min-h-[360px]" />
          </div>
        ))}
      </div>
    </section>
  );
}
