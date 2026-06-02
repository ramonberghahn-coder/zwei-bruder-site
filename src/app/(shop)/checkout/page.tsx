import Link from "next/link";

export default function CheckoutPage() {
  return (
    <div className="container page-y">
      <h1 className="text-2xl font-medium">Checkout</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600">
        Clique em <strong>Carrinho</strong> no topo da loja, revise os itens e use
        &quot;Finalizar pedido&quot; para gerar o PIX e enviar pelo WhatsApp.
      </p>
      <Link href="/" className="btn btn-primary mt-6 inline-flex">
        Voltar à loja
      </Link>
    </div>
  );
}
