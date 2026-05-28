import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { getSettings } from "@/lib/settings";
import Header from "@/components/store/header";
import Footer from "@/components/store/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.storeName} | ${settings.storeTagline}`,
    description: settings.aboutText || settings.storeTagline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Header storeName={settings.storeName} />
          <main>{children}</main>
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
