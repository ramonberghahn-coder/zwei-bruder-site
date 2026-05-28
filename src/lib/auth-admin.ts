import { NextResponse } from "next/server";
import { getSession } from "./session";

export async function requireAdminApi() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}
