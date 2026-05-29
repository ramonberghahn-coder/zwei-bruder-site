import Link from "next/link";
import SocialLinks from "./social-links";
import type { StoreSettings } from "@/lib/settings";
import { formatWhatsAppDisplay, whatsappUrl } from "@/lib/social";

export default function Footer({ settings }: { settings: StoreSettings }) {
  const wa = whatsappUrl(settings.whatsappNumber);

  return (
    <footer id="contato" className="mt-20 border-t border-neutral-200 bg-neutral-50">
      <div className="container py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-3xl font-medium">{settings.storeName}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
              {settings.aboutText ||
                "Facas e acessórios em couro de alta qualidade. Cada peça é pensada para durar, com design limpo e materiais selecionados."}
            </p>
          </div>

          <div>
            <p className="footer-heading">Navegação</p>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600">
              <li>
                <Link href="/#produtos" className="hover:text-black">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-black">
                  Área do lojista
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer-heading">Encontre-nos</p>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
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
              <p>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-black">
                  WhatsApp {formatWhatsAppDisplay(settings.whatsappNumber)}
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
