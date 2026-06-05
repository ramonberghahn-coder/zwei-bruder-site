import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { assertDatabase, prismaErrorMessage } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";
import { deleteWooProduct, isWooCommerceConfigured } from "@/lib/woocommerce";

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    if (isWooCommerceConfigured()) {
      await deleteWooProduct(id);
      return NextResponse.json({ ok: true });
    }

    await assertDatabase();
    await prisma.product.delete({ where: { id } });

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: prismaErrorMessage(error) }, { status: 400 });
  }
}
