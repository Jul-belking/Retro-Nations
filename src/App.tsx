// Retro Nations — app principal.
// Navegación por pestañas: Inicio · País · Usuario.
// El flujo de compra vive dentro de "País": continentes → selecciones →
// detalle (reserva de talla 30 min) → checkout → confirmación.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TEAMS, CONTINENTS, teamsByContinent, type KitId, type Size } from './lib/catalog';
import { createStore, type Buyer, type Order, type Reservation } from './lib/store';
import { processPayment } from './lib/payment';
import { Inicio } from './screens/Inicio';
import { Continents } from './screens/Continents';
import { Catalog } from './screens/Catalog';
import { Detail } from './screens/Detail';
import { Checkout } from './screens/Checkout';
import { Confirm } from './screens/Confirm';
import { Usuario } from './screens/Usuario';

type Tab = 'inicio' | 'pais' | 'usuario';
type PaisView = 'continents' | 'catalog' | 'detail' | 'checkout' | 'confirm';

const EMPTY_FORM: Buyer = { nombre: '', email: '', direccion: '' };

export default function App() {
  const store = useMemo(() => createStore(), []);

  const [tab, setTab] = useState<Tab>('inicio');
  const [paisView, setPaisView] = useState<PaisView>('continents');
  const [continentId, setContinentId] = useState<string | null>(null);
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
  const [logoOk, setLogoOk] = useState(true);

  const reservationRef = useRef<Reservation | null>(null);
  reservationRef.current = reservation;

  const refreshStock = useCallback(async () => {
    setStock(await store.getStock());
  }, [store]);

  useEffect(() => {
    void (async () => {
      setStock(await store.getStock());
      const active = await store.getActiveReservation();
      if (active) setReservation(active);
    })();
  }, [store]);

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

  const resetPurchase = useCallback(() => {
    setTeamId(null);
    setPaymentError(false);
    setOrder(null);
    setSizeNotice(null);
    setForm(EMPTY_FORM);
  }, []);

  /* ---------- Navegación de pestañas ---------- */

  const goInicio = useCallback(() => {
    void releaseCurrentReservation();
    setTab('inicio');
    resetPurchase();
  }, [releaseCurrentReservation, resetPurchase]);

  const goPais = useCallback(() => {
    void releaseCurrentReservation();
    setTab('pais');
    setPaisView('continents');
    setContinentId(null);
    resetPurchase();
  }, [releaseCurrentReservation, resetPurchase]);

  const goUsuario = useCallback(() => {
    void releaseCurrentReservation();
    setTab('usuario');
    resetPurchase();
  }, [releaseCurrentReservation, resetPurchase]);

  /* ---------- Navegación dentro de País ---------- */

  const selectContinent = useCallback((id: string) => {
    setContinentId(id);
    setPaisView('catalog');
  }, []);

  const backToContinents = useCallback(() => {
    void releaseCurrentReservation();
    setPaisView('continents');
    setContinentId(null);
    resetPurchase();
  }, [releaseCurrentReservation, resetPurchase]);

  const backToCatalog = useCallback(() => {
    void releaseCurrentReservation();
    setPaisView('catalog');
    resetPurchase();
  }, [releaseCurrentReservation, resetPurchase]);

  const goDetail = useCallback((id: string, kit?: KitId) => {
    setTab('pais');
    setPaisView('detail');
    setTeamId(id);
    setDetailKit(kit ?? 'local');
    setSizeNotice(null);
  }, []);

  const goDetailFromCheckout = useCallback(() => {
    setPaisView('detail');
    setPaymentError(false);
  }, []);

  const goCheckout = useCallback(() => {
    if (reservationRef.current) setPaisView('checkout');
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
        return;
      }
      setSizeNotice(null);
      const result = await store.reserve(team.id, detailKit, size);
      if (result.ok) {
        setReservation(result.reservation);
      } else {
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
      const payment = await processPayment({ amount: r.price, forceFail });
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
        setPaisView('confirm');
        await refreshStock();
      } else {
        setReservation(null);
        await refreshStock();
      }
    },
    [store, form, refreshStock],
  );

  /* ---------- Layout del catálogo (list | grid) ---------- */

  const catalogLayout = useMemo<'list' | 'grid'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('layout') === 'grid' ? 'grid' : 'list';
  }, []);

  const team = TEAMS.find((t) => t.id === teamId) ?? null;
  const continent = CONTINENTS.find((c) => c.id === continentId) ?? null;
  const continentTeams = continentId ? teamsByContinent(continentId) : [];

  const tabItem = (id: Tab, label: string, onClick: () => void) => (
    <button className={`rn-tab ${tab === id ? 'rn-tab--active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );

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
          padding: '14px 32px',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={goInicio}>
          {logoOk && (
            <img
              src="/images/logo-retro-nations.png"
              alt="Retro Nations"
              onError={() => setLogoOk(false)}
              style={{ height: 44, width: 'auto', display: 'block' }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-primary)' }}>
              RETRO
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-primary)' }}>
              NATIONS
            </span>
          </div>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {tabItem('inicio', 'Inicio', goInicio)}
          {tabItem('pais', 'País', goPais)}
          {tabItem('usuario', 'Usuario', goUsuario)}
        </nav>
      </header>

      {/* Pestañas */}
      {tab === 'inicio' && <Inicio onGoPais={goPais} />}

      {tab === 'usuario' && <Usuario />}

      {tab === 'pais' && paisView === 'continents' && <Continents onSelectContinent={selectContinent} />}

      {tab === 'pais' && paisView === 'catalog' && continent && (
        <Catalog
          teams={continentTeams}
          continentName={continent.name}
          stock={stock}
          layout={catalogLayout}
          onOpenDetail={goDetail}
          onBack={backToContinents}
        />
      )}

      {tab === 'pais' && paisView === 'detail' && team && (
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
          onGoCatalog={backToCatalog}
        />
      )}

      {tab === 'pais' && paisView === 'checkout' && (
        <Checkout
          reservation={reservation}
          form={form}
          now={now}
          paying={paying}
          paymentError={paymentError}
          onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onPay={() => void doPay(false)}
          onRetry={() => void doPay(false)}
          onBackToDetail={goDetailFromCheckout}
        />
      )}

      {tab === 'pais' && paisView === 'confirm' && order && <Confirm order={order} onGoCatalog={goPais} />}

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
          Retro Nations — reproducciones de camisetas clásicas de selecciones, verificadas a mano. No dropshipping.
        </p>
      </footer>
    </div>
  );
}
