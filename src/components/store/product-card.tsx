"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
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
  const { addItem } = useCart();
  const image = productImageUrl(product.images[0]);

  return (
    <article className="group">
      <Link href={`/produto/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </Link>

      <div className="mt-4 space-y-2">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm font-medium">{product.name}</h3>
        </Link>
        <p className="text-sm text-neutral-600">{formatCurrency(product.price)}</p>
        <button
          type="button"
          className="text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline"
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
          {product.stock > 0 ? "Adicionar" : "Esgotado"}
        </button>
      </div>
    </article>
  );
}
