import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container py-12">
      <p className="subtitle">Operação</p>
      <h1 className="mt-2 text-5xl font-semibold">Pedidos</h1>
      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
              <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-wider text-neutral-600">
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              {order.customerName} · {order.customerPhone}
            </p>
            <p className="mt-2 text-base font-semibold">Total: {formatCurrency(order.total)}</p>
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
