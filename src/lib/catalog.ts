// Catálogo: 20 selecciones × 2 equipaciones × 4 tallas.
// El stock inicial se genera con un hash determinístico, para que las
// cifras coincidan con lo que Julian aprobó en el prototipo de diseño.

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

// Agrupación por continente para la navegación de la pestaña "País".
// El orden es el pedido por el negocio; los continentes sin selecciones
// todavía se muestran como "Próximamente".
export interface Continent {
  id: string;
  name: string;
  teamIds: string[];
}

export const CONTINENTS: Continent[] = [
  { id: 'suramerica', name: 'Suramérica', teamIds: ['ar', 'br', 'co', 'uy'] },
  { id: 'centroamerica', name: 'Centroamérica', teamIds: [] },
  { id: 'norteamerica', name: 'Norteamérica', teamIds: ['us', 'mx'] },
  { id: 'europa', name: 'Europa', teamIds: ['de', 'be', 'hr', 'es', 'fr', 'en', 'it', 'nl', 'pt', 'se'] },
  { id: 'africa', name: 'África', teamIds: ['cm', 'ng'] },
  { id: 'asia', name: 'Asia', teamIds: ['jp', 'kr'] },
  { id: 'oceania', name: 'Oceanía', teamIds: [] },
];

/** Selecciones de un continente, ordenadas alfabéticamente (español). */
export function teamsByContinent(continentId: string): Team[] {
  const continent = CONTINENTS.find((c) => c.id === continentId);
  if (!continent) return [];
  return continent.teamIds
    .map((id) => TEAMS.find((t) => t.id === id))
    .filter((t): t is Team => !!t)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

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
