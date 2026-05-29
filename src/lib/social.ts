export function whatsappUrl(number: string, text?: string): string {
  let digits = (number || "").replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return "#";
  if (
    !(digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) &&
    (digits.length === 10 || digits.length === 11)
  ) {
    digits = `55${digits}`;
  }
  const base = `https://wa.me/${digits}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function instagramUrl(handle: string): string | null {
  const trimmed = handle.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const user = trimmed.replace(/^@/, "").replace(/\//g, "");
  if (!user) return null;
  return `https://instagram.com/${user}`;
}

export function formatWhatsAppDisplay(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 10) return number;
  if (digits.startsWith("55") && digits.length >= 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return number;
}
