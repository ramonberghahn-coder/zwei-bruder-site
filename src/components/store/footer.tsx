import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-24 border-t border-neutral-200">
      <div className="container flex flex-col gap-6 py-10 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
        <p>{settings.storeName} — {settings.storeTagline}</p>
        <p>
          WhatsApp {settings.whatsappNumber} · {settings.contactEmail}
        </p>
      </div>
    </footer>
  );
}
