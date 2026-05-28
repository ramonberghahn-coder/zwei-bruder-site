import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-16 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="container grid gap-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="font-semibold">{settings.storeName}</h3>
          <p className="mt-2 text-sm text-neutral-600">{settings.storeTagline}</p>
        </div>
        <div>
          <h4 className="font-medium">Contato</h4>
          <p className="mt-2 text-sm text-neutral-600">WhatsApp: {settings.whatsappNumber}</p>
          <p className="text-sm text-neutral-600">Email: {settings.contactEmail}</p>
        </div>
        <div>
          <h4 className="font-medium">Sobre</h4>
          <p className="mt-2 text-sm text-neutral-600">{settings.aboutText}</p>
        </div>
      </div>
    </footer>
  );
}
