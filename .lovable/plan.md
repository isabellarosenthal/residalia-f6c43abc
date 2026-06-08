# Flujo de planes con trial de 14 días

Hoy el trial existe en BD pero nada lo enforce y el usuario nunca elige plan ni ve cuántos días le quedan. Esto cierra el flujo de punta a punta.

## 1. Selección de plan en el registro

- Página `/login` modo signup (rol `admin_condominio`): agregar paso visual con 3 tarjetas (Lobby / Torre / Penthouse) — nombre, precio y límites. Obligatorio elegir uno antes de crear cuenta.
- Plan elegido viaja en `options.data.plan_nombre` del `supabase.auth.signUp`.
- `profiles`: agregar columna `plan_seleccionado` (text). `handle_new_user` la guarda desde `raw_user_meta_data->>plan_nombre`.

## 2. Suscripción usa el plan elegido (no el más barato)

- `handle_new_condominio_subscription` cambia: lee `plan_seleccionado` del profile del `admin_id`, busca ese plan, fallback al más barato si no hay match.
- Mantiene `estado='trial'` y `trial_ends_at = CURRENT_DATE + 14`.

## 3. Límites respetan el plan elegido durante el trial

`get_admin_plan_limits` ya lee los límites del plan asignado en `suscripciones` — sin cambios. Sólo hay que asegurar que las suscripciones existentes (Karla) queden con el plan correcto: migración que asigna Lobby por defecto a quienes no tienen `plan_seleccionado`.

## 4. Bloqueo de escritura al expirar (solo lectura)

- Función `public.is_subscription_active(_condo_id uuid)` → true si `estado='activa'` o (`estado='trial'` y `trial_ends_at >= today`). Super_admin siempre pasa.
- Trigger genérico `enforce_active_subscription()` BEFORE INSERT/UPDATE/DELETE en estas tablas tenant:
  `cobros, pagos, egresos, unidades, residentes, accesos, comunicados, incidencias, ordenes_mantenimiento, reservas, areas_comunes, proveedores, eventos_agenda, condominios (solo update/insert), vehiculos, personas_autorizadas, propiedades_interes, prospectos, actividades_crm, condominio_members`.
- Si no activa: `RAISE EXCEPTION 'Tu prueba terminó. Elige un plan para seguir usando Altura Cloud.'`
- SELECT no se toca → modo lectura natural.

## 5. UI: banner de trial + página de planes

- `getMyPlanUsage` devuelve también `{ estado, trial_ends_at, dias_restantes, activa }`.
- `PlanLimitsBanner`:
  - Si `estado='trial'` y quedan días: chip ámbar "Prueba gratis: X días restantes" + link "Ver planes".
  - Si expirada (`!activa`): banner rojo "Tu prueba terminó. La cuenta está en solo lectura." + CTA "Elegir plan".
- Nueva ruta `/planes` (bajo `_authenticated`): 3 tarjetas con precio, features y límites. Botón "Contactar" → `mailto:ventas@altura.cloud?subject=Plan {nombre}` (o número WhatsApp si el usuario lo da). Marca visualmente el plan actual.
- Link a `/planes` desde sidebar (sección Administración) y desde el banner.

## 6. Admin panel: activar suscripción manualmente

`admin-panel.tsx` ya tiene `updateSuscripcionEstado`. Agregar opción "activa" + permitir limpiar `trial_ends_at` (lo manejo en `updateSuscripcionEstado`: si `estado='activa'`, setea `trial_ends_at = null`). Así, cuando un cliente paga y avisa, super_admin lo activa en 2 clicks.

## Detalles técnicos

- Migraciones SQL: agregar columna profiles, redefinir 2 funciones, crear `is_subscription_active`, crear `enforce_active_subscription` + attach a las tablas listadas, backfill `plan_seleccionado='Lobby'` en profiles existentes que sean admin_condominio sin valor.
- Server fn `getMyPlanUsage`: añadir campos de trial al return.
- `login.tsx`: nuevo subcomponente PlanPicker visible solo si `signupRole==='admin_condominio'`.
- Nueva ruta `src/routes/_authenticated/planes.tsx`.
- `Sidebar`: agregar item "Planes".

## Fuera de alcance (no en este plan)

- Integración de Stripe / cobro automático.
- Recordatorios por email al acercarse el fin del trial.
- Cambio de plan auto-prorrateo.