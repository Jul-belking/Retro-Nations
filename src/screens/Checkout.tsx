// Checkout: al llegar aquí el usuario ya inició sesión, así que usamos sus
// datos guardados (nombre, correo, dirección) sin volver a pedirlos.
// Si la reserva expiró (30 min), muestra el aviso y bloquea el pago.

import type { Reservation } from '../lib/store';
import { fullAddress, type PublicAccount } from '../lib/account';
import { Badge, Button, Toast } from '../components/ui';
import { Jersey } from '../components/Jersey';
import { formatCountdown, kitDisplayLabel } from '../lib/format';

interface CheckoutProps {
  reservation: Reservation | null;
  user: PublicAccount | null;
  now: number;
  paying: boolean;
  paymentError: boolean;
  onPay: () => void;
  onRetry: () => void;
  onBackToDetail: () => void;
}

export function Checkout({
  reservation,
  user,
  now,
  paying,
  paymentError,
  onPay,
  onRetry,
  onBackToDetail,
}: CheckoutProps) {
  const reservationExpired = !reservation;
  const canPay = !reservationExpired && !!user && !paying;

  return (
    <main
      style={{
        flex: 1,
        maxWidth: 1000,
        margin: '0 auto',
        padding: '40px 24px 80px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <p
        style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-link)', cursor: 'pointer', margin: '0 0 20px' }}
        onClick={onBackToDetail}
      >
        ← Volver al producto
      </p>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap-reverse' }}>
        {/* Datos de envío (de la cuenta) */}
        <div style={{ flex: '1 1 380px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              fontSize: 28,
              margin: 0,
              color: 'var(--color-text-primary)',
              fontWeight: 400,
            }}
          >
            Confirmar pedido
          </h1>

          {reservationExpired ? (
            <Toast variant="error" title="La reserva expiró">
              Pasaron 30 minutos y la talla se liberó. Vuelve al producto y elígela de nuevo.
            </Toast>
          ) : (
            <>
              {user && (
                <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: 12, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-muted)', margin: '0 0 10px' }}>
                    Enviar a
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, margin: '0 0 2px', color: 'var(--color-text-primary)' }}>
                    {`${user.nombre} ${user.apellido}`.trim()}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, margin: '0 0 2px', color: 'var(--color-text-secondary)' }}>{user.email}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, margin: 0, color: 'var(--color-text-secondary)' }}>{fullAddress(user)}</p>
                  {user.telefono && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, margin: '2px 0 0', color: 'var(--color-text-secondary)' }}>{user.telefono}</p>
                  )}
                </div>
              )}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                Usamos los datos de tu cuenta para el envío. El pago se gestiona de forma segura — no almacenamos los
                datos de tu tarjeta.
              </p>

              {paymentError && (
                <Toast variant="error" title="El pago fue rechazado">
                  No se realizó ningún cargo. Tu reserva se mantiene — puedes reintentar.
                </Toast>
              )}

              <div style={{ marginTop: 8 }}>
                {!paymentError ? (
                  <Button variant="primary" size="lg" disabled={!canPay} onClick={onPay}>
                    {paying ? 'Procesando…' : 'Pagar ahora'}
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" disabled={paying} onClick={onRetry}>
                    {paying ? 'Procesando…' : 'Reintentar pago'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Resumen */}
        <div style={{ flex: '1 1 300px', minWidth: 280 }}>
          <div
            style={{
              background: 'var(--color-surface)',
              border: '2px solid var(--color-border)',
              borderRadius: 8,
              padding: 20,
              position: 'sticky',
              top: 96,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                fontSize: 12,
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--color-text-muted)',
                margin: '0 0 12px',
              }}
            >
              Resumen del pedido
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 64, height: 64, flex: 'none', borderRadius: 6, overflow: 'hidden' }}>
                {reservation ? (
                  <Jersey teamId={reservation.teamId} kit={reservation.kit} showNumber={false} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-sunken)' }} />
                )}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, margin: '0 0 2px', color: 'var(--color-text-primary)' }}>
                  {reservation ? `${reservation.teamName} — ${kitDisplayLabel(reservation.kit)}` : '—'}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, margin: 0, color: 'var(--color-text-secondary)' }}>
                  {reservation ? `Talla ${reservation.size}` : ''}
                </p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid var(--color-border)',
                paddingTop: 12,
                marginBottom: 8,
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-secondary)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>
                {reservation ? `$${reservation.price}` : '—'}
              </span>
            </div>
            {!reservationExpired && reservation && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 10px' }}>
                Reserva activa: {formatCountdown(reservation.expiresAt - now)} restantes
              </p>
            )}
            <Badge variant="success">Pago seguro</Badge>
          </div>
        </div>
      </div>
    </main>
  );
}
