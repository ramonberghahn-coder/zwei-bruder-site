import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth-admin";
import { assertDatabase, prismaErrorMessage } from "@/lib/db-errors";
import {
  canConfirmPayment,
  canMarkComplete,
  statusAfterComplete,
  statusAfterPaymentConfirm,
} from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderId: z.string().min(1),
  action: z.enum(["confirm_payment", "complete"]),
});

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    await assertDatabase();
    const body = schema.parse(await req.json());
    const order = await prisma.order.findUnique({ where: { id: body.orderId } });
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    let newStatus: string;
    if (body.action === "confirm_payment") {
      if (!canConfirmPayment(order.status)) {
        return NextResponse.json(
          { error: "Este pedido já teve o pagamento confirmado." },
          { status: 400 }
        );
      }
      newStatus = statusAfterPaymentConfirm(order.deliveryMethod);
    } else {
      if (!canMarkComplete(order.status)) {
        return NextResponse.json(
          { error: "Confirme o pagamento antes de marcar como concluído." },
          { status: 400 }
        );
      }
      newStatus = statusAfterComplete(order.deliveryMethod);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
    });

    revalidatePath("/admin/pedidos");
    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: prismaErrorMessage(error) }, { status: 400 });
  }
}
