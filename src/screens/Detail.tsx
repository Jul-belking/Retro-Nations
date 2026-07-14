// Detalle de producto: elegir equipación y talla. Al seleccionar talla se
// crea la reserva exclusiva de 30 minutos; el botón de compra solo se
// habilita con reserva activa.

import { KITS, SIZES, variantKey, type KitId, type Size, type Team } from '../lib/catalog';
import type { Reservation } from '../lib/store';
import { Button, Tag, Toast } from '../components/ui';
import { Jersey } from '../components/Jersey';
import { formatCountdown } from '../lib/format';

interface DetailProps {
  team: Team;
  detailKit: KitId;
  stock: Record<string, number>;
  reservation: Reservation | null;
  now: number;
  sizeNotice: string | null;
  onSelectKit: (kit: KitId) => void;
  onSelectSize: (size: Size) => void;
  onGoCheckout: () => void;
  onGoCatalog: () => void;
}

export function Detail({
  team,
  detailKit,
  stock,
  reservation,
  now,
  sizeNotice,
  onSelectKit,
  onSelectSize,
  onGoCheckout,
  onGoCatalog,
}: DetailProps) {
  const hasReservation = !!reservation && reservation.teamId === team.id;

  return (
    <main
      style={{
        flex: 1,
        maxWidth: 1120,
        margin: '0 auto',
        padding: '40px 24px 80px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <p
        style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-link)', cursor: 'pointer', margin: '0 0 20px' }}
        onClick={onGoCatalog}
      >
        ← Volver al catálogo
      </p>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px', minWidth: 320 }}>
          <Jersey
            teamId={team.id}
            kit={detailKit}
            style={{ width: '100%', height: 480, borderRadius: 14 }}
          />
        </div>
        <div style={{ flex: '1 1 380px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Tag>{team.era}</Tag>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                fontSize: 36,
                margin: '10px 0 4px',
                color: 'var(--color-text-primary)',
                fontWeight: 400,
              }}
            >
              {team.name}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 22, fontWeight: 600, color: 'var(--color-primary)', margin: 0 }}>
              ${team.price}
            </p>
          </div>

          {/* Equipación */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                fontSize: 12,
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--color-text-muted)',
                margin: '0 0 8px',
              }}
            >
              Equipación
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {KITS.map((kit) => (
                <Button
                  key={kit.id}
                  variant={detailKit === kit.id ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => onSelectKit(kit.id)}
                >
                  {kit.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Talla */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                fontSize: 12,
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--color-text-muted)',
                margin: '0 0 8px',
              }}
            >
              Talla
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SIZES.map((size) => {
                const key = variantKey(team.id, detailKit, size);
                const available = stock[key] ?? 0;
                const isReserved =
                  !!reservation &&
                  reservation.teamId === team.id &&
                  reservation.kit === detailKit &&
                  reservation.size === size;
                const isOut = available <= 0 && !isReserved;
                return (
                  <div
                    key={size}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: `2px solid ${isReserved ? 'var(--gold-500)' : isOut ? 'var(--color-border)' : 'var(--color-border-strong)'}`,
                      borderRadius: 4,
                      padding: '10px 14px',
                      cursor: isOut ? 'not-allowed' : 'pointer',
                      background: isReserved ? 'var(--cream-100)' : 'var(--color-surface)',
                    }}
                    onClick={() => {
                      if (!isOut) onSelectSize(size);
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {size}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        color: isOut ? 'var(--color-error)' : 'var(--color-text-muted)',
                      }}
                    >
                      {isOut ? 'Agotado' : isReserved ? 'Reservada para ti' : `${available} disponibles`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {sizeNotice && (
            <Toast variant="error" title="Talla no disponible">
              {sizeNotice}
            </Toast>
          )}

          {hasReservation && reservation && (
            <div
              style={{
                background: 'var(--color-surface-sunken)',
                border: '2px solid var(--gold-500)',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                <strong>Talla {reservation.size} reservada para ti</strong>
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, margin: 0, color: 'var(--color-text-secondary)' }}>
                Tienes <strong>{formatCountdown(reservation.expiresAt - now)}</strong> para completar la compra antes
                de que se libere.
              </p>
            </div>
          )}

          <Button variant="primary" size="lg" disabled={!hasReservation} onClick={onGoCheckout}>
            Comprar ahora
          </Button>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
            Pago 100% seguro. No almacenamos los datos de tu tarjeta.
          </p>
        </div>
      </div>
    </main>
  );
}
