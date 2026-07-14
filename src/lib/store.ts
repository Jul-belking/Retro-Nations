// Capa de datos de Retro Nations.
//
// Dos implementaciones detrás de la misma interfaz:
//  - LocalDemoStore: funciona hoy sin cuentas externas. Stock dummy con
//    persistencia en localStorage. Es el modo por defecto.
//  - SupabaseStore: se activa automáticamente cuando existen
//    VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el .env. Usa las
//    funciones RPC de supabase/schema.sql, donde la reserva y el descuento
//    de stock son atómicos y válidos entre compradores concurrentes.
//
// Modelo de stock (igual al prototipo aprobado): la unidad se descuenta al
// RESERVAR la talla; si la reserva se libera o expira, la unidad vuelve; si
// el pago se confirma, la reserva se convierte en pedido y el descuento
// queda definitivo.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  RESERVATION_MS,
  TEAMS,
  orderNumberFor,
  seedStock,
  variantKey,
  type KitId,
  type Size,
} from './catalog';

export interface Reservation {
  id: string;
  teamId: string;
  teamName: string;
  kit: KitId;
  size: Size;
  price: number;
  expiresAt: number; // epoch ms
}

export interface Buyer {
  nombre: string;
  email: string;
  direccion: string;
}

export interface Order {
  number: string;
  teamName: string;
  kit: KitId;
  size: Size;
  price: number;
  email: string;
}

export type ReserveResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; reason: 'out_of_stock' };

export type ConfirmResult =
  | { ok: true; order: Order }
  | { ok: false; reason: 'reservation_expired' };

export interface StoreApi {
  /** Etiqueta del modo activo, para mostrar en la UI/console. */
  readonly mode: 'demo' | 'supabase';
  /** Stock disponible por variante (ya con reservas activas descontadas). */
  getStock(): Promise<Record<string, number>>;
  /** Reserva atómica de una talla por 30 minutos. */
  reserve(teamId: string, kit: KitId, size: Size): Promise<ReserveResult>;
  /** Libera una reserva y devuelve la unidad al stock. */
  release(reservationId: string): Promise<void>;
  /** Recupera la reserva activa de este navegador si sigue vigente. */
  getActiveReservation(): Promise<Reservation | null>;
  /** Convierte la reserva en pedido tras un pago aprobado. */
  confirmOrder(reservation: Reservation, buyer: Buyer): Promise<ConfirmResult>;
}

/* ============================================================
   Modo demo: localStorage
   ============================================================ */

const STOCK_KEY = 'rn_stock_v1';
const RESERVATION_KEY = 'rn_reservation_v1';
const ORDERS_KEY = 'rn_orders_v1';

class LocalDemoStore implements StoreApi {
  readonly mode = 'demo' as const;

  private readStock(): Record<string, number> {
    const raw = localStorage.getItem(STOCK_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as Record<string, number>;
      } catch {
        /* semilla de nuevo si está corrupto */
      }
    }
    const stock = seedStock();
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
    return stock;
  }

  private writeStock(stock: Record<string, number>) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
  }

  private readReservation(): Reservation | null {
    const raw = localStorage.getItem(RESERVATION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Reservation;
    } catch {
      return null;
    }
  }

  /** Devuelve al stock cualquier reserva vencida antes de operar. */
  private expireStale() {
    const r = this.readReservation();
    if (r && Date.now() >= r.expiresAt) {
      const stock = this.readStock();
      const key = variantKey(r.teamId, r.kit, r.size);
      stock[key] = (stock[key] ?? 0) + 1;
      this.writeStock(stock);
      localStorage.removeItem(RESERVATION_KEY);
    }
  }

  async getStock(): Promise<Record<string, number>> {
    this.expireStale();
    return this.readStock();
  }

  async reserve(teamId: string, kit: KitId, size: Size): Promise<ReserveResult> {
    this.expireStale();
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team) return { ok: false, reason: 'out_of_stock' };

    const stock = this.readStock();
    const key = variantKey(teamId, kit, size);
    if ((stock[key] ?? 0) <= 0) return { ok: false, reason: 'out_of_stock' };

    // Libera la reserva previa de este comprador (solo una a la vez).
    const prev = this.readReservation();
    if (prev) {
      const prevKey = variantKey(prev.teamId, prev.kit, prev.size);
      stock[prevKey] = (stock[prevKey] ?? 0) + 1;
    }

    stock[key] = stock[key] - 1;
    const reservation: Reservation = {
      id: crypto.randomUUID(),
      teamId,
      teamName: team.name,
      kit,
      size,
      price: team.price,
      expiresAt: Date.now() + RESERVATION_MS,
    };
    this.writeStock(stock);
    localStorage.setItem(RESERVATION_KEY, JSON.stringify(reservation));
    return { ok: true, reservation };
  }

  async release(reservationId: string): Promise<void> {
    const r = this.readReservation();
    if (!r || r.id !== reservationId) return;
    const stock = this.readStock();
    const key = variantKey(r.teamId, r.kit, r.size);
    stock[key] = (stock[key] ?? 0) + 1;
    this.writeStock(stock);
    localStorage.removeItem(RESERVATION_KEY);
  }

  async getActiveReservation(): Promise<Reservation | null> {
    this.expireStale();
    return this.readReservation();
  }

  async confirmOrder(reservation: Reservation, buyer: Buyer): Promise<ConfirmResult> {
    this.expireStale();
    const current = this.readReservation();
    if (!current || current.id !== reservation.id) {
      return { ok: false, reason: 'reservation_expired' };
    }

    const order: Order = {
      number: orderNumberFor(reservation.teamId + reservation.size + Date.now()),
      teamName: reservation.teamName,
      kit: reservation.kit,
      size: reservation.size,
      price: reservation.price,
      email: buyer.email,
    };

    // La reserva ya descontó la unidad: al confirmar solo se vuelve pedido.
    localStorage.removeItem(RESERVATION_KEY);
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]') as unknown[];
    orders.push({ ...order, buyer, createdAt: new Date().toISOString() });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return { ok: true, order };
  }
}

/* ============================================================
   Modo Supabase: RPCs de supabase/schema.sql
   ============================================================ */

const SB_RESERVATION_KEY = 'rn_sb_reservation_v1';

interface ReserveRpcRow {
  reservation_id: string;
  expires_at: string;
}

interface ConfirmRpcRow {
  order_number: string;
}

class SupabaseStore implements StoreApi {
  readonly mode = 'supabase' as const;
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getStock(): Promise<Record<string, number>> {
    await this.client.rpc('release_expired_reservations');
    const { data, error } = await this.client.from('variants').select('id, stock');
    if (error) throw error;
    const stock: Record<string, number> = {};
    for (const row of data ?? []) stock[row.id as string] = row.stock as number;
    return stock;
  }

  async reserve(teamId: string, kit: KitId, size: Size): Promise<ReserveResult> {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team) return { ok: false, reason: 'out_of_stock' };

    // Solo una reserva por comprador: libera la anterior primero.
    const prev = this.localReservation();
    if (prev) await this.release(prev.id);

    const { data, error } = await this.client.rpc('reserve_variant', {
      p_variant_id: variantKey(teamId, kit, size),
    });
    if (error) throw error;
    const row = (data as ReserveRpcRow[] | null)?.[0];
    if (!row) return { ok: false, reason: 'out_of_stock' };

    const reservation: Reservation = {
      id: row.reservation_id,
      teamId,
      teamName: team.name,
      kit,
      size,
      price: team.price,
      expiresAt: new Date(row.expires_at).getTime(),
    };
    localStorage.setItem(SB_RESERVATION_KEY, JSON.stringify(reservation));
    return { ok: true, reservation };
  }

  async release(reservationId: string): Promise<void> {
    const { error } = await this.client.rpc('release_reservation', {
      p_reservation_id: reservationId,
    });
    if (error) throw error;
    const local = this.localReservation();
    if (local?.id === reservationId) localStorage.removeItem(SB_RESERVATION_KEY);
  }

  async getActiveReservation(): Promise<Reservation | null> {
    const r = this.localReservation();
    if (!r) return null;
    if (Date.now() >= r.expiresAt) {
      localStorage.removeItem(SB_RESERVATION_KEY);
      return null;
    }
    return r;
  }

  async confirmOrder(reservation: Reservation, buyer: Buyer): Promise<ConfirmResult> {
    const { data, error } = await this.client.rpc('confirm_order', {
      p_reservation_id: reservation.id,
      p_buyer_name: buyer.nombre,
      p_buyer_email: buyer.email,
      p_buyer_address: buyer.direccion,
    });
    if (error) throw error;
    const row = (data as ConfirmRpcRow[] | null)?.[0];
    if (!row) return { ok: false, reason: 'reservation_expired' };

    localStorage.removeItem(SB_RESERVATION_KEY);
    return {
      ok: true,
      order: {
        number: row.order_number,
        teamName: reservation.teamName,
        kit: reservation.kit,
        size: reservation.size,
        price: reservation.price,
        email: buyer.email,
      },
    };
  }

  private localReservation(): Reservation | null {
    const raw = localStorage.getItem(SB_RESERVATION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Reservation;
    } catch {
      return null;
    }
  }
}

/* ============================================================
   Selección de modo
   ============================================================ */

export function createStore(): StoreApi {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) {
    return new SupabaseStore(createClient(url, key));
  }
  return new LocalDemoStore();
}
