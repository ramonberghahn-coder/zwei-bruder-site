import { withBasePath } from "@/lib/base-path";

function resolveInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string" && input.startsWith("/")) {
    return withBasePath(input);
  }
  return input;
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(resolveInput(input), {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.headers || {}),
    },
  });
}

export async function readAdminError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // ignore
  }
  if (res.status === 401) {
    return "Sessão expirada ou inválida. Faça login novamente no painel.";
  }
  return `Erro ${res.status}: falha na requisição.`;
}
