import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  const password = String(body.password || "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não configurada no servidor." },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  try {
    const session = await getSession();
    session.isAdmin = true;
    await session.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao iniciar sessão. Verifique SESSION_SECRET na Render (32+ caracteres).",
      },
      { status: 500 }
    );
  }
}
