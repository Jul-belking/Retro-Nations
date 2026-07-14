-- ============================================================
-- Retro Nations — esquema de base de datos (Supabase / Postgres)
--
-- Cómo usarlo:
--   1. Crea un proyecto gratis en https://supabase.com
--   2. Abre SQL Editor → New query → pega este archivo completo → Run
--   3. Copia URL y anon key (Settings → API) al .env del frontend:
--        VITE_SUPABASE_URL=...
--        VITE_SUPABASE_ANON_KEY=...
--   4. La app deja el modo demo y usa esta base automáticamente.
--
-- Modelo de stock: la unidad se descuenta al RESERVAR (atómico, evita que
-- dos compradores tomen la misma talla). Si la reserva expira (30 min) o se
-- libera, la unidad vuelve. Al confirmar el pago, la reserva se convierte
-- en pedido y el descuento queda definitivo.
-- ============================================================

-- ---------- Tablas ----------

create table if not exists teams (
  id          text primary key,          -- 'ar', 'br', ...
  name        text not null,
  era         text not null,             -- '80s' | '90s' | '00s'
  price_cents integer not null check (price_cents > 0)
);

create table if not exists variants (
  id      text primary key,              -- 'ar_local_M' (team_kit_talla)
  team_id text not null references teams(id),
  kit     text not null check (kit in ('local', 'visitante')),
  size    text not null check (size in ('S', 'M', 'L', 'XL')),
  stock   integer not null default 0 check (stock >= 0),
  unique (team_id, kit, size)
);

create table if not exists reservations (
  id         uuid primary key default gen_random_uuid(),
  variant_id text not null references variants(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  variant_id    text not null references variants(id),
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_address text not null,
  amount_cents  integer not null,
  status        text not null default 'pagado_sandbox',
  created_at    timestamptz not null default now()
);

-- ---------- Seguridad (RLS) ----------
-- El anon key solo puede LEER catálogo y stock. Reservas y pedidos se
-- manipulan únicamente a través de las funciones RPC (security definer).

alter table teams enable row level security;
alter table variants enable row level security;
alter table reservations enable row level security;
alter table orders enable row level security;

drop policy if exists "catalogo publico" on teams;
create policy "catalogo publico" on teams for select using (true);

drop policy if exists "stock publico" on variants;
create policy "stock publico" on variants for select using (true);

-- reservations y orders: sin políticas => sin acceso directo con anon key.

-- ---------- Funciones RPC ----------

-- Devuelve al stock todas las reservas vencidas.
create or replace function release_expired_reservations()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update variants v
     set stock = stock + sub.cnt
    from (
      select variant_id, count(*)::int as cnt
        from reservations
       where expires_at <= now()
       group by variant_id
    ) sub
   where v.id = sub.variant_id;

  delete from reservations where expires_at <= now();
end;
$$;

-- Reserva atómica: descuenta 1 del stock si hay disponible y crea la
-- reserva con vigencia de 30 minutos. Devuelve fila vacía si ya no hay
-- stock (el segundo comprador ve "talla no disponible").
create or replace function reserve_variant(p_variant_id text)
returns table (reservation_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
  v_res_id uuid;
  v_expires timestamptz;
begin
  perform release_expired_reservations();

  update variants
     set stock = stock - 1
   where id = p_variant_id
     and stock > 0;
  get diagnostics v_rows = row_count;

  if v_rows = 0 then
    return; -- sin stock: fila vacía
  end if;

  v_expires := now() + interval '30 minutes';
  insert into reservations (variant_id, expires_at)
  values (p_variant_id, v_expires)
  returning id into v_res_id;

  return query select v_res_id, v_expires;
end;
$$;

-- Libera una reserva manualmente (cambio de talla, volver al catálogo).
create or replace function release_reservation(p_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_variant text;
begin
  delete from reservations
   where id = p_reservation_id
  returning variant_id into v_variant;

  if v_variant is not null then
    update variants set stock = stock + 1 where id = v_variant;
  end if;
end;
$$;

-- Confirma el pedido tras un pago aprobado: la reserva (aún vigente) se
-- convierte en pedido. Devuelve fila vacía si la reserva ya expiró.
create or replace function confirm_order(
  p_reservation_id uuid,
  p_buyer_name text,
  p_buyer_email text,
  p_buyer_address text
)
returns table (order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_variant text;
  v_price int;
  v_number text;
begin
  delete from reservations
   where id = p_reservation_id
     and expires_at > now()
  returning variant_id into v_variant;

  if v_variant is null then
    return; -- reserva expirada o inexistente
  end if;

  select t.price_cents into v_price
    from variants v join teams t on t.id = v.team_id
   where v.id = v_variant;

  v_number := 'RN-' || to_char(now(), 'YYYY') || '-' ||
              lpad((1000 + floor(random() * 9000))::int::text, 4, '0');

  insert into orders (order_number, variant_id, buyer_name, buyer_email,
                      buyer_address, amount_cents)
  values (v_number, v_variant, p_buyer_name, p_buyer_email,
          p_buyer_address, v_price);

  return query select v_number;
end;
$$;

grant execute on function release_expired_reservations() to anon;
grant execute on function reserve_variant(text) to anon;
grant execute on function release_reservation(uuid) to anon;
grant execute on function confirm_order(uuid, text, text, text) to anon;

-- ---------- Datos dummy (20 selecciones × 2 equipaciones × 4 tallas) ----------
-- Stock generado con el mismo hash determinístico del prototipo de diseño.

insert into teams (id, name, era, price_cents) values
  ('ar', 'Argentina', '80s', 4500),
  ('br', 'Brasil', '90s', 4500),
  ('de', 'Alemania', '00s', 4500),
  ('it', 'Italia', '80s', 4500),
  ('fr', 'Francia', '90s', 4500),
  ('es', 'España', '00s', 4500),
  ('en', 'Inglaterra', '80s', 4500),
  ('nl', 'Países Bajos', '90s', 4500),
  ('pt', 'Portugal', '00s', 4500),
  ('uy', 'Uruguay', '80s', 4500),
  ('co', 'Colombia', '90s', 4500),
  ('mx', 'México', '00s', 4500),
  ('hr', 'Croacia', '80s', 4500),
  ('be', 'Bélgica', '90s', 4500),
  ('se', 'Suecia', '00s', 4500),
  ('cm', 'Camerún', '80s', 4500),
  ('ng', 'Nigeria', '90s', 4500),
  ('jp', 'Japón', '00s', 4500),
  ('kr', 'Corea del Sur', '80s', 4500),
  ('us', 'Estados Unidos', '90s', 4500)
on conflict (id) do nothing;

-- Réplica en SQL del hash del prototipo: h = (h*31 + charCode) mod 2^32
create or replace function _seed_hash(str text)
returns bigint
language plpgsql
immutable
as $$
declare
  h bigint := 0;
  i int;
begin
  for i in 1..length(str) loop
    h := (h * 31 + ascii(substr(str, i, 1))) % 4294967296;
  end loop;
  return h;
end;
$$;

insert into variants (id, team_id, kit, size, stock)
select
  t.id || '_' || k.kit || '_' || s.size,
  t.id,
  k.kit,
  s.size,
  (_seed_hash(t.id || k.kit || s.size) % 7)::int
from teams t
cross join (values ('local'), ('visitante')) as k(kit)
cross join (values ('S'), ('M'), ('L'), ('XL')) as s(size)
on conflict (id) do nothing;

drop function _seed_hash(text);
