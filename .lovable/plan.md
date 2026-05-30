# Plan

## 1. Restringir `/portal/*` a residentes y super_admin

En `src/routes/portal.tsx`, además de chequear `user`, validar `role`:
- Si `role === 'admin_condominio'` o `'junta_directiva'` o `'guardia'` o `'agente_inmobiliario'` → redirigir a `/` (dashboard admin).
- Permitir solo `role === 'residente'` y `role === 'super_admin'`.
- Si `role === null` (todavía cargando), esperar.

## 2. Crear tablas `planes` y `suscripciones`

Migración:
- `planes`: id, nombre (Free/Pro/Enterprise), precio_mensual, max_unidades, max_residentes, features (jsonb), activo.
- `suscripciones`: id, condominio_id, plan_id, estado (activa/cancelada/trial), fecha_inicio, fecha_fin, created_at.
- Seed: 3 planes default (Free, Pro, Enterprise).
- Auto-asignar plan Free a condominios existentes y nuevos (trigger).
- RLS: super_admin gestiona todo; admin del condominio ve su propia suscripción.
- GRANTs apropiados.

## 3. Nueva ruta `/admin-panel` (solo super_admin)

Archivo `src/routes/admin-panel.tsx`:
- `beforeLoad` valida que el usuario tenga rol `super_admin`, si no → redirige a `/`.
- Layout con header "Admin Panel" separado del sidebar normal.
- Server function `getPlatformStats` (con `requireSupabaseAuth` + check super_admin) que devuelve:
  - Totales: condominios, unidades, residentes, usuarios, pagos del mes, ingresos totales.
  - Distribución por plan (cuántos condominios en cada plan).
  - Lista de empresas/condominios recientes (nombre, admin, plan, # unidades, # residentes, fecha alta).
  - Signups últimos 30 días (gráfica simple).
  - Top condominios por uso.

## 4. Link al Admin Panel

En `src/components/layout/Sidebar.tsx`, mostrar entrada "Admin Panel" solo si `role === 'super_admin'`.

## Archivos

- `supabase/migrations/<timestamp>_planes.sql` (nuevo)
- `src/routes/portal.tsx` (editado — restricción de rol)
- `src/routes/admin-panel.tsx` (nuevo)
- `src/lib/admin-stats.functions.ts` (nuevo — server fn)
- `src/components/layout/Sidebar.tsx` (editado — link condicional)
