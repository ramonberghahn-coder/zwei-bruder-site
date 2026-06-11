export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixa caminhos internos com o basePath (ex.: /loja). */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  if (!BASE_PATH) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}

/** URL absoluta do site (NEXT_PUBLIC_SITE_URL + basePath + path). */
export function siteUrl(path = ""): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!path) return origin || withBasePath("/");
  return `${origin}${withBasePath(path)}`;
}
