import Link from "next/link";
import CheckoutActions from "@/components/store/checkout-actions";
import { prisma } from "@/lib/prisma";
import { generatePixQrDataUrl } from "@/lib/pix";

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  let order = null;
  let qrDataUrl: string | null = null;

  try {
    order = await prisma.order.findUnique({ where: { orderNumber } });
    if (order?.pixPayload) {
      qrDataUrl = await generatePixQrDataUrl(order.pixPayload);
    }
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <div className="container py-16">
        <h1 className="text-2xl font-medium">Pedido não encontrado</h1>
        <Link href="/" className="btn btn-primary mt-4 inline-flex">
          Voltar para loja
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-2xl font-medium">Pedido {order.orderNumber}</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Pague via PIX, envie o comprovante e confirme no WhatsApp.
      </p>
      <CheckoutActions
        orderNumber={order.orderNumber}
        pixPayload={order.pixPayload || ""}
        qrDataUrl={qrDataUrl || ""}
      />
    </div>
  );
}
