import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildPixPayload, generatePixQrDataUrl } from "@/lib/pix";
import { generateOrderNumber } from "@/lib/utils";

// Neon (pooler) pode derrubar a sessão WebSocket ("Connection terminated
// unexpectedly"). Reexecuta operações que falham por motivos transitórios.
async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : "";
      const transient =
        /terminated unexpectedly|connection|econnreset|fetch failed|socket hang up|timeout/i.test(
          msg
        );
      if (!transient || attempt === tries - 1) throw error;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}

const reserveSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  shippingCost: z.coerce.number().min(0).optional(),
  shippingService: z.string().optional(),
  shippingCep: z.string().optional(),
  deliveryMethod: z.enum(["shipping", "pickup"]).optional(),
  engraving: z
    .object({
      sides: z.coerce.number().int().min(1).max(2),
      text: z.string().optional(),
    })
    .optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = reserveSchema.parse(await req.json());
    if (body.items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const products = await withRetry(() =>
      prisma.product.findMany({
        where: { id: { in: body.items.map((i) => i.productId) }, active: true },
      })
    );

    const itemRows = body.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Produto inválido");
      const available = Math.max(0, product.stock);
      const waitlistQty = Math.max(0, item.quantity - available);
      const decrementQty = Math.min(item.quantity, available);
      return { product, quantity: item.quantity, waitlistQty, decrementQty };
    });

    const hasWaitlist = itemRows.some((row) => row.waitlistQty > 0);
    const subtotal = itemRows.reduce((acc, row) => acc + row.product.price * row.quantity, 0);
    const orderNumber = generateOrderNumber();
    const settings = await getSettings();

    const isPickup =
      body.deliveryMethod === "pickup" && settings.pickupEnabled === "true";
    const shippingCost = isPickup ? 0 : Math.max(0, body.shippingCost ?? 0);
    const shippingService = isPickup ? "Retirada" : body.shippingService;

    let engravingCost = 0;
    let engravingInfo: string | null = null;
    if (settings.engravingEnabled === "true" && body.engraving) {
      const sides = body.engraving.sides === 2 ? 2 : 1;
      engravingCost =
        sides === 2
          ? Number(settings.engravingPrice2) || 0
          : Number(settings.engravingPrice1) || 0;
      const text = (body.engraving.text || "").trim();
      engravingInfo = `Gravação ${sides} lado${sides > 1 ? "s" : ""}${
        text ? ` — "${text}"` : ""
      }`;
    }

    const total = subtotal + shippingCost + engravingCost;
    const customQr = (settings.pixQrImage || "").trim();

    // Prioriza o PIX dinâmico (com o valor do pedido embutido).
    // Usa o QR enviado no painel apenas como backup, caso a geração falhe.
    let pixPayload = "";
    let useDynamicQr = false;
    try {
      pixPayload = buildPixPayload(settings, total, orderNumber);
      useDynamicQr = true;
    } catch (pixError) {
      if (!customQr) throw pixError;
      pixPayload = (settings.pixCopyPaste || "").trim();
    }

    // Sem transação interativa: o adaptador Neon roteia estas queries por HTTP
    // (poolQueryViaFetch), evitando a sessão WebSocket que cai no Render free.
    // Cria o pedido primeiro; se um decremento de estoque falhar, o pedido
    // continua registrado para o admin reconciliar.
    const order = await withRetry(() =>
      prisma.order.create({
        data: {
          orderNumber,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerEmail: body.customerEmail,
          address: body.address,
          notes: body.notes,
          items: JSON.stringify(
            itemRows.map((row) => ({
              productId: row.product.id,
              name: row.product.name,
              price: row.product.price,
              quantity: row.quantity,
              waitlistQty: row.waitlistQty,
            }))
          ),
          subtotal,
          shippingCost,
          shippingService,
          shippingCep: body.shippingCep,
          deliveryMethod: isPickup ? "pickup" : "shipping",
          engravingCost,
          engravingInfo,
          total,
          status: hasWaitlist ? "waitlist" : "reserved",
          pixPayload,
        },
      })
    );

    for (const row of itemRows) {
      if (row.decrementQty > 0) {
        await withRetry(() =>
          prisma.product.update({
            where: { id: row.product.id },
            data: { stock: { decrement: row.decrementQty } },
          })
        );
      }
    }

    const qrDataUrl = useDynamicQr
      ? await generatePixQrDataUrl(pixPayload)
      : customQr;

    return NextResponse.json({
      orderNumber: order.orderNumber,
      pixPayload,
      qrDataUrl,
      total,
      subtotal,
      shippingCost,
      engravingCost,
      hasWaitlist,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao reservar pedido" },
      { status: 400 }
    );
  }
}
