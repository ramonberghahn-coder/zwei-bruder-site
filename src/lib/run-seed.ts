import { prisma } from "@/lib/prisma";

export async function runSeed(): Promise<void> {
  const defaults = {
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
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
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
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }
}
