export type ShippingOption = {
  service: string;
  label: string;
  price: number;
  days: number;
};

const UF_REGION: Record<string, string> = {
  AC: "norte", AP: "norte", AM: "norte", PA: "norte", RO: "norte", RR: "norte", TO: "norte",
  AL: "nordeste", BA: "nordeste", CE: "nordeste", MA: "nordeste", PB: "nordeste",
  PE: "nordeste", PI: "nordeste", RN: "nordeste", SE: "nordeste",
  DF: "centro_oeste", GO: "centro_oeste", MT: "centro_oeste", MS: "centro_oeste",
  ES: "sudeste", MG: "sudeste", RJ: "sudeste", SP: "sudeste",
  PR: "sul", RS: "sul", SC: "sul",
};

// Estimativa estilo PAC/SEDEX a partir de origem no Sul/Sudeste.
// Valores aproximados — a confirmação final é feita no WhatsApp.
const TABLE: Record<string, { pac: number; sedex: number; pacDays: number; sedexDays: number }> = {
  sudeste: { pac: 22, sedex: 34, pacDays: 5, sedexDays: 2 },
  sul: { pac: 24, sedex: 36, pacDays: 6, sedexDays: 3 },
  centro_oeste: { pac: 30, sedex: 46, pacDays: 8, sedexDays: 4 },
  nordeste: { pac: 34, sedex: 52, pacDays: 10, sedexDays: 5 },
  norte: { pac: 42, sedex: 64, pacDays: 12, sedexDays: 6 },
};

export function regionForUf(uf: string): string {
  return UF_REGION[uf?.toUpperCase()] ?? "sudeste";
}

export function estimateShipping(uf: string, weightGrams: number): ShippingOption[] {
  const region = regionForUf(uf);
  const base = TABLE[region] ?? TABLE.sudeste;

  const kg = Math.max(1, Math.ceil((weightGrams || 0) / 1000));
  const extraKg = Math.max(0, kg - 1);

  const pacPrice = base.pac + extraKg * 8;
  const sedexPrice = base.sedex + extraKg * 12;

  return [
    {
      service: "PAC",
      label: "PAC (Correios)",
      price: Math.round(pacPrice * 100) / 100,
      days: base.pacDays,
    },
    {
      service: "SEDEX",
      label: "SEDEX (Correios)",
      price: Math.round(sedexPrice * 100) / 100,
      days: base.sedexDays,
    },
  ];
}

export function onlyDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

export type ViaCepResult = {
  uf?: string;
  localidade?: string;
  erro?: boolean;
};

export async function lookupCep(cep: string): Promise<ViaCepResult | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ViaCepResult;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}
