import ProductShowcaseCard, { type ShowcaseProduct } from "./product-showcase-card";

export default function FeaturedProductsRow({ products }: { products: ShowcaseProduct[] }) {
  if (products.length === 0) return null;

  return (
    <div className="catalog-scroll flex gap-1.5 overflow-x-auto pb-1 md:gap-2">
      {products.map((product) => (
        <div key={product.slug} className="w-[min(72vw,260px)] shrink-0 md:w-[min(28vw,280px)]">
          <ProductShowcaseCard product={product} className="h-[220px] md:h-[260px]" />
        </div>
      ))}
    </div>
  );
}
