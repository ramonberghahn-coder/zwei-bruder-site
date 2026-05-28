import ProductCard from "@/components/store/product-card";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const featured = products.slice(0, 6);

  return (
    <div>
      <section className="premium-hero border-b" style={{ borderColor: "var(--border)" }}>
        <div className="container grid min-h-[65vh] items-center gap-10 py-16 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="subtitle">Linha artesanal</p>
            <h1 className="section-title mt-4 font-semibold">Facas e couro feitos para durar gerações.</h1>
            <p className="mt-6 max-w-2xl text-base text-neutral-700">
              Peças premium com acabamento manual, design limpo e materiais selecionados para
              acompanhar rotina, coleção e legado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#produtos" className="btn btn-primary">
                Comprar agora
              </a>
              <a href="/checkout" className="btn btn-secondary">
                Reservar pedido
              </a>
            </div>
          </div>
          <div className="card p-7">
            <p className="subtitle">Diferenciais</p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-700">
              <li>• Couro legítimo com acabamento artesanal.</li>
              <li>• Lâminas selecionadas e controle de qualidade por peça.</li>
              <li>• Atendimento direto no WhatsApp para cada pedido.</li>
              <li>• Pagamento via PIX com confirmação rápida.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="produtos" className="container py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="subtitle">Produtos em destaque</p>
            <h2 className="mt-2 text-5xl font-semibold">Coleção principal</h2>
          </div>
          <p className="hidden max-w-sm text-right text-sm text-neutral-600 md:block">
            Seleção com visual premium e performance para uso real no dia a dia.
          </p>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
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
        </section>
      </section>
    </div>
  );
}
