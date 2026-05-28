import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [products, orders] = await Promise.all([prisma.product.count(), prisma.order.count()]);

  return (
    <div className="container py-12">
      <p className="subtitle">Painel</p>
      <h1 className="mt-2 text-5xl font-semibold">Administração da loja</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm uppercase tracking-wider text-neutral-600">Produtos cadastrados</p>
          <p className="mt-2 text-4xl font-semibold">{products}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm uppercase tracking-wider text-neutral-600">Pedidos</p>
          <p className="mt-2 text-4xl font-semibold">{orders}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/produtos" className="btn btn-primary">
          Gerenciar produtos
        </Link>
        <Link href="/admin/pedidos" className="btn btn-secondary">
          Ver pedidos
        </Link>
        <Link href="/admin/configuracoes" className="btn btn-secondary">
          Configurações da loja
        </Link>
      </div>
    </div>
  );
}
