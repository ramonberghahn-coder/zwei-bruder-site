import { storeSettingsDefaults } from "@/lib/settings";
import Header from "@/components/store/header";
import Footer from "@/components/store/footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = storeSettingsDefaults;

  return (
    <>
      <Header storeName={settings.storeName} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
