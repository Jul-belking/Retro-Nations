# Retro Nations — Ecommerce de camisetas retro (v1)

Tienda online de camisetas retro de selecciones de fútbol, con inventario
verificado a mano (no dropshipping). Implementa el diseño del handoff de
Claude Design y la Fase 1 del spec: catálogo dummy → detalle con reserva de
talla (30 min) → checkout invitado → pago Wompi sandbox → descuento de stock
→ confirmación con número de pedido.

## Correr en local

```bash
npm install
npm run dev        # abre http://localhost:5173
```

No necesita ninguna cuenta externa: sin configuración corre en **modo demo**
(stock dummy persistido en el navegador con localStorage). El flujo completo
de compra funciona de punta a punta.

- Layout del catálogo: lista expandible por defecto; `?layout=grid` muestra
  la variante de tarjetas del diseño.
- Para reiniciar el stock demo: DevTools → Application → Local Storage →
  borrar las claves `rn_stock_v1`, `rn_reservation_v1`, `rn_orders_v1`.

## Estructura

```
src/
  styles/design-system.css   Tokens + componentes del design system del handoff
  lib/catalog.ts             Catálogo dummy (20 selecciones × 2 equipaciones × 4 tallas)
  lib/store.ts               Capa de datos: modo demo (localStorage) y modo Supabase
  lib/payment.ts             Pago sandbox simulado (ver sección Wompi)
  components/ui.tsx          Button, Badge, Tag, Toast, Input, ImageSlot
  screens/                   Catalog, Detail, Checkout, Confirm
supabase/schema.sql          Esquema Postgres completo con RPCs atómicas
```

## Modelo de reserva y stock

La unidad se descuenta **al reservar la talla** (no al pagar):

1. Comprador elige talla → reserva exclusiva por 30 minutos, stock −1.
2. Cambia de talla o vuelve al catálogo → la reserva se libera, stock +1.
3. Pasan 30 minutos sin pagar → se libera automáticamente.
4. Pago aprobado → la reserva se convierte en pedido; el descuento queda
   definitivo.
5. Pago rechazado → datos y reserva se mantienen; puede reintentar dentro de
   la ventana de 30 minutos.

En modo Supabase esto es atómico entre compradores concurrentes: si dos
personas piden la última unidad casi al mismo tiempo, solo la primera
obtiene la reserva (`reserve_variant` usa un `UPDATE ... WHERE stock > 0`).

## Activar Supabase (cuando crees la cuenta)

1. Crea un proyecto gratis en <https://supabase.com>.
2. SQL Editor → New query → pega `supabase/schema.sql` completo → **Run**.
   Crea tablas (`teams`, `variants`, `reservations`, `orders`), funciones
   RPC y los datos dummy con el mismo stock del modo demo.
3. Settings → API: copia la URL y la anon key.
4. Crea un archivo `.env` (a partir de `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Reinicia `npm run dev`. La app detecta las variables y pasa sola al modo
   Supabase — no hay que cambiar código.

Seguridad: la anon key solo puede **leer** catálogo y stock; reservas y
pedidos pasan únicamente por las funciones RPC (`security definer`). Los
datos del comprador (nombre, email, dirección) quedan en la tabla `orders`,
sin acceso de lectura pública.

Gestión de stock (mientras no haya panel admin): Supabase → Table Editor →
`variants` → editar la columna `stock`. Los pedidos entran en `orders`.

## Wompi

La v1 usa un **pago sandbox simulado** (`src/lib/payment.ts`), igual que el
prototipo de diseño — incluye el enlace "Simular pago rechazado (demo)" para
probar el flujo de error. No se realizan cargos.

Para conectar el widget real de Wompi en modo pruebas:

1. Crea la cuenta en <https://comercios.wompi.co> y toma las llaves de
   **pruebas** (`pub_test_...` y el secreto de integridad `test_integrity_...`).
2. La firma de integridad (`referencia + monto + moneda + secreto` en
   SHA-256) debe calcularse en el servidor: crea una Supabase Edge Function
   que reciba la referencia y el monto y devuelva la firma. **Nunca** pongas
   el secreto de integridad en el frontend.
3. En `payment.ts`, reemplaza `processSandboxPayment` por la apertura del
   Widget de Wompi (`https://checkout.wompi.co/widget.js`) con
   `publicKey`, `reference` (usa el id de la reserva), `amountInCents`,
   `currency: 'COP'` y la `signature:integrity` de la Edge Function.
4. Confirma el pedido solo con el evento de transacción `APPROVED` (ideal:
   webhook de Wompi → Edge Function → `confirm_order`).
5. El paso a producción (llaves `pub_prod_...`) queda para cuando llegue el
   inventario real — riesgo #1 del contexto: no olvidar el switch.

## Deploy gratis (Vercel)

```bash
npm run build      # verifica que compila
```

1. Sube el proyecto a un repo de GitHub.
2. En <https://vercel.com> → New Project → importa el repo (framework:
   Vite). Build `npm run build`, output `dist/`.
3. Si usas Supabase, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   en Environment Variables del proyecto en Vercel.

Netlify funciona igual (build `npm run build`, publish `dist`).

## Pendientes conocidos (Fase 2 del roadmap)

- Carrito multi-producto, login con historial, panel admin, filtros,
  notificaciones por email/WhatsApp.
- Fotografía real de producto: los `ImageSlot` son placeholders a propósito;
  llegan con el primer envío del proveedor.
- Dominio propio (.com/.co) en vez del subdominio gratis.
