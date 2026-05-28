import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth-admin";
import { assertDatabase, prismaErrorMessage } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  stock: z.coerce.number().int().min(0),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  images: z.string().optional(),
});

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    await assertDatabase();
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

    revalidatePath("/");
    revalidatePath(`/produto/${id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(". ") },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: prismaErrorMessage(error) }, { status: 400 });
  }
}
