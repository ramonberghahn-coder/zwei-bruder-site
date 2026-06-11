import { PrismaClient } from "@prisma/client";
import { uploadImageDataUrlToStorage } from "../src/lib/image-storage";

const prisma = new PrismaClient();

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const productArg = process.argv.find((arg) => arg.startsWith("--product="));
const imageLimit = limitArg ? Math.max(1, Number(limitArg.split("=")[1]) || 0) : Infinity;
const onlyProductId = productArg ? productArg.split("=")[1]?.trim() : undefined;

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

async function audit(): Promise<{
  productsWithInline: number;
  inlineImages: number;
  externalImages: number;
}> {
  const products = await prisma.product.findMany({
    where: onlyProductId ? { id: onlyProductId } : undefined,
    select: { images: true },
  });

  let productsWithInline = 0;
  let inlineImages = 0;
  let externalImages = 0;

  for (const product of products) {
    const images = parseImages(product.images);
    let hasInline = false;

    for (const img of images) {
      if (isDataImage(img)) {
        inlineImages++;
        hasInline = true;
      } else {
        externalImages++;
      }
    }

    if (hasInline) productsWithInline++;
  }

  return { productsWithInline, inlineImages, externalImages };
}

async function migrateProducts(): Promise<{
  changedProducts: number;
  changedImages: number;
  errors: string[];
}> {
  const products = await prisma.product.findMany({
    where: onlyProductId ? { id: onlyProductId } : undefined,
    select: {
      id: true,
      name: true,
      images: true,
    },
  });

  let changedProducts = 0;
  let changedImages = 0;
  let migratedThisRun = 0;
  const errors: string[] = [];

  for (const product of products) {
    const images = parseImages(product.images);
    let changed = false;
    const nextImages: string[] = [];

    for (let index = 0; index < images.length; index++) {
      const current = images[index];

      if (!isDataImage(current)) {
        nextImages.push(current);
        continue;
      }

      if (migratedThisRun >= imageLimit) {
        nextImages.push(current);
        continue;
      }

      try {
        const next = await migrateImageValue(
          current,
          `produto "${product.name}" (${product.id}), imagem ${index + 1}`
        );
        nextImages.push(next);

        if (next !== current) {
          changed = true;
          changedImages++;
          migratedThisRun++;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido ao migrar imagem.";
        errors.push(`"${product.name}" imagem ${index + 1}: ${message}`);
        nextImages.push(current);
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

  return { changedProducts, changedImages, errors };
}

async function migratePixQrImage(): Promise<number> {
  if (onlyProductId) return 0;

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
      ? "Verificando imagens inline no banco (dry-run)..."
      : "Migrando imagens inline do banco para armazenamento externo..."
  );

  if (onlyProductId) {
    console.log(`Filtro: produto ${onlyProductId}`);
  }
  if (Number.isFinite(imageLimit) && imageLimit !== Infinity) {
    console.log(`Limite: ${imageLimit} imagem(ns) nesta execução`);
  }

  const before = await audit();
  console.log(
    [
      `Produtos com imagem inline: ${before.productsWithInline}`,
      `Fotos inline (base64): ${before.inlineImages}`,
      `Fotos já em URL externa: ${before.externalImages}`,
      "",
    ].join("\n")
  );

  if (before.inlineImages === 0) {
    console.log("Nada a migrar. Todas as imagens já estão como URL.");
    return;
  }

  const products = await migrateProducts();
  const pixQrImages = dryRun || products.changedImages >= imageLimit ? 0 : await migratePixQrImage();

  console.log(
    [
      "",
      dryRun ? "Resumo (dry-run):" : "Resumo:",
      `Produtos alterados: ${products.changedProducts}`,
      `Fotos migradas nesta execução: ${products.changedImages}`,
      `QR Codes PIX migrados: ${pixQrImages}`,
    ].join("\n")
  );

  if (products.errors.length > 0) {
    console.log("\nErros:");
    for (const err of products.errors) {
      console.log(`- ${err}`);
    }
  }

  if (!dryRun && products.changedImages > 0) {
    const after = await audit();
    console.log(
      `\nRestante após migração: ${after.inlineImages} foto(s) inline em ${after.productsWithInline} produto(s).`
    );
    if (after.inlineImages > 0) {
      console.log("Rode o comando novamente até zerar, ou use --limit para lotes menores.");
    }
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
