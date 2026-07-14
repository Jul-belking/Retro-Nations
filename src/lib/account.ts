// Cuentas de usuario — MODO DEMO (local).
//
// Registro/inicio de sesión guardados en localStorage de este navegador.
// NO es autenticación real ni segura (las contraseñas se guardan en el
// navegador, sin cifrar). Sirve para la demostración de la interfaz; para
// cuentas reales se conectaría Supabase Auth.

export interface Account {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  pais: string;
}

export type PublicAccount = Omit<Account, 'password'>;

const ACCOUNTS_KEY = 'rn_accounts_v1';
const SESSION_KEY = 'rn_session_v1';

function readAccounts(): Record<string, Account> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '{}') as Record<string, Account>;
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, Account>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toPublic(account: Account): PublicAccount {
  const { password: _password, ...rest } = account;
  void _password;
  return rest;
}

export function currentUser(): PublicAccount | null {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const account = readAccounts()[email.toLowerCase()];
  return account ? toPublic(account) : null;
}

export type AuthResult = { ok: true; user: PublicAccount } | { ok: false; error: string };

export function register(data: Account): AuthResult {
  const email = data.email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts[email]) {
    return { ok: false, error: 'Ya existe una cuenta con ese correo. Inicia sesión.' };
  }
  const account: Account = { ...data, email };
  accounts[email] = account;
  writeAccounts(accounts);
  localStorage.setItem(SESSION_KEY, email);
  return { ok: true, user: toPublic(account) };
}

export function login(email: string, password: string): AuthResult {
  const key = email.trim().toLowerCase();
  const account = readAccounts()[key];
  if (!account || account.password !== password) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' };
  }
  localStorage.setItem(SESSION_KEY, key);
  return { ok: true, user: toPublic(account) };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
