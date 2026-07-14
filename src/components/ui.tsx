// Primitivas del design system Retro Nations (Button, Badge, Tag, Toast,
// Input) + ImageSlot, el marcador de posición para la fotografía real que
// llega con el inventario del proveedor.

import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

/* ---------- Button ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`rn-btn rn-btn--${size} rn-btn--${variant} ${className}`.trim()}
      {...rest}
    />
  );
}

/* ---------- Badge ---------- */

type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'warning' | 'success' | 'error' | 'dark';

export function Badge({ variant = 'neutral', children }: { variant?: BadgeVariant; children: ReactNode }) {
  return <span className={`rn-badge rn-badge--${variant}`}>{children}</span>;
}

/* ---------- Tag ---------- */

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rn-tag">{children}</span>;
}

/* ---------- Toast ---------- */

type ToastVariant = 'success' | 'error' | 'warning';

const TOAST_ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error: '!',
  warning: '!',
};

export function Toast({ variant, title, children }: { variant: ToastVariant; title: string; children: ReactNode }) {
  return (
    <div className={`rn-toast rn-toast--${variant}`} role="alert">
      <span className="rn-toast__icon">{TOAST_ICONS[variant]}</span>
      <div>
        <p className="rn-toast__title">{title}</p>
        <p className="rn-toast__body">{children}</p>
      </div>
    </div>
  );
}

/* ---------- Input ---------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, ...rest }: InputProps) {
  const inputId = id ?? `rn-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label className="rn-field" htmlFor={inputId}>
      <span className="rn-field__label">{label}</span>
      <input className="rn-input" id={inputId} {...rest} />
    </label>
  );
}

/* ---------- ImageSlot ---------- */
// Marcador de posición para fotografía de producto (aún no hay imágenes
// reales). Franja diagonal sutil + silueta de camiseta + texto descriptivo,
// sobre el fondo sunken del design system.

interface ImageSlotProps {
  placeholder: string;
  radius?: number;
  style?: CSSProperties;
  dark?: boolean;
}

export function ImageSlot({ placeholder, radius = 0, style, dark = false }: ImageSlotProps) {
  return (
    <div
      aria-label={placeholder}
      role="img"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxSizing: 'border-box',
        padding: 16,
        textAlign: 'center',
        background: dark
          ? 'repeating-linear-gradient(135deg, #3a3835 0 28px, #302e2b 28px 56px)'
          : 'repeating-linear-gradient(135deg, var(--cream-100) 0 28px, var(--cream-200) 28px 56px)',
        borderRadius: radius,
        overflow: 'hidden',
        ...style,
      }}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 64 64"
        fill="none"
        stroke={dark ? 'rgba(250,247,241,.5)' : 'var(--ink-300)'}
        strokeWidth="2.5"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Silueta de camiseta de fútbol */}
        <path d="M22 8 L12 14 L4 26 L14 32 L14 56 L50 56 L50 32 L60 26 L52 14 L42 8 C42 8 38 14 32 14 C26 14 22 8 22 8 Z" />
        <text
          x="32"
          y="44"
          textAnchor="middle"
          fontFamily="Anton, Oswald, sans-serif"
          fontSize="18"
          fill={dark ? 'rgba(250,247,241,.5)' : 'var(--ink-300)'}
          stroke="none"
        >
          7
        </text>
      </svg>
      {placeholder && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: dark ? 'rgba(250,247,241,.6)' : 'var(--color-text-muted)',
            maxWidth: 260,
          }}
        >
          {placeholder}
        </span>
      )}
    </div>
  );
}
