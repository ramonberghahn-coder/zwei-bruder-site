import Link from "next/link";
import ProductShowcaseCard, {
  type ShowcaseProduct,
} from "@/components/store/product-showcase-card";
import type { CatalogProduct } from "@/lib/store-products";
import { fetchActiveCatalogProductsSafe } from "@/lib/store-products";
import { getSettings, parseCategories } from "@/lib/settings";
import { parseImages, productImageUrl } from "@/lib/utils";

function toShowcase(p: CatalogProduct): ShowcaseProduct {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAt: p.compareAt,
    stock: p.stock,
    category: p.category,
    images: parseImages(p.images).map((url) => productImageUrl(url)),
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const { products, error: catalogError } = await fetchActiveCatalogProductsSafe();
  const settings = await getSettings();
  const showcaseProducts = products.map(toShowcase);

  const productCategories = new Set(
    products.map((p) => p.category).filter(Boolean)
  );
  const configured = parseCategories(settings.categories);
  const categories = [
    ...configured.filter((c) => productCategories.has(c)),
    ...[...productCategories].filter((c) => !configured.includes(c)),
  ];

  const activeCategory =
    categoria && categories.includes(categoria) ? categoria : null;

  const featuredSlugs = new Set(
    products.filter((p) => p.featured).map((p) => p.slug)
  );

  const visibleProducts = (activeCategory
    ? showcaseProducts.filter((p) => p.category === activeCategory)
    : [...showcaseProducts].sort((a, b) => {
        const aFeatured = featuredSlugs.has(a.slug) ? 0 : 1;
        const bFeatured = featuredSlugs.has(b.slug) ? 0 : 1;
        return aFeatured - bFeatured;
      })
  );

  return (
    <div id="produtos" className="container pb-24 pt-6 md:pt-8">
      {catalogError ? (
        <div className="mx-auto mt-12 max-w-lg border border-amber-500/40 bg-amber-500/10 p-5 text-center text-sm text-amber-100">
          <p className="font-medium">Não foi possível carregar os produtos</p>
          <p className="mt-2 leading-relaxed text-amber-100/90">{catalogError}</p>
          <p className="mt-3 text-xs text-amber-200/70">
            Confira também{" "}
            <a href="/api/health" className="underline" target="_blank" rel="noreferrer">
              /api/health
            </a>
          </p>
        </div>
      ) : (
        <>
          {categories.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 pb-4">
              <Link
                href="/#produtos"
                className={`text-xs font-medium uppercase tracking-[0.14em] transition ${
                  !activeCategory
                    ? "text-[#f4f0ea] underline decoration-[#c4a574] decoration-2 underline-offset-8"
                    : "text-[#9a9288] hover:text-[#f4f0ea]"
                }`}
              >
                Todos
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/?categoria=${encodeURIComponent(c)}#produtos`}
                  className={`text-xs font-medium uppercase tracking-[0.14em] transition ${
                    activeCategory === c
                      ? "text-[#f4f0ea] underline decoration-[#c4a574] decoration-2 underline-offset-8"
                      : "text-[#9a9288] hover:text-[#f4f0ea]"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          ) : null}

          {visibleProducts.length === 0 ? (
            <p className="mt-12 text-center text-sm text-[#9a9288]">
              {products.length === 0
                ? "Nenhum produto cadastrado ainda."
                : "Nenhum produto nesta categoria."}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-1.5">
              {visibleProducts.map((product) => (
                <ProductShowcaseCard
                  key={product.slug}
                  product={product}
                  className={
                    visibleProducts.length === 1 ? "col-span-2 aspect-[16/10] md:col-span-4" : ""
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
