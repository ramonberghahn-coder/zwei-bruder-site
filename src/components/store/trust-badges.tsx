const badges = [
  { title: "Atendimento direto", text: "Pedidos e dúvidas pelo WhatsApp" },
  { title: "Pagamento PIX", text: "Reserva com QR Code na hora" },
  { title: "Materiais premium", text: "Aço e couro selecionados" },
  { title: "Produção artesanal", text: "Peças feitas para durar" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-neutral-200 bg-white">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((b) => (
          <div key={b.title} className="text-center lg:text-left">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em]">{b.title}</p>
            <p className="mt-2 text-sm text-neutral-600">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
