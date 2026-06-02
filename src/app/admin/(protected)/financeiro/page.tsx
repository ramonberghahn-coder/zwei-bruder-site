import { computeProfitStats } from "@/lib/dashboard-stats";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  let productRows: { id: string; price: number; costPrice: number; stock: number }[] = [];
  let orders: { status: string; items: string }[] = [];

  try {
    [productRows, orders] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, price: true, costPrice: true, stock: true },
      }),
      prisma.order.findMany({
        select: { status: true, items: true },
      }),
    ]);
  } catch {
    // banco ainda não configurado
  }

  const profit = computeProfitStats(orders, productRows);
  const stockCostValue = productRows.reduce(
    (sum, p) => sum + (p.stock > 0 ? p.costPrice * p.stock : 0),
    0
  );

  return (
    <div className="container admin-page">
      <h1 className="text-2xl font-medium">Financeiro</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Lucro e projeções com base no preço de custo cadastrado em cada produto.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs uppercase tracking-wider text-emerald-800">Lucro realizado</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">
            {formatCurrency(profit.realizedProfit)}
          </p>
          <p className="mt-1 text-xs text-emerald-800">
            Margem dos produtos em vendas confirmadas (liberados + concluídos)
          </p>
        </div>
        <div className="rounded-md border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs uppercase tracking-wider text-blue-800">Projeção de lucro</p>
          <p className="mt-2 text-2xl font-semibold text-blue-900">
            {formatCurrency(profit.projectedProfit)}
          </p>
          <p className="mt-1 text-xs text-blue-800">
            Se todo o estoque atual for vendido ao preço de venda cadastrado
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Unidades em estoque</p>
          <p className="mt-2 text-2xl font-semibold">{profit.stockUnits}</p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Valor de venda (estoque)</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(profit.stockRetailValue)}</p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Custo do estoque</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(stockCostValue)}</p>
          <p className="mt-1 text-xs text-neutral-500">Soma do custo × quantidade em estoque</p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-600">Margem projetada</p>
          <p className="mt-2 text-2xl font-semibold">
            {profit.stockRetailValue > 0
              ? `${Math.round((profit.projectedProfit / profit.stockRetailValue) * 100)}%`
              : "—"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">Lucro projetado ÷ valor de venda do estoque</p>
        </div>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Cadastre o preço de custo em cada produto (aba Produtos) para os valores refletirem a
        realidade. Pedidos novos guardam o custo no momento da compra.
      </p>
    </div>
  );
}
