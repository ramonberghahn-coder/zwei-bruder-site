import { PrismaClient } from "@prisma/client";
import { uploadImageDataUrlToStorage } from "../src/lib/image-storage";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function isDataImage(value: string): boolean {
  return value.trim().startsWith("data:image/");
}

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

async function migrateImageValue(value: string, label: string): Promise<string> {
  if (!isDataImage(value)) return value;

  if (dryRun) {
    console.log(`[dry-run] Migraria ${label}`);
    return value;
  }

  console.log(`Migrando ${label}`);
  return uploadImageDataUrlToStorage(value);
}

async function migrateProducts(): Promise<{ changedProducts: number; changedImages: number }> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
    },
  });

  let changedProducts = 0;
  let changedImages = 0;

  for (const product of products) {
    const images = parseImages(product.images);
    let changed = false;
    const nextImages: string[] = [];

    for (let index = 0; index < images.length; index++) {
      const current = images[index];
      const next = await migrateImageValue(
        current,
        `produto "${product.name}" (${product.id}), imagem ${index + 1}`
      );
      nextImages.push(next);

      if (next !== current) {
        changed = true;
        changedImages++;
      }
    }

    if (!changed) continue;

    changedProducts++;
    if (!dryRun) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(nextImages) },
      });
    }
  }

  return { changedProducts, changedImages };
}

async function migratePixQrImage(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: "pixQrImage" },
  });

  if (!setting?.value || !isDataImage(setting.value)) return 0;

  const nextValue = await migrateImageValue(setting.value, "QR Code PIX de backup");
  if (!dryRun && nextValue !== setting.value) {
    await prisma.setting.update({
      where: { key: "pixQrImage" },
      data: { value: nextValue },
    });
  }

  return nextValue !== setting.value ? 1 : 0;
}

async function main() {
  console.log(
    dryRun
      ? "Verificando imagens inline no Neon (dry-run)..."
      : "Migrando imagens inline do Neon para o Cloudinary..."
  );

  const products = await migrateProducts();
  const pixQrImages = await migratePixQrImage();

  console.log(
    [
      `Produtos alterados: ${products.changedProducts}`,
      `Fotos de produto migradas: ${products.changedImages}`,
      `QR Codes PIX migrados: ${pixQrImages}`,
    ].join("\n")
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
