import Link from "next/link";
import CategoryBanners from "@/components/store/category-banners";
import FeaturedProductsRow from "@/components/store/featured-products-row";
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

function catalogTileClass(index: number, total: number): string {
  if (total === 1) return "catalog-tile-hero";
  if (index === 0) return "catalog-tile-lg";
  return "catalog-tile-md";
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

  const nonFeaturedProducts = showcaseProducts.filter((p) => !featuredSlugs.has(p.slug));
  const visibleProducts = activeCategory
    ? showcaseProducts.filter((p) => p.category === activeCategory)
    : nonFeaturedProducts.length > 0
      ? nonFeaturedProducts
      : showcaseProducts;

  const categoryBanners = categories.map((name) => {
    const inCategory = products.filter((p) => p.category === name);
    const cover = parseImages(inCategory[0]?.images ?? "[]")[0] ?? "";
    return { name, image: cover, count: inCategory.length };
  });

  const featured = showcaseProducts.filter((p) => {
    const raw = products.find((r) => r.slug === p.slug);
    return raw?.featured;
  });
  const heroProduct = featured[0] ?? showcaseProducts[0];

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
          {!activeCategory && featured.length > 0 ? (
            <FeaturedProductsRow products={featured} />
          ) : null}

          {categories.length > 0 ? (
            <div
              className={`flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 pb-4 ${
                !activeCategory && featured.length > 0 ? "mt-4" : ""
              }`}
            >
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

          {visibleProducts.length === 0 && (activeCategory || featured.length === 0) ? (
            <p className="mt-12 text-center text-sm text-[#9a9288]">
              {products.length === 0
                ? "Nenhum produto cadastrado ainda."
                : "Nenhum produto nesta categoria."}
            </p>
          ) : visibleProducts.length > 0 ? (
            <div className="catalog-grid mt-4">
              {visibleProducts.map((product, index) => (
                <ProductShowcaseCard
                  key={product.slug}
                  product={product}
                  className={catalogTileClass(index, visibleProducts.length)}
                />
              ))}
            </div>
          ) : null}

          {!activeCategory && categoryBanners.length > 0 ? (
            <CategoryBanners categories={categoryBanners} />
          ) : null}

          {!activeCategory && heroProduct ? (
            <section className="relative mt-12 overflow-hidden border border-white/10 bg-[#1a1816] md:mt-16">
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                  <p className="eyebrow text-[#9a9288]">
                    {heroProduct.category || settings.storeTagline}
                  </p>
                  <h2 className="font-display mt-4 text-4xl font-medium leading-tight md:text-5xl">
                    {heroProduct.name}
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#9a9288]">
                    {settings.aboutText?.trim().slice(0, 160) ||
                      "Peças selecionadas com acabamento artesanal e materiais de alta qualidade."}
                    {(settings.aboutText?.trim().length ?? 0) > 160 ? "…" : ""}
                  </p>
                  <Link
                    href={`/produto/${heroProduct.slug}`}
                    className="btn btn-primary mt-8 w-fit !rounded-full"
                  >
                    Ver produto
                  </Link>
                </div>
                <div className="relative min-h-[280px] md:min-h-[400px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImageUrl(heroProduct.images[0])}
                    alt={heroProduct.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
