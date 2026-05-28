import { NextResponse } from "next/server";
import { getSessionSafe } from "./session";

export async function requireAdminApi() {
  const session = await getSessionSafe();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}
