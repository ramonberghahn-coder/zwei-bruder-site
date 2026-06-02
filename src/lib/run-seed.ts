import { neon } from "@neondatabase/serverless";
import { getAppDatabaseUrl } from "@/lib/database-url";

// O Neon free pode estar suspenso na primeira requisição ("fetch failed").
// Reexecuta operações que falham por motivos transitórios de conexão.
async function withRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : "";
      const transient =
        /fetch failed|terminated|connection|econnreset|timeout|socket/i.test(msg);
      if (!transient || attempt === tries - 1) throw error;
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }
  }
  throw lastError;
}

/**
 * Seed via driver HTTP do Neon: cada statement é uma requisição independente,
 * sem sessão WebSocket nem transação que possa cair no host -pooler.
 */
export async function runSeed(): Promise<void> {
  const url = getAppDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL não configurada na Render.");
  }

  const sql = neon(url);

  // Acorda o banco (free tier) antes dos inserts.
  await withRetry(() => sql`SELECT 1`);

  const defaults: Record<string, string> = {
    storeName: "Zwei Brüder",
    storeTagline: "Facas e acessórios em couro de alta qualidade",
    whatsappNumber: "5511999999999",
    contactEmail: "contato@zweibruder.com.br",
    pixKey: "contato@zweibruder.com.br",
    pixKeyType: "email",
    pixMerchantName: "ZWEI BRUDER",
    pixMerchantCity: "SAO PAULO",
    aboutText:
      "Artesanato em aço e couro. Cada peça é pensada para durar uma vida inteira.",
    instagram: "@zweibruder",
  };

  for (const [key, value] of Object.entries(defaults)) {
    await withRetry(
      () => sql`
        INSERT INTO "Setting" (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO NOTHING
      `
    );
  }

  const products = [
    {
      name: "Faca Chef 20cm",
      slug: "faca-chef-20cm",
      description:
        'Lâmina em aço inox 8", cabo em couro legítimo costurado à mão. Equilíbrio perfeito para uso diário na cozinha.',
      price: 890,
      compareAt: null as number | null,
      category: "Facas",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80",
      ]),
      stock: 5,
      featured: true,
      active: true,
    },
    {
      name: "Faca Santoku 18cm",
      slug: "faca-santoku-18cm",
      description:
        "Corte preciso com geometria japonesa. Cabo ergonômico em couro envelhecido naturalmente.",
      price: 750,
      compareAt: null,
      category: "Facas",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1615874694520-474822394e73?w=800&q=80",
      ]),
      stock: 8,
      featured: true,
      active: true,
    },
    {
      name: "Estojo de Couro para Facas",
      slug: "estojo-couro-facas",
      description:
        "Couro bovino premium com divisórias internas. Protege e transporta até 3 facas com segurança.",
      price: 420,
      compareAt: null,
      category: "Acessórios",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1627123424574-724758594ecc?w=800&q=80",
      ]),
      stock: 12,
      featured: true,
      active: true,
    },
  ];

  for (const p of products) {
    await withRetry(
      () => sql`
        INSERT INTO "Product"
          (id, name, slug, description, price, "compareAt", category, images, stock, featured, active, "createdAt", "updatedAt")
        VALUES
          (gen_random_uuid()::text, ${p.name}, ${p.slug}, ${p.description}, ${p.price}, ${p.compareAt}, ${p.category}, ${p.images}, ${p.stock}, ${p.featured}, ${p.active}, now(), now())
        ON CONFLICT (slug) DO NOTHING
      `
    );
  }
}
