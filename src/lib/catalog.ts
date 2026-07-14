// Catálogo dummy de la v1: 20 selecciones × 2 equipaciones × 4 tallas.
// El stock inicial se genera con el mismo hash determinístico del prototipo
// de diseño, para que las cifras coincidan con lo que Julian aprobó.

export type KitId = 'local' | 'visitante';

export interface Team {
  id: string;
  name: string;
  era: string;
  price: number; // USD, precios en dólares enteros según el design system
}

export const SIZES = ['S', 'M', 'L', 'XL'] as const;
export type Size = (typeof SIZES)[number];

export const KITS: { id: KitId; label: string }[] = [
  { id: 'local', label: 'Local' },
  { id: 'visitante', label: 'Visitante' },
];

const ERAS = ['80s', '90s', '00s'];

const TEAM_NAMES: { id: string; name: string }[] = [
  { id: 'ar', name: 'Argentina' },
  { id: 'br', name: 'Brasil' },
  { id: 'de', name: 'Alemania' },
  { id: 'it', name: 'Italia' },
  { id: 'fr', name: 'Francia' },
  { id: 'es', name: 'España' },
  { id: 'en', name: 'Inglaterra' },
  { id: 'nl', name: 'Países Bajos' },
  { id: 'pt', name: 'Portugal' },
  { id: 'uy', name: 'Uruguay' },
  { id: 'co', name: 'Colombia' },
  { id: 'mx', name: 'México' },
  { id: 'hr', name: 'Croacia' },
  { id: 'be', name: 'Bélgica' },
  { id: 'se', name: 'Suecia' },
  { id: 'cm', name: 'Camerún' },
  { id: 'ng', name: 'Nigeria' },
  { id: 'jp', name: 'Japón' },
  { id: 'kr', name: 'Corea del Sur' },
  { id: 'us', name: 'Estados Unidos' },
];

export const TEAMS: Team[] = TEAM_NAMES.map((t, i) => ({
  ...t,
  era: ERAS[i % 3],
  price: 45,
}));

export const RESERVATION_MS = 30 * 60 * 1000;

export function variantKey(teamId: string, kit: KitId, size: Size): string {
  return `${teamId}_${kit}_${size}`;
}

function seeded(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function initialStockFor(teamId: string, kit: KitId, size: Size): number {
  return seeded(teamId + kit + size) % 7;
}

export function seedStock(): Record<string, number> {
  const stock: Record<string, number> = {};
  for (const t of TEAMS) {
    for (const k of KITS) {
      for (const s of SIZES) {
        stock[variantKey(t.id, k.id, s)] = initialStockFor(t.id, k.id, s);
      }
    }
  }
  return stock;
}

export function orderNumberFor(seed: string): string {
  return 'RN-2026-' + String(1000 + (seeded(seed) % 9000));
}
