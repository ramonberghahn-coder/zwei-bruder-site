import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppMessage, getWhatsAppWebUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    const settings = await getSettings();
    const items = JSON.parse(order.items) as Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      waitlistQty?: number;
    }>;

    const message = buildWhatsAppMessage({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        waitlistQty: i.waitlistQty ?? 0,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      shippingService: order.shippingService,
      shippingCep: order.shippingCep,
      deliveryMethod: order.deliveryMethod,
      engravingCost: order.engravingCost,
      engravingInfo: order.engravingInfo,
      total: order.total,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    });

    const whatsappUrl = getWhatsAppWebUrl(settings.whatsappNumber, message);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid_waiting_confirmation",
        whatsappSent: true,
      },
    });

    return NextResponse.json({ whatsappUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao abrir WhatsApp" },
      { status: 400 }
    );
  }
}
