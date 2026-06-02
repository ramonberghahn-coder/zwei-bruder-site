import SocialLinks from "./social-links";
import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer id="contato" className="mt-20 border-t border-[color:var(--border)] bg-[#f7f4f0]">
      <div className="container py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-display text-3xl font-medium">{settings.storeName}</p>
            <p className="mt-3 max-w-md whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {settings.aboutText?.trim() ||
                "Facas e acessórios em couro de alta qualidade. Cada peça é pensada para durar, com design limpo e materiais selecionados."}
            </p>
          </div>

          <div className="md:text-right">
            <p className="footer-heading">Encontre-nos</p>
            <div className="mt-4 space-y-3 text-sm text-neutral-600 md:flex md:flex-col md:items-end">
              <SocialLinks
                instagram={settings.instagram}
                whatsappNumber={settings.whatsappNumber}
                showLabels
                iconClassName="h-4 w-4"
              />
              <p>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-black">
                  {settings.contactEmail}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 text-center text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
