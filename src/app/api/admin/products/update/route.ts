import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth-admin";
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
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = schema.parse(await req.json());
    const images = (body.images || "")
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        stock: body.stock,
        featured: !!body.featured,
        active: body.active ?? true,
        images: JSON.stringify(images),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao atualizar produto" },
      { status: 400 }
    );
  }
}
