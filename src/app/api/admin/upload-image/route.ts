import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { uploadImageFileToStorage } from "@/lib/image-storage";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(image.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG ou WEBP." },
        { status: 400 }
      );
    }

    if (image.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Imagem muito grande. Limite de 2MB. Reduza a imagem e tente de novo." },
        { status: 400 }
      );
    }

    const url = await uploadImageFileToStorage(image);

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no upload da imagem." },
      { status: 500 }
    );
  }
}
