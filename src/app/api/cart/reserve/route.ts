import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildPixPayload } from "@/lib/pix";
import { generateOrderNumber } from "@/lib/utils";

const reserveSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
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
      if (item.quantity > product.stock) throw new Error(`Estoque insuficiente para ${product.name}`);
      return { product, quantity: item.quantity };
    });

    const subtotal = itemRows.reduce((acc, row) => acc + row.product.price * row.quantity, 0);
    const orderNumber = generateOrderNumber();
    const settings = await getSettings();
    const pixPayload = buildPixPayload(settings, subtotal, orderNumber);

    const order = await prisma.$transaction(async (tx) => {
      for (const row of itemRows) {
        await tx.product.update({
          where: { id: row.product.id },
          data: { stock: { decrement: row.quantity } },
        });
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
            }))
          ),
          subtotal,
          total: subtotal,
          pixPayload,
        },
      });
    });

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao reservar pedido" },
      { status: 400 }
    );
  }
}
