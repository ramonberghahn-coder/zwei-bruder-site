import { NextResponse } from "next/server";
import { updateSettings } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = await updateSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao salvar configurações" },
      { status: 400 }
    );
  }
}
