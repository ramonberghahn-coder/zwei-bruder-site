import Link from "next/link";
import OrderCard from "@/components/admin/order-card";
import {
  countOrdersByFilter,
  ORDER_FILTERS,
  orderMatchesFilter,
  parseOrderFilter,
} from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro: filtroParam } = await searchParams;
  const filtro = parseOrderFilter(filtroParam);

  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  try {
    orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    orders = [];
  }

  const visible = orders.filter((o) => orderMatchesFilter(o.status, filtro));

  return (
    <div className="container admin-page">
      <h1 className="text-2xl font-medium">Pedidos</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Confirme o pagamento após conferir o comprovante no WhatsApp. O pedido será liberado
        para entrega ou retirada conforme a forma escolhida pelo cliente.
      </p>

      {orders.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {ORDER_FILTERS.map((f) => {
            const count = countOrdersByFilter(orders, f.id);
            const active = filtro === f.id;
            return (
              <Link
                key={f.id}
                href={f.id === "todos" ? "/admin/pedidos" : `/admin/pedidos?filtro=${f.id}`}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  active
                    ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 ${active ? "text-neutral-700" : "text-neutral-400"}`}>
                  ({count})
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhum pedido ainda.</p>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhum pedido neste filtro.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {visible.map((order) => (
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
