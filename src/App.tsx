// Retro Nations — flujo completo de la v1:
// catálogo → detalle (reserva de talla, 30 min) → checkout invitado →
// pago Wompi sandbox → descuento de stock → confirmación de pedido.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TEAMS, type KitId, type Size } from './lib/catalog';
import { createStore, type Buyer, type Order, type Reservation } from './lib/store';
import { processSandboxPayment } from './lib/payment';
import { Badge } from './components/ui';
import { Catalog } from './screens/Catalog';
import { Detail } from './screens/Detail';
import { Checkout } from './screens/Checkout';
import { Confirm } from './screens/Confirm';

type Screen = 'catalog' | 'detail' | 'checkout' | 'confirm';

const EMPTY_FORM: Buyer = { nombre: '', email: '', direccion: '' };

export default function App() {
  const store = useMemo(() => createStore(), []);

  const [screen, setScreen] = useState<Screen>('catalog');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [detailKit, setDetailKit] = useState<KitId>('local');
  const [stock, setStock] = useState<Record<string, number>>({});
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [form, setForm] = useState<Buyer>(EMPTY_FORM);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [sizeNotice, setSizeNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const reservationRef = useRef<Reservation | null>(null);
  reservationRef.current = reservation;

  const refreshStock = useCallback(async () => {
    setStock(await store.getStock());
  }, [store]);

  // Carga inicial: stock + reserva vigente de este navegador (si la hay).
  useEffect(() => {
    void (async () => {
      setStock(await store.getStock());
      const active = await store.getActiveReservation();
      if (active) setReservation(active);
    })();
  }, [store]);

  // Tick por segundo: cuenta regresiva y expiración automática de reserva.
  useEffect(() => {
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      const r = reservationRef.current;
      if (r && current >= r.expiresAt) {
        setReservation(null);
        void refreshStock();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshStock]);

  const releaseCurrentReservation = useCallback(async () => {
    const r = reservationRef.current;
    if (!r) return;
    setReservation(null);
    try {
      await store.release(r.id);
    } finally {
      await refreshStock();
    }
  }, [store, refreshStock]);

  /* ---------- Navegación ---------- */

  const goCatalog = useCallback(() => {
    void releaseCurrentReservation();
    setScreen('catalog');
    setTeamId(null);
    setPaymentError(false);
    setOrder(null);
    setSizeNotice(null);
    setForm(EMPTY_FORM);
  }, [releaseCurrentReservation]);

  const goDetail = useCallback((id: string, kit?: KitId) => {
    setScreen('detail');
    setTeamId(id);
    setDetailKit(kit ?? 'local');
    setSizeNotice(null);
  }, []);

  const goDetailFromCheckout = useCallback(() => {
    setScreen('detail');
    setPaymentError(false);
  }, []);

  const goCheckout = useCallback(() => {
    if (reservationRef.current) setScreen('checkout');
  }, []);

  /* ---------- Detalle: equipación y talla ---------- */

  const selectKit = useCallback((kit: KitId) => {
    setDetailKit(kit);
    setSizeNotice(null);
  }, []);

  const selectSize = useCallback(
    async (size: Size) => {
      const team = TEAMS.find((t) => t.id === teamId);
      if (!team) return;
      const current = reservationRef.current;
      if (current && current.teamId === team.id && current.kit === detailKit && current.size === size) {
        return; // ya reservada
      }
      setSizeNotice(null);
      const result = await store.reserve(team.id, detailKit, size);
      if (result.ok) {
        setReservation(result.reservation);
      } else {
        // Otro comprador tomó la última unidad entre el render y el clic.
        setReservation(null);
        setSizeNotice('Alguien más acaba de reservar esa talla. Elige otra disponible.');
      }
      await refreshStock();
    },
    [teamId, detailKit, store, refreshStock],
  );

  /* ---------- Pago ---------- */

  const doPay = useCallback(
    async (forceFail: boolean) => {
      const r = reservationRef.current;
      if (!r || Date.now() >= r.expiresAt) {
        setReservation(null);
        return;
      }
      setPaying(true);
      setPaymentError(false);
      const payment = await processSandboxPayment({ amount: r.price, forceFail });
      if (!payment.approved) {
        setPaying(false);
        setPaymentError(true);
        return;
      }
      const result = await store.confirmOrder(r, form);
      setPaying(false);
      if (result.ok) {
        setOrder(result.order);
        setReservation(null);
        setPaymentError(false);
        setScreen('confirm');
        await refreshStock();
      } else {
        // La reserva expiró justo durante el pago.
        setReservation(null);
        await refreshStock();
      }
    },
    [store, form, refreshStock],
  );

  /* ---------- Layout del catálogo (prop de diseño: list | grid) ---------- */

  const catalogLayout = useMemo<'list' | 'grid'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('layout') === 'grid' ? 'grid' : 'list';
  }, []);

  const team = TEAMS.find((t) => t.id === teamId) ?? null;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
        background: 'var(--color-bg)',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--color-bg)',
          borderBottom: '2px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, cursor: 'pointer' }} onClick={goCatalog}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-primary)',
            }}
          >
            RETRO
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-text-primary)',
            }}
          >
            NATIONS
          </span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 13,
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
            onClick={goCatalog}
          >
            Catálogo
          </span>
          <Badge variant="neutral">Catálogo dummy</Badge>
        </nav>
      </header>

      {/* Pantallas */}
      {screen === 'catalog' && <Catalog stock={stock} layout={catalogLayout} onOpenDetail={goDetail} />}

      {screen === 'detail' && team && (
        <Detail
          team={team}
          detailKit={detailKit}
          stock={stock}
          reservation={reservation}
          now={now}
          sizeNotice={sizeNotice}
          onSelectKit={selectKit}
          onSelectSize={(size) => void selectSize(size)}
          onGoCheckout={goCheckout}
          onGoCatalog={goCatalog}
        />
      )}

      {screen === 'checkout' && (
        <Checkout
          reservation={reservation}
          form={form}
          now={now}
          paying={paying}
          paymentError={paymentError}
          onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onPay={() => void doPay(false)}
          onRetry={() => void doPay(false)}
          onSimulateReject={() => void doPay(true)}
          onBackToDetail={goDetailFromCheckout}
        />
      )}

      {screen === 'confirm' && order && <Confirm order={order} onGoCatalog={goCatalog} />}

      {/* Footer */}
      <footer
        style={{
          background: 'var(--color-surface-sunken)',
          borderTop: '2px solid var(--color-border)',
          padding: '24px 32px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
          Retro Nations — camisetas verificadas a mano, no dropshipping. Pagos en modo pruebas (Wompi sandbox) hasta
          activar el inventario real.
        </p>
      </footer>
    </div>
  );
}
