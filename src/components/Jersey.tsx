// Ilustración de camiseta generada por código, coloreada con el kit de cada
// selección (local/visitante). Sustituye a la foto real mientras llega el
// inventario del proveedor: da identidad visual a cada producto sin
// depender de imágenes de terceros.

import { useId, type CSSProperties } from 'react';
import type { KitId } from '../lib/catalog';
import { kitColors, type KitColors } from '../lib/nations';

interface JerseyProps {
  teamId: string;
  kit: KitId;
  style?: CSSProperties;
  showNumber?: boolean;
}

// Luminancia relativa aproximada para elegir texto legible sobre el color.
function readableInk(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 0.6 ? 'rgba(30,28,26,.75)' : 'rgba(255,255,255,.85)';
}

function PatternOverlay({ colors, clipId }: { colors: KitColors; clipId: string }) {
  const pc = colors.patternColor ?? colors.accent;
  switch (colors.pattern) {
    case 'stripes': {
      // Rayas verticales sobre el torso.
      const stripes = [];
      for (let x = 44; x < 156; x += 26) {
        stripes.push(<rect key={x} x={x} y={38} width={13} height={140} fill={pc} />);
      }
      return <g clipPath={`url(#${clipId})`}>{stripes}</g>;
    }
    case 'hoops': {
      const hoops = [];
      for (let y = 60; y < 176; y += 26) {
        hoops.push(<rect key={y} x={40} y={y} width={120} height={13} fill={pc} />);
      }
      return <g clipPath={`url(#${clipId})`}>{hoops}</g>;
    }
    case 'sash':
      return (
        <g clipPath={`url(#${clipId})`}>
          <polygon points="60,44 96,44 150,176 114,176" fill={pc} opacity={0.92} />
        </g>
      );
    case 'halves':
      return (
        <g clipPath={`url(#${clipId})`}>
          <rect x={100} y={38} width={70} height={140} fill={pc} />
        </g>
      );
    default:
      return null;
  }
}

export function Jersey({ teamId, kit, style, showNumber = true }: JerseyProps) {
  const colors = kitColors(teamId, kit);
  const rawId = useId().replace(/:/g, '');
  const clipId = `jbody-${rawId}`;
  const ink = readableInk(colors.body);

  // Torso + hombros (sirve de fondo y de máscara para los patrones).
  const bodyPath =
    'M65,42 C78,58 122,58 135,42 L148,66 L156,176 L44,176 L52,66 Z';

  return (
    <div
      aria-label={`Camiseta ${kit === 'local' ? 'local' : 'visitante'}`}
      role="img"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 50% 38%, ${colors.body}22, transparent 70%), var(--color-surface-sunken)`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <svg viewBox="0 0 200 210" width="82%" height="82%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <path d={bodyPath} />
          </clipPath>
          <linearGradient id={`shade-${rawId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        {/* Mangas */}
        <path d="M35,52 L18,92 L44,104 L52,66 Z" fill={colors.accent} stroke="rgba(0,0,0,.12)" strokeWidth="1.5" />
        <path d="M165,52 L182,92 L156,104 L148,66 Z" fill={colors.accent} stroke="rgba(0,0,0,.12)" strokeWidth="1.5" />

        {/* Cuerpo */}
        <path d={bodyPath} fill={colors.body} stroke="rgba(0,0,0,.14)" strokeWidth="1.5" />

        {/* Patrón del kit */}
        <PatternOverlay colors={colors} clipId={clipId} />

        {/* Cuello */}
        <path
          d="M65,42 C78,58 122,58 135,42"
          fill="none"
          stroke={colors.accent}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Escudo simple en el pecho */}
        <rect x={63} y={80} width={15} height={18} rx={2} fill={ink} opacity={0.5} />

        {/* Sombreado de volumen */}
        <path d={bodyPath} fill={`url(#shade-${rawId})`} />

        {showNumber && (
          <text
            x={100}
            y={150}
            textAnchor="middle"
            fontFamily="Anton, Oswald, sans-serif"
            fontSize="46"
            fill={ink}
          >
            7
          </text>
        )}
      </svg>
    </div>
  );
}
