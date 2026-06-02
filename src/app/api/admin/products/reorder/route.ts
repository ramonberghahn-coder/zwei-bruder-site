import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { assertDatabase, prismaErrorMessage } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    await assertDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const direction = url.searchParams.get("direction");
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    if (direction !== "up" && direction !== "down") {
      return NextResponse.json({ error: "Direção inválida" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true },
    });

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= products.length) {
      return NextResponse.json({ ok: true });
    }

    [products[index], products[target]] = [products[target], products[index]];

    for (let i = 0; i < products.length; i++) {
      await prisma.product.update({
        where: { id: products[i].id },
        data: { sortOrder: i },
      });
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: prismaErrorMessage(error) }, { status: 400 });
  }
}
