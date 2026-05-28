import { getSettings } from "@/lib/settings";
import Header from "@/components/store/header";
import Footer from "@/components/store/footer";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <Header storeName={settings.storeName} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
