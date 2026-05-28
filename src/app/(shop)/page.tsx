import ProductCard from "@/components/store/product-card";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

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

  return (
    <div>
      <section className="container border-b border-neutral-200 py-16 md:py-24">
        <p className="eyebrow">Coleção</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-medium leading-tight md:text-5xl">
          Facas e acessórios em couro, feitos para durar.
        </h1>
        <p className="mt-4 max-w-xl text-neutral-600">
          Design limpo, materiais selecionados e atendimento direto para cada pedido.
        </p>
        <a href="#produtos" className="btn btn-primary mt-8 inline-flex">
          Ver produtos
        </a>
      </section>

      <section id="produtos" className="container py-16 md:py-20">
        <div className="mb-10 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-medium">Produtos</h2>
          <p className="text-sm text-neutral-500">{products.length} itens</p>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
                  images: parseImages(p.images),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
