// Retro Nations — app principal.
// Navegación por pestañas: Inicio · Catálogo · Usuario.
// El flujo de compra vive dentro de "Catálogo": continentes → selecciones →
// detalle (reserva de talla 30 min) → checkout → confirmación.
// Comprar exige sesión iniciada; el checkout usa los datos de la cuenta.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TEAMS, CONTINENTS, teamsByContinent, type KitId, type Size } from './lib/catalog';
import { createStore, type Buyer, type Order, type Reservation } from './lib/store';
import { processPayment } from './lib/payment';
import { currentUser, fullAddress, type PublicAccount } from './lib/account';
import { SITE } from './lib/site';
import { Inicio } from './screens/Inicio';
import { Continents } from './screens/Continents';
import { Catalog } from './screens/Catalog';
import { Detail } from './screens/Detail';
import { Checkout } from './screens/Checkout';
import { Confirm } from './screens/Confirm';
import { Usuario } from './screens/Usuario';

type Tab = 'inicio' | 'catalogo' | 'usuario';
type CatalogView = 'continents' | 'list' | 'detail' | 'checkout' | 'confirm';

function buyerFromUser(u: PublicAccount): Buyer {
  return {
    nombre: `${u.nombre} ${u.apellido}`.trim(),
    email: u.email,
    direccion: fullAddress(u),
  };
}

export default function App() {
  const store = useMemo(() => createStore(), []);

  const [tab, setTab] = useState<Tab>('inicio');
  const [catalogView, setCatalogView] = useState<CatalogView>('continents');
  const [continentId, setContinentId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [detailKit, setDetailKit] = useState<KitId>('local');
  const [stock, setStock] = useState<Record<string, number>>({});
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [sizeNotice, setSizeNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [logoOk, setLogoOk] = useState(true);
  const [user, setUser] = useState<PublicAccount | null>(() => currentUser());
  const [pendingCheckout, setPendingCheckout] = useState(false);

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
    setPendingCheckout(false);
  }, []);

  /* ---------- Navegación de pestañas ---------- */
  // Cambiar de pestaña NO libera la reserva (para no perderla al pasar por
  // "Usuario" a iniciar sesión durante la compra); expira sola a los 30 min.

  const goInicio = useCallback(() => {
    setTab('inicio');
  }, []);

  const goCatalogo = useCallback(() => {
    setTab('catalogo');
    setCatalogView('continents');
    setContinentId(null);
  }, []);

  const goUsuario = useCallback(() => {
    setTab('usuario');
  }, []);

  /* ---------- Navegación dentro del catálogo ---------- */

  const selectContinent = useCallback((id: string) => {
    setContinentId(id);
    setCatalogView('list');
  }, []);

  const backToContinents = useCallback(() => {
    void releaseCurrentReservation();
    setCatalogView('continents');
    setContinentId(null);
    resetPurchase();
  }, [releaseCurrentReservation, resetPurchase]);

  const backToList = useCallback(() => {
    void releaseCurrentReservation();
    setCatalogView('list');
    resetPurchase();
  }, [releaseCurrentReservation, resetPurchase]);

  const goDetail = useCallback((id: string, kit?: KitId) => {
    setTab('catalogo');
    setCatalogView('detail');
    setTeamId(id);
    setDetailKit(kit ?? 'local');
    setSizeNotice(null);
  }, []);

  const goDetailFromCheckout = useCallback(() => {
    setCatalogView('detail');
    setPaymentError(false);
  }, []);

  const goCheckout = useCallback(() => {
    if (!reservationRef.current) return;
    if (!user) {
      // Comprar exige cuenta: desvío a iniciar sesión, sin perder la reserva.
      setPendingCheckout(true);
      setTab('usuario');
      return;
    }
    setTab('catalogo');
    setCatalogView('checkout');
  }, [user]);

  /* ---------- Sesión ---------- */

  const onAuthChange = useCallback((next: PublicAccount | null) => {
    setUser(next);
    if (next && pendingCheckout && reservationRef.current) {
      setPendingCheckout(false);
      setTab('catalogo');
      setCatalogView('checkout');
    }
  }, [pendingCheckout]);

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
      if (!r || Date.now() >= r.expiresAt || !user) {
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
      const result = await store.confirmOrder(r, buyerFromUser(user));
      setPaying(false);
      if (result.ok) {
        setOrder(result.order);
        setReservation(null);
        setPaymentError(false);
        setCatalogView('confirm');
        await refreshStock();
      } else {
        setReservation(null);
        await refreshStock();
      }
    },
    [store, user, refreshStock],
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
          padding: '12px 32px',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={goInicio}>
          {logoOk && (
            <img
              src="/images/logo-retro-nations.png"
              alt="Retro Nations"
              onError={() => setLogoOk(false)}
              style={{ height: 64, width: 'auto', display: 'block' }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-primary)' }}>
              RETRO
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-primary)' }}>
              NATIONS
            </span>
          </div>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {tabItem('inicio', 'Inicio', goInicio)}
          {tabItem('catalogo', 'Catálogo', goCatalogo)}
          {tabItem('usuario', user ? user.nombre : 'Usuario', goUsuario)}
        </nav>
      </header>

      {/* Pestañas */}
      {tab === 'inicio' && <Inicio onGoPais={goCatalogo} />}

      {tab === 'usuario' && (
        <Usuario
          user={user}
          onAuthChange={onAuthChange}
          notice={pendingCheckout && !user ? 'Inicia sesión o crea una cuenta para completar tu compra.' : null}
        />
      )}

      {tab === 'catalogo' && catalogView === 'continents' && <Continents onSelectContinent={selectContinent} />}

      {tab === 'catalogo' && catalogView === 'list' && continent && (
        <Catalog
          teams={continentTeams}
          continentName={continent.name}
          stock={stock}
          layout={catalogLayout}
          onOpenDetail={goDetail}
          onBack={backToContinents}
        />
      )}

      {tab === 'catalogo' && catalogView === 'detail' && team && (
        <Detail
          team={team}
          detailKit={detailKit}
          stock={stock}
          reservation={reservation}
          now={now}
          sizeNotice={sizeNotice}
          isLoggedIn={!!user}
          onSelectKit={selectKit}
          onSelectSize={(size) => void selectSize(size)}
          onGoCheckout={goCheckout}
          onGoCatalog={backToList}
        />
      )}

      {tab === 'catalogo' && catalogView === 'checkout' && (
        <Checkout
          reservation={reservation}
          user={user}
          now={now}
          paying={paying}
          paymentError={paymentError}
          onPay={() => void doPay(false)}
          onRetry={() => void doPay(false)}
          onBackToDetail={goDetailFromCheckout}
        />
      )}

      {tab === 'catalogo' && catalogView === 'confirm' && order && <Confirm order={order} onGoCatalog={goCatalogo} />}

      {/* Footer */}
      <footer
        style={{
          background: 'var(--color-surface-sunken)',
          borderTop: '2px solid var(--color-border)',
          padding: '28px 32px',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-primary)' }}>RETRO</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-primary)' }}>NATIONS</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              <InstagramIcon /> {SITE.instagramHandle}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              <MailIcon /> {SITE.email}
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-secondary)' }}>
              <PinIcon /> {SITE.city}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Íconos del footer (SVG en línea, sin dependencias) ---------- */

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="var(--color-primary)" stroke="none" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
