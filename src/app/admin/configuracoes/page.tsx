import SettingsForm from "@/components/admin/settings-form";
import { getSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="container py-12">
      <p className="subtitle">Preferências</p>
      <h1 className="mt-2 text-5xl font-semibold">Configurações da loja</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
