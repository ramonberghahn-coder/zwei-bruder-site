import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { PrismaClient } from "@prisma/client";

const outputPath = resolve(
  process.cwd(),
  process.argv[2] || "exports/woocommerce-products.csv"
);

const HEADERS = [
  "Type",
  "SKU",
  "Name",
  "Published",
  "Featured?",
  "Visibility in catalog",
  "Short description",
  "Description",
  "Regular price",
  "Sale price",
  "In stock?",
  "Stock",
  "Backorders allowed?",
  "Weight (kg)",
  "Categories",
  "Images",
];

function parseImages(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    return [];
  }

  return [];
}

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function shortDescription(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).trim()}...`;
}

function formatPrice(value: number | null | undefined): string {
  if (value == null) return "";
  return value.toFixed(2);
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(
      [
        "Exporta produtos do banco atual para CSV compatível com WooCommerce.",
        "",
        "Uso:",
        "  npm run wordpress:export-products",
        "  npm run wordpress:export-products -- exports/produtos.csv",
        "",
        "Requer DATABASE_URL apontando para o banco atual.",
      ].join("\n")
    );
    return;
  }

  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const rows = products.map((product) => {
      const images = parseImages(product.images).filter((url) => url.startsWith("http"));

      return [
        "simple",
        product.slug,
        product.name,
        product.active ? "1" : "0",
        product.featured ? "1" : "0",
        "visible",
        shortDescription(product.description),
        product.description,
        formatPrice(product.price),
        "",
        product.stock > 0 ? "1" : "0",
        product.stock,
        product.stock > 0 ? "0" : "notify",
        (product.weight / 1000).toFixed(3),
        product.category,
        images.join(", "),
      ].map(csvCell);
    });

    const csv = [HEADERS.map(csvCell), ...rows].map((row) => row.join(",")).join("\n");

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${csv}\n`, "utf8");

    console.log(`Exportados ${products.length} produtos para ${outputPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
