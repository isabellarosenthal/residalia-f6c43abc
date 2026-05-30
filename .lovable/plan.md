
## 1. Promover isabella@zafra.cloud a super_admin

Migración rápida: borrar roles previos del usuario y asignarle `super_admin` en `user_roles`.

## 2. Soporte multi-edificio en el portal del residente

**Problema actual:** `residentes.user_id` permite vincular un solo registro a la vez. Si el mismo email/usuario es residente en 2 edificios con administraciones distintas, hoy el código solo muestra uno.

**Solución:** ya soportamos múltiples filas en `residentes` con el mismo `user_id` (una por edificio). Falta UI y lógica:

### a) Detectar "email ya usado en otro edificio" al crear residente
En `src/components/residentes/ResidenteFormDialog.tsx` (o donde el admin agrega residentes): antes de insertar, consultar si existe otro `residentes` con el mismo email en otro condominio. Si existe, mostrar diálogo:

> "Este correo ya está registrado como residente en otro edificio. ¿Deseas vincularlo también a este edificio? El residente podrá cambiar entre ambos desde su portal."

Al confirmar: insertar nueva fila en `residentes` con el mismo email + `user_id` (si ya tiene cuenta) en el nuevo condominio/unidad.

### b) Selector de edificio en el portal
- Nuevo hook `useMisResidencias()` → devuelve **todas** las filas de `residentes` del usuario actual (`user_id = auth.uid()`) con su condominio y unidad.
- Contexto `PortalCondominioContext` que guarda el `residenteId` activo en `localStorage`.
- En `src/routes/portal.tsx` header: si hay >1 residencia, mostrar dropdown (shadcn `Select`) "Edificio: [Torre A ▾]" para cambiar.
- Refactorizar `useMiResidente()` y `useMisPases()` para que filtren por el residente activo del contexto, no el primero que encuentren.
- Todas las queries del portal (pases, cuenta, reservas, anuncios) usan el `condominio_id` del residente activo.

### c) Vinculación retroactiva al hacer signup con invitación
`handle_new_user` ya vincula via invitación. Si el usuario ya existe y recibe nueva invitación para otro edificio, la pantalla de "aceptar invitación" debe insertar/actualizar la fila correspondiente sin tocar las otras.

## Archivos a tocar

- Migración: promover isabella a super_admin
- `src/lib/queries.ts` — añadir `useMisResidencias`, ajustar `useMiResidente`/`useMisPases` para aceptar `residenteId` activo
- `src/lib/portal-context.tsx` (nuevo) — contexto del residente activo
- `src/routes/portal.tsx` — selector en header + provider
- `src/routes/portal.index.tsx`, `portal.cuenta.tsx`, `portal.nuevo.tsx`, `portal.reservar.tsx`, `portal.anuncios.tsx` — usar contexto
- `src/components/residentes/ResidenteFormDialog.tsx` — detección de email duplicado + diálogo de confirmación

## Pregunta abierta

Cuando el admin agrega un residente con email que ya existe en otro edificio: ¿siempre pedir confirmación, o solo avisar e insertar? Por defecto propongo **pedir confirmación** para evitar errores.
