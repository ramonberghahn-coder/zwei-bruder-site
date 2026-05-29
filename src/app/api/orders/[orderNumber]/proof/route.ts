import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppMessage, getWhatsAppWebUrl } from "@/lib/whatsapp";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    const formData = await req.formData();
    const proof = formData.get("proof");
    if (!(proof instanceof File)) {
      return NextResponse.json({ error: "Comprovante inválido" }, { status: 400 });
    }

    const ext = proof.name.includes(".") ? proof.name.split(".").pop() : "png";
    const safeFilename = `${order.orderNumber}-${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await proof.arrayBuffer());
    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, buffer);

    const paymentProofUrl = `/uploads/${safeFilename}`;
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
      total: order.total,
      paymentProofUrl,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    });

    const whatsappUrl = getWhatsAppWebUrl(settings.whatsappNumber, message);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProofUrl,
        status: "paid_waiting_confirmation",
        whatsappSent: true,
      },
    });

    return NextResponse.json({ whatsappUrl, paymentProofUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao enviar comprovante" },
      { status: 400 }
    );
  }
}
