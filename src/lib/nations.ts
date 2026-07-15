// Datos visuales por selección: paleta de la bandera (para el fondo con
// franjas tenues del catálogo) y colores de kit local/visitante (para las
// ilustraciones SVG de camiseta). Colores aproximados de referencia — no
// pretenden ser oficiales, solo dar identidad a cada país mientras llegan
// las fotos reales del inventario.

import type { KitId } from './catalog';

export type JerseyPattern = 'solid' | 'stripes' | 'sash' | 'halves' | 'hoops';

export interface KitColors {
  body: string; // color principal de la camiseta
  accent: string; // mangas / cuello / detalle
  pattern: JerseyPattern;
  patternColor?: string; // color de rayas/banda si aplica (por defecto accent)
}

export interface NationVisual {
  flag: string[]; // colores de la bandera, para el gradiente de fondo
  home: KitColors;
  away: KitColors;
}

export const NATIONS: Record<string, NationVisual> = {
  ar: {
    flag: ['#6CACE4', '#FFFFFF', '#F6B40E'],
    home: { body: '#75AADB', accent: '#FFFFFF', pattern: 'stripes', patternColor: '#FFFFFF' },
    away: { body: '#1A2A4F', accent: '#75AADB', pattern: 'solid' },
  },
  br: {
    flag: ['#009C3B', '#FFDF00', '#002776'],
    home: { body: '#FFDF00', accent: '#009C3B', pattern: 'solid' },
    away: { body: '#002776', accent: '#FFDF00', pattern: 'solid' },
  },
  de: {
    flag: ['#000000', '#DD0000', '#FFCE00'],
    home: { body: '#FFFFFF', accent: '#1B1B1B', pattern: 'solid' },
    away: { body: '#1B1B1B', accent: '#DD0000', pattern: 'sash', patternColor: '#DD0000' },
  },
  it: {
    flag: ['#008C45', '#FFFFFF', '#CD212A'],
    home: { body: '#1C4587', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#1C4587', pattern: 'solid' },
  },
  fr: {
    flag: ['#0055A4', '#FFFFFF', '#EF4135'],
    home: { body: '#1E3A8A', accent: '#EF4135', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#1E3A8A', pattern: 'sash', patternColor: '#EF4135' },
  },
  es: {
    flag: ['#AA151B', '#F1BF00', '#AA151B'],
    home: { body: '#C60B1E', accent: '#F1BF00', pattern: 'solid' },
    away: { body: '#1B1B3A', accent: '#F1BF00', pattern: 'solid' },
  },
  en: {
    flag: ['#FFFFFF', '#CF142B', '#FFFFFF'],
    home: { body: '#FFFFFF', accent: '#CF142B', pattern: 'solid' },
    away: { body: '#B01030', accent: '#FFFFFF', pattern: 'solid' },
  },
  nl: {
    flag: ['#AE1C28', '#FFFFFF', '#21468B'],
    home: { body: '#EA7200', accent: '#1B1B1B', pattern: 'solid' },
    away: { body: '#21468B', accent: '#EA7200', pattern: 'solid' },
  },
  pt: {
    flag: ['#046A38', '#DA291C', '#FFE900'],
    home: { body: '#B01020', accent: '#046A38', pattern: 'sash', patternColor: '#046A38' },
    away: { body: '#FFFFFF', accent: '#B01020', pattern: 'solid' },
  },
  uy: {
    flag: ['#6CADDF', '#FFFFFF', '#F6B40E'],
    home: { body: '#5CA2D6', accent: '#1B1B1B', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#5CA2D6', pattern: 'solid' },
  },
  co: {
    flag: ['#FCD116', '#003893', '#CE1126'],
    home: { body: '#FCD116', accent: '#003893', pattern: 'solid' },
    away: { body: '#CE1126', accent: '#FCD116', pattern: 'solid' },
  },
  mx: {
    flag: ['#006847', '#FFFFFF', '#CE1126'],
    home: { body: '#0A6B3B', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#1B1B1B', accent: '#0A6B3B', pattern: 'solid' },
  },
  hr: {
    flag: ['#FF0000', '#FFFFFF', '#171796'],
    home: { body: '#FFFFFF', accent: '#E01020', pattern: 'hoops', patternColor: '#E01020' },
    away: { body: '#171796', accent: '#FFFFFF', pattern: 'solid' },
  },
  be: {
    flag: ['#000000', '#FAE042', '#ED2939'],
    home: { body: '#C8102E', accent: '#111111', pattern: 'solid' },
    away: { body: '#111111', accent: '#FAE042', pattern: 'solid' },
  },
  se: {
    flag: ['#006AA7', '#FECC00', '#006AA7'],
    home: { body: '#FECC00', accent: '#006AA7', pattern: 'solid' },
    away: { body: '#004B87', accent: '#FECC00', pattern: 'solid' },
  },
  cm: {
    flag: ['#007A5E', '#CE1126', '#FCD116'],
    home: { body: '#0A7A4F', accent: '#FCD116', pattern: 'solid' },
    away: { body: '#CE1126', accent: '#0A7A4F', pattern: 'solid' },
  },
  ng: {
    flag: ['#008751', '#FFFFFF', '#008751'],
    home: { body: '#0A8A55', accent: '#FFFFFF', pattern: 'halves', patternColor: '#0B6E45' },
    away: { body: '#FFFFFF', accent: '#0A8A55', pattern: 'solid' },
  },
  jp: {
    flag: ['#FFFFFF', '#BC002D', '#FFFFFF'],
    home: { body: '#1D2A6E', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#1D2A6E', pattern: 'solid' },
  },
  kr: {
    flag: ['#FFFFFF', '#CD2E3A', '#0047A0'],
    home: { body: '#C8102E', accent: '#0A2E6E', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#C8102E', pattern: 'solid' },
  },
  us: {
    flag: ['#3C3B6E', '#FFFFFF', '#B22234'],
    home: { body: '#FFFFFF', accent: '#1B2A6B', pattern: 'sash', patternColor: '#B22234' },
    away: { body: '#1B2A6B', accent: '#FFFFFF', pattern: 'solid' },
  },
  // Suramérica
  bo: {
    flag: ['#DA291C', '#F9E300', '#007A33'],
    home: { body: '#007A33', accent: '#F9E300', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#DA291C', pattern: 'solid' },
  },
  cl: {
    flag: ['#0032A0', '#FFFFFF', '#DA291C'],
    home: { body: '#D52B1E', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#0032A0', accent: '#FFFFFF', pattern: 'solid' },
  },
  ec: {
    flag: ['#FFD100', '#0072CE', '#EF3340'],
    home: { body: '#FFD100', accent: '#0072CE', pattern: 'solid' },
    away: { body: '#0A2A6B', accent: '#FFD100', pattern: 'solid' },
  },
  py: {
    flag: ['#D52B1E', '#FFFFFF', '#0038A8'],
    home: { body: '#FFFFFF', accent: '#D52B1E', pattern: 'stripes', patternColor: '#D52B1E' },
    away: { body: '#1A3A8F', accent: '#FFFFFF', pattern: 'solid' },
  },
  pe: {
    flag: ['#D91023', '#FFFFFF', '#D91023'],
    home: { body: '#FFFFFF', accent: '#D91023', pattern: 'sash', patternColor: '#D91023' },
    away: { body: '#D91023', accent: '#FFFFFF', pattern: 'solid' },
  },
  ve: {
    flag: ['#FFD100', '#00247D', '#CF142B'],
    home: { body: '#6E1423', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#6E1423', pattern: 'solid' },
  },
  // Centroamérica
  cr: {
    flag: ['#002B7F', '#FFFFFF', '#CE1126'],
    home: { body: '#CE1126', accent: '#002B7F', pattern: 'solid' },
    away: { body: '#002B7F', accent: '#FFFFFF', pattern: 'solid' },
  },
  sv: {
    flag: ['#0F47AF', '#FFFFFF', '#0F47AF'],
    home: { body: '#0F47AF', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#0F47AF', pattern: 'solid' },
  },
  gt: {
    flag: ['#4997D0', '#FFFFFF', '#4997D0'],
    home: { body: '#3D82C4', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#3D82C4', pattern: 'solid' },
  },
  pa: {
    flag: ['#D21034', '#FFFFFF', '#005293'],
    home: { body: '#D21034', accent: '#005293', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#D21034', pattern: 'solid' },
  },
  // Norteamérica
  ca: {
    flag: ['#FF0000', '#FFFFFF', '#FF0000'],
    home: { body: '#D80621', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#D80621', pattern: 'solid' },
  },
  // África
  eg: {
    flag: ['#CE1126', '#FFFFFF', '#000000'],
    home: { body: '#CE1126', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#CE1126', pattern: 'solid' },
  },
  ma: {
    flag: ['#C1272D', '#006233', '#C1272D'],
    home: { body: '#C1272D', accent: '#006233', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#C1272D', pattern: 'solid' },
  },
  za: {
    flag: ['#007749', '#FFB915', '#001489'],
    home: { body: '#007749', accent: '#FFB915', pattern: 'solid' },
    away: { body: '#FFB915', accent: '#007749', pattern: 'solid' },
  },
  sn: {
    flag: ['#00853F', '#FDEF42', '#E31B23'],
    home: { body: '#FFFFFF', accent: '#00853F', pattern: 'solid' },
    away: { body: '#00853F', accent: '#FDEF42', pattern: 'solid' },
  },
  dz: {
    flag: ['#006233', '#FFFFFF', '#D21034'],
    home: { body: '#FFFFFF', accent: '#006233', pattern: 'solid' },
    away: { body: '#006233', accent: '#FFFFFF', pattern: 'solid' },
  },
  gh: {
    flag: ['#CE1126', '#FCD116', '#006B3F'],
    home: { body: '#FFFFFF', accent: '#CE1126', pattern: 'solid' },
    away: { body: '#111111', accent: '#FCD116', pattern: 'solid' },
  },
  // Asia
  ir: {
    flag: ['#239F40', '#FFFFFF', '#DA0000'],
    home: { body: '#FFFFFF', accent: '#239F40', pattern: 'solid' },
    away: { body: '#D7141A', accent: '#FFFFFF', pattern: 'solid' },
  },
  qa: {
    flag: ['#8A1538', '#FFFFFF', '#8A1538'],
    home: { body: '#8A1538', accent: '#FFFFFF', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#8A1538', pattern: 'solid' },
  },
  cn: {
    flag: ['#DE2910', '#FFDE00', '#DE2910'],
    home: { body: '#DE2910', accent: '#FFDE00', pattern: 'solid' },
    away: { body: '#FFFFFF', accent: '#DE2910', pattern: 'solid' },
  },
  jo: {
    flag: ['#000000', '#FFFFFF', '#007A3D'],
    home: { body: '#FFFFFF', accent: '#CE1126', pattern: 'solid' },
    away: { body: '#007A3D', accent: '#FFFFFF', pattern: 'solid' },
  },
  // Oceanía
  nz: {
    flag: ['#00247D', '#CC142B', '#FFFFFF'],
    home: { body: '#FFFFFF', accent: '#111111', pattern: 'solid' },
    away: { body: '#111111', accent: '#FFFFFF', pattern: 'solid' },
  },
  au: {
    flag: ['#00843D', '#FFCD00', '#012169'],
    home: { body: '#FFCD00', accent: '#00843D', pattern: 'solid' },
    away: { body: '#00843D', accent: '#FFCD00', pattern: 'solid' },
  },
};

const FALLBACK: NationVisual = {
  flag: ['#847f78', '#f3ede2', '#847f78'],
  home: { body: '#595651', accent: '#faf7f1', pattern: 'solid' },
  away: { body: '#faf7f1', accent: '#595651', pattern: 'solid' },
};

export function nationVisual(teamId: string): NationVisual {
  return NATIONS[teamId] ?? FALLBACK;
}

export function kitColors(teamId: string, kit: KitId): KitColors {
  const n = nationVisual(teamId);
  return kit === 'local' ? n.home : n.away;
}

/**
 * Fondo con franjas tenues de la bandera, compuesto sobre un color base.
 * El gradiente lleva baja opacidad para que el nombre del país se lea claro.
 */
export function flagBackground(teamId: string, base: string, alpha = 0.22): string {
  const colors = nationVisual(teamId).flag;
  const stops: string[] = [];
  const n = colors.length;
  colors.forEach((c, i) => {
    const from = Math.round((i / n) * 100);
    const to = Math.round(((i + 1) / n) * 100);
    const rgba = hexToRgba(c, alpha);
    stops.push(`${rgba} ${from}%`, `${rgba} ${to}%`);
  });
  return `linear-gradient(100deg, ${stops.join(', ')}), ${base}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
