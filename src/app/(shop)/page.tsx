import ProductCard from "@/components/store/product-card";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { parseImages, productImageUrl } from "@/lib/utils";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    products = [];
  }

  const settings = await getSettings();

  return (
    <section id="produtos" className="container py-12 md:py-16">
      {products.length === 0 ? (
        <p className="text-center text-sm text-neutral-500">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              whatsappNumber={settings.whatsappNumber}
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                compareAt: p.compareAt,
                stock: p.stock,
                images: parseImages(p.images).map((url) => productImageUrl(url)),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
