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
    const body = await req.json();
    const settings = await updateSettings(body);
    revalidatePath("/", "layout");
    revalidatePath("/");
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: prismaErrorMessage(error) }, { status: 400 });
  }
}
