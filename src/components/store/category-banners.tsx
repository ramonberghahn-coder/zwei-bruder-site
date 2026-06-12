import Link from "next/link";
import { productImageUrl } from "@/lib/utils";

export type CategoryBanner = {
  name: string;
  image: string;
  count: number;
};

export default function CategoryBanners({ categories }: { categories: CategoryBanner[] }) {
  if (categories.length === 0) return null;

  const tiles = categories.slice(0, 2);

  return (
    <div className="mt-12 grid gap-1 md:mt-16 md:grid-cols-2 md:gap-1.5">
      {tiles.map((cat) => (
        <Link
          key={cat.name}
          href={`/?categoria=${encodeURIComponent(cat.name)}#produtos`}
          className="showcase-card block min-h-[220px] md:min-h-[320px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImageUrl(cat.image)} alt={cat.name} loading="lazy" />
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8">
            <p className="font-display text-3xl font-medium text-white md:text-4xl">{cat.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/65">
              {cat.count} produto{cat.count !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
