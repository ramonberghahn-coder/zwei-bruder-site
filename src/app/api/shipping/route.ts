import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { estimateShipping, lookupCep, onlyDigits } from "@/lib/shipping";

export const dynamic = "force-dynamic";

const schema = z.object({
  cep: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const cep = onlyDigits(body.cep);
    if (cep.length !== 8) {
      return NextResponse.json({ error: "CEP inválido. Use 8 dígitos." }, { status: 400 });
    }

    const location = await lookupCep(cep);
    if (!location?.uf) {
      return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: body.items.map((i) => i.productId) } },
      select: { id: true, weight: true },
    });

    let totalWeight = 0;
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId);
      const w = product?.weight ?? 500;
      totalWeight += w * item.quantity;
    }

    const options = estimateShipping(location.uf, totalWeight);

    return NextResponse.json({
      uf: location.uf,
      city: location.localidade ?? "",
      cep,
      weightGrams: totalWeight,
      options,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao calcular frete" },
      { status: 400 }
    );
  }
}
