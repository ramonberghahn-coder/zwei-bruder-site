import { NextResponse } from "next/server";
import { getSession } from "./session";

export async function requireAdminApi() {
  let session;
  try {
    session = await getSession();
  } catch {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}
