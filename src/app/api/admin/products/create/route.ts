import slugify from "slugify";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  category: z.string().min(2),
  stock: z.number().int().min(0),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  images: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const slugBase = slugify(body.name, { lower: true, strict: true });
    const slug = `${slugBase}-${Math.floor(Math.random() * 1000)}`;
    const images = (body.images || "")
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        category: body.category,
        stock: body.stock,
        featured: !!body.featured,
        active: body.active ?? true,
        images: JSON.stringify(images),
      },
    });

    return NextResponse.json({ id: product.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao criar produto" },
      { status: 400 }
    );
  }
}
