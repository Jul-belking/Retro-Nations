// Pestaña Usuario: iniciar sesión / crear cuenta (modo demo, local).
// El estado de sesión lo controla App (para que la compra pueda exigir
// login). Aquí solo se muestran los formularios o el perfil.

import { useState, type FormEvent } from 'react';
import { login, logout, register, type Account, type PublicAccount } from '../lib/account';
import { Button, Input, Toast } from '../components/ui';

type Mode = 'login' | 'register';

interface UsuarioProps {
  user: PublicAccount | null;
  onAuthChange: (user: PublicAccount | null) => void;
  notice?: string | null;
}

const EMPTY: Account = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  codigoPostal: '',
  pais: '',
};

const heading = (text: string) => (
  <h1
    style={{
      fontFamily: 'var(--font-display)',
      textTransform: 'uppercase',
      fontSize: 28,
      margin: '0 0 4px',
      color: 'var(--color-text-primary)',
      fontWeight: 400,
    }}
  >
    {text}
  </h1>
);

function ProfileRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export function Usuario({ user, onAuthChange, notice }: UsuarioProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<Account>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<Account>) => {
    setForm((f) => ({ ...f, ...patch }));
    setError(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = mode === 'login' ? login(form.email, form.password) : register(form);
    if (result.ok) {
      setForm(EMPTY);
      setError(null);
      onAuthChange(result.user);
    } else {
      setError(result.error);
    }
  };

  const onLogout = () => {
    logout();
    setMode('login');
    onAuthChange(null);
  };

  /* ---------- Perfil (sesión iniciada) ---------- */
  if (user) {
    return (
      <main style={{ flex: 1, maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px', width: '100%', boxSizing: 'border-box' }}>
        {heading(`Hola, ${user.nombre}`)}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', margin: '0 0 28px' }}>
          Tu cuenta de Retro Nations.
        </p>
        <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 20px 16px' }}>
          <ProfileRow label="Nombre" value={`${user.nombre} ${user.apellido}`.trim()} />
          <ProfileRow label="Correo" value={user.email} />
          <ProfileRow label="Teléfono" value={user.telefono} />
          <ProfileRow label="Dirección" value={user.direccion} />
          <ProfileRow label="Ciudad" value={user.ciudad} />
          <ProfileRow label="Código postal" value={user.codigoPostal} />
          <ProfileRow label="País" value={user.pais} />
        </div>
        <div style={{ marginTop: 24 }}>
          <Button variant="outline" size="md" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </main>
    );
  }

  /* ---------- Login / Registro ---------- */
  return (
    <main style={{ flex: 1, maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px', width: '100%', boxSizing: 'border-box' }}>
      {heading(mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
        {mode === 'login'
          ? 'Accede con tu correo y contraseña.'
          : 'Regístrate para agilizar tus compras y guardar tus datos de envío.'}
      </p>

      {notice && (
        <div style={{ marginBottom: 20 }}>
          <Toast variant="warning" title="Necesitas una cuenta">
            {notice}
          </Toast>
        </div>
      )}

      {/* Conmutador */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`rn-tab ${mode === 'login' ? 'rn-tab--active' : ''}`} onClick={() => { setMode('login'); setError(null); }}>
          Iniciar sesión
        </button>
        <button className={`rn-tab ${mode === 'register' ? 'rn-tab--active' : ''}`} onClick={() => { setMode('register'); setError(null); }}>
          Crear cuenta
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mode === 'register' && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <Input label="Nombre" value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} required />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <Input label="Apellido" value={form.apellido} onChange={(e) => set({ apellido: e.target.value })} required />
            </div>
          </div>
        )}

        <Input label="Correo electrónico" type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => set({ email: e.target.value })} required />
        <Input label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set({ password: e.target.value })} required />

        {mode === 'register' && (
          <>
            <Input label="Teléfono" type="tel" placeholder="+57 300 000 0000" value={form.telefono} onChange={(e) => set({ telefono: e.target.value })} />
            <Input label="Dirección de envío" placeholder="Calle, número" value={form.direccion} onChange={(e) => set({ direccion: e.target.value })} required />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <Input label="Ciudad" value={form.ciudad} onChange={(e) => set({ ciudad: e.target.value })} required />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <Input label="Código postal" value={form.codigoPostal} onChange={(e) => set({ codigoPostal: e.target.value })} />
              </div>
            </div>
            <Input label="País" placeholder="Colombia" value={form.pais} onChange={(e) => set({ pais: e.target.value })} required />
          </>
        )}

        {error && (
          <Toast variant="error" title={mode === 'login' ? 'No pudimos iniciar sesión' : 'No pudimos crear la cuenta'}>
            {error}
          </Toast>
        )}

        <div style={{ marginTop: 8 }}>
          <Button variant="primary" size="lg" type="submit">
            {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </div>
      </form>
    </main>
  );
}
