import Link from "next/link";
import { computeDashboardStats } from "@/lib/dashboard-stats";
import { getOrderStatusBadgeClass, getOrderStatusLabel } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let products = 0;
  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];

  try {
    [products, orders] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
  } catch {
    // banco ainda não configurado
  }

  const stats = computeDashboardStats(orders);
  const recent = orders.slice(0, 8);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Resumo de pedidos e vendas da loja.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Vendas confirmadas</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(stats.confirmedSalesTotal)}</p>
          <p className="mt-1 text-xs text-neutral-500">
            Pagamento confirmado (liberados + concluídos)
          </p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs uppercase tracking-wider text-amber-800">Aguardando pagamento</p>
          <p className="mt-2 text-2xl font-semibold text-amber-900">
            {stats.awaitingPaymentCount}
          </p>
          <p className="mt-1 text-xs text-amber-800">
            {formatCurrency(stats.awaitingPaymentTotal)} em aberto
          </p>
        </div>
        <div className="rounded-md border border-green-200 bg-green-50 p-5">
          <p className="text-xs uppercase tracking-wider text-green-800">Liberados</p>
          <p className="mt-2 text-2xl font-semibold text-green-900">{stats.readyCount}</p>
          <p className="mt-1 text-xs text-green-800">{formatCurrency(stats.readyTotal)}</p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-600">Concluídos</p>
          <p className="mt-2 text-2xl font-semibold">{stats.completedCount}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {formatCurrency(stats.completedSalesTotal)} finalizados
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-neutral-200 p-5">
          <p className="text-sm text-neutral-500">Total de pedidos</p>
          <p className="mt-1 text-3xl font-medium">{stats.totalOrders}</p>
        </div>
        <div className="rounded-md border border-neutral-200 p-5">
          <p className="text-sm text-neutral-500">Produtos ativos</p>
          <p className="mt-1 text-3xl font-medium">{products}</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Pedidos recentes</h2>
          <Link href="/admin/pedidos" className="text-sm text-blue-600 hover:underline">
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Nenhum pedido ainda.</p>
        ) : (
          <div className="mt-4 overflow-auto border border-neutral-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 text-left uppercase tracking-wider text-neutral-600">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id} className="border-t border-neutral-200">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <span className="block">{order.customerName}</span>
                      <span className="text-xs text-neutral-500">{order.customerPhone}</span>
                    </td>
                    <td className="px-4 py-3">
                      {order.deliveryMethod === "pickup" ? "Retirada" : "Envio"}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-medium leading-snug ${getOrderStatusBadgeClass(order.status)}`}
                      >
                        {getOrderStatusLabel(order.status, order.deliveryMethod)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
