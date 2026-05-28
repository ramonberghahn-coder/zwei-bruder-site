import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-20 border-t" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="container grid gap-8 py-14 md:grid-cols-3">
        <div>
          <h3 className="text-2xl font-semibold">{settings.storeName}</h3>
          <p className="mt-3 text-sm text-neutral-600">{settings.storeTagline}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold uppercase tracking-wider">Contato</h4>
          <p className="mt-3 text-sm text-neutral-600">WhatsApp: {settings.whatsappNumber}</p>
          <p className="text-sm text-neutral-600">Email: {settings.contactEmail}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold uppercase tracking-wider">Sobre</h4>
          <p className="mt-3 text-sm text-neutral-600">{settings.aboutText}</p>
        </div>
      </div>
    </footer>
  );
}
