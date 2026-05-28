import SettingsForm from "@/components/admin/settings-form";
import { getSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-medium">Configurações</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
