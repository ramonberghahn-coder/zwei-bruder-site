import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
    instagram: "",
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
      compareAt: null,
      category: "Facas",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80",
      ]),
      stock: 5,
      featured: true,
    },
    {
      name: "Faca Santoku 18cm",
      slug: "faca-santoku-18cm",
      description:
        "Corte preciso com geometria japonesa. Cabo ergonômico em couro envelhecido naturalmente.",
      price: 750,
      category: "Facas",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1615874694520-474822394e73?w=800&q=80",
      ]),
      stock: 8,
      featured: true,
    },
    {
      name: "Estojo de Couro para Facas",
      slug: "estojo-couro-facas",
      description:
        "Couro bovino premium com divisórias internas. Protege e transporta até 3 facas com segurança.",
      price: 420,
      category: "Acessórios",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1627123424574-724758594ecc?w=800&q=80",
      ]),
      stock: 12,
      featured: true,
    },
    {
      name: "Coldre de Couro",
      slug: "coldre-couro",
      description:
        "Coldre artesanal com fivela em latão. Ajustável ao cinto, acabamento envernizado.",
      price: 280,
      category: "Acessórios",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      ]),
      stock: 15,
      featured: false,
    },
    {
      name: "Kit Amolador + Pasta",
      slug: "kit-amolador-pasta",
      description:
        "Pedra de amolar dupla face e pasta para manutenção do fio. Inclui guia de uso.",
      price: 195,
      category: "Acessórios",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1585515320310-259814833ebc?w=800&q=80",
      ]),
      stock: 20,
      featured: false,
    },
    {
      name: "Faca de Desossar 15cm",
      slug: "faca-desossar-15cm",
      description:
        "Lâmina flexível e fina para trabalhos de precisão. Cabo em couro com reforço metálico.",
      price: 620,
      category: "Facas",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
      ]),
      stock: 6,
      featured: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
