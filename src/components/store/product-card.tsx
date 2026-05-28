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
    <article className="card overflow-hidden">
      <Link href={`/produto/${product.slug}`}>
        <div className="relative aspect-[4/3] bg-neutral-100">
          <Image src={image} alt={product.name} fill className="object-cover" />
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <h3 className="font-medium">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatCurrency(product.price)}</span>
          {product.compareAt ? (
            <span className="text-sm text-neutral-500 line-through">
              {formatCurrency(product.compareAt)}
            </span>
          ) : null}
        </div>
        <button
          className="btn btn-primary w-full"
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
          {product.stock > 0 ? "Adicionar ao carrinho" : "Sem estoque"}
        </button>
      </div>
    </article>
  );
}
