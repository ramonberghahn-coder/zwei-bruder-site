import ProductCard from "@/components/store/product-card";
import TrustBadges from "@/components/store/trust-badges";
import { prisma } from "@/lib/prisma";
import { parseImages, productImageUrl } from "@/lib/utils";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    products = [];
  }

  const featured = products.filter((p) => p.featured);
  const gridProducts = featured.length > 0 ? featured : products;

  return (
    <div>
      <section className="bg-neutral-100">
        <div className="container flex flex-col items-center py-20 text-center md:py-28 lg:py-32">
          <p className="eyebrow">Coleção artesanal</p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl font-medium leading-[1.1] md:text-6xl lg:text-7xl">
            Feita para durar gerações
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-neutral-600 md:text-base">
            Facas e acessórios em couro. Design atemporal, materiais selecionados e atendimento
            pessoal em cada pedido.
          </p>
          <a href="#produtos" className="btn btn-primary mt-10">
            Compre agora
          </a>
        </div>
      </section>

      <TrustBadges />

      <section id="produtos" className="container py-16 md:py-20">
        <div className="mb-12 text-center">
          <p className="eyebrow">Catálogo</p>
          <h2 className="font-display mt-3 text-3xl font-medium md:text-4xl">Produtos em destaque</h2>
        </div>

        {gridProducts.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridProducts.map((p) => (
              <ProductCard
                key={p.id}
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

        {featured.length > 0 && products.length > featured.length ? (
          <div className="mt-16 text-center">
            <a href="#todos" className="btn btn-secondary">
              Ver todos os produtos
            </a>
          </div>
        ) : null}
      </section>

      {featured.length > 0 && products.length > featured.length ? (
        <section id="todos" className="container border-t border-neutral-200 py-16 md:py-20">
          <h2 className="font-display text-center text-2xl font-medium md:text-3xl">Todos os produtos</h2>
          <div className="mt-12 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
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
        </section>
      ) : null}

      <section id="sobre" className="border-t border-neutral-200 bg-neutral-50">
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="eyebrow">Sobre</p>
            <h2 className="font-display mt-3 text-3xl font-medium md:text-4xl">A Zwei Brüder</h2>
          </div>
          <p className="text-sm leading-relaxed text-neutral-600 md:text-base">
            Inspirados no artesanato europeu, criamos facas e acessórios em couro com acabamento
            impecável. Cada peça passa por controle rigoroso de qualidade — do aço ao costura do
            couro — para acompanhar você por muitos anos.
          </p>
        </div>
      </section>
    </div>
  );
}
