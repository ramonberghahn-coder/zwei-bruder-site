import OrderCard from "@/components/admin/order-card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  try {
    orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    orders = [];
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-medium">Pedidos</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Confirme o pagamento após conferir o comprovante no WhatsApp. O pedido será liberado
        para entrega ou retirada conforme a forma escolhida pelo cliente.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhum pedido ainda.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={{
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                deliveryMethod: order.deliveryMethod,
                shippingService: order.shippingService,
                engravingInfo: order.engravingInfo,
                total: order.total,
                paymentProofUrl: order.paymentProofUrl,
                whatsappSent: order.whatsappSent,
                createdAt: order.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
