import { notFound } from "next/navigation";
import ProductDetails from "@/components/store/product-details";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.active) return notFound();

  return (
    <ProductDetails
      product={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: parseImages(product.images),
      }}
    />
  );
}
