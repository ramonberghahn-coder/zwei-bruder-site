import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildPixPayload, generatePixQrDataUrl } from "@/lib/pix";
import { generateOrderNumber } from "@/lib/utils";

const reserveSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  shippingCost: z.coerce.number().min(0).optional(),
  shippingService: z.string().optional(),
  shippingCep: z.string().optional(),
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

    const products = await prisma.product.findMany({
      where: { id: { in: body.items.map((i) => i.productId) }, active: true },
    });

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
    const shippingCost = Math.max(0, body.shippingCost ?? 0);
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();
    const settings = await getSettings();
    const customQr = (settings.pixQrImage || "").trim();
    const pixPayload = customQr
      ? (settings.pixCopyPaste || "").trim()
      : buildPixPayload(settings, total, orderNumber);

    const order = await prisma.$transaction(async (tx) => {
      for (const row of itemRows) {
        if (row.decrementQty > 0) {
          await tx.product.update({
            where: { id: row.product.id },
            data: { stock: { decrement: row.decrementQty } },
          });
        }
      }

      return tx.order.create({
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
          shippingService: body.shippingService,
          shippingCep: body.shippingCep,
          total,
          status: hasWaitlist ? "waitlist" : "reserved",
          pixPayload,
        },
      });
    });

    const qrDataUrl = customQr
      ? customQr
      : await generatePixQrDataUrl(pixPayload);

    return NextResponse.json({
      orderNumber: order.orderNumber,
      pixPayload,
      qrDataUrl,
      total,
      subtotal,
      shippingCost,
      hasWaitlist,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao reservar pedido" },
      { status: 400 }
    );
  }
}
