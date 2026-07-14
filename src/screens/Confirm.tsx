// Confirmación de pedido: número de pedido y resumen tras pago aprobado.

import type { Order } from '../lib/store';
import { Button } from '../components/ui';
import { kitDisplayLabel } from '../lib/format';

interface ConfirmProps {
  order: Order;
  onGoCatalog: () => void;
}

export function Confirm({ order, onGoCatalog }: ConfirmProps) {
  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'var(--color-surface)',
          border: '2px solid var(--color-border)',
          borderRadius: 8,
          padding: 36,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-success)',
            color: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 20px',
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            fontSize: 26,
            margin: '0 0 8px',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
          }}
        >
          ¡Pedido confirmado!
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
          Número de pedido
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--color-primary)',
            margin: '0 0 24px',
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          {order.number}
        </p>
        <div
          style={{
            background: 'var(--color-surface-sunken)',
            borderRadius: 6,
            padding: 16,
            textAlign: 'left',
            marginBottom: 20,
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
            {order.teamName} — Equipación {kitDisplayLabel(order.kit)}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, margin: '0 0 4px', color: 'var(--color-text-secondary)' }}>
            Talla {order.size}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, margin: '8px 0 0', color: 'var(--color-primary)' }}>
            ${order.price}
          </p>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
          Enviamos la confirmación a {order.email || 'tu correo'}. Julian verifica cada camiseta antes de despacharla.
        </p>
        <Button variant="primary" size="md" onClick={onGoCatalog}>
          Volver al catálogo
        </Button>
      </div>
    </main>
  );
}
