import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { assertDatabase, prismaErrorMessage } from "@/lib/db-errors";
import { updateSettings } from "@/lib/settings";

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    await assertDatabase();
    const body = await req.json().catch(() => null);
    const list = Array.isArray(body?.categories) ? body.categories : [];

    const cleaned = Array.from(
      new Set(
        list
          .filter((v: unknown): v is string => typeof v === "string")
          .map((v: string) => v.trim())
          .filter(Boolean)
      )
    );

    await updateSettings({ categories: JSON.stringify(cleaned) });

    revalidatePath("/");
    revalidatePath("/admin/produtos");
    return NextResponse.json({ ok: true, categories: cleaned });
  } catch (error) {
    return NextResponse.json({ error: prismaErrorMessage(error) }, { status: 400 });
  }
}
