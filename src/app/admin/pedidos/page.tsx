import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold">Pedidos</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{order.orderNumber}</h2>
              <span className="text-sm text-neutral-600">{order.status}</span>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              {order.customerName} · {order.customerPhone}
            </p>
            <p className="mt-1 text-sm">Total: {formatCurrency(order.total)}</p>
            {order.paymentProofUrl ? (
              <a href={order.paymentProofUrl} target="_blank" className="mt-2 inline-block text-sm text-blue-600">
                Ver comprovante
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
