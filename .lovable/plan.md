# Portal de residentes y rol guardia

## 1. Base de datos

- Agregar valor `guardia` al enum `app_role`.
- Tabla `residentes`: ya tiene `user_id`. Asegurar índice y permitir auto-vincular por email en signup.
- Trigger / función `handle_new_user`: si el `raw_user_meta_data.role` es `residente` o `guardia`, asignar ese rol (ya soporta override).
- Nueva función SQL `mis_condominios()` security definer: devuelve los `condominio_id` donde el `auth.uid()` está en `residentes.user_id` (para que el residente pueda insertar `accesos` y `can_access_condominio` lo permita vía nueva rama en la función) → ampliar `can_access_condominio` para incluir: `EXISTS (SELECT 1 FROM residentes r WHERE r.user_id = auth.uid() AND r.condominio_id = _condo_id)`.
- Política adicional en `accesos` (insert/select): el residente solo puede insertar pases para su `condominio_id`/`unidad_id` y ver los suyos (`autorizado_por = auth.uid()`).

## 2. Roles y guards de rutas

- `src/lib/auth-context.tsx`: exponer `role` actual del usuario.
- Layouts:
  - `/portal/*` → solo residentes autenticados.
  - `/guardia/*` → solo rol guardia (o admin).
  - Admin existente sigue igual.
- Redirect post-login según rol: residente → `/portal`, guardia → `/guardia`, otros → `/`.

## 3. Páginas nuevas

**Residente (`/portal`)**
- `/portal` — lista de sus pases activos + botón "Crear pase".
- `/portal/nuevo` — formulario simplificado: nombre del visitante, tipo (visita/delivery/proveedor), fecha entrada, salida opcional, usos. Auto-fija `condominio_id` y `unidad_id` desde su registro de residente. Genera código `PASE-XXXXXX`. Muestra QR/código al final para compartir.
- `/portal/pase/:id` — vista del pase con QR grande para mostrar al guardia.

**Guardia (`/guardia`)**
- `/guardia` — dashboard simple: lista de pases del día del edificio + acceso rápido a validar.
- Reutiliza el componente de `/accesos/validar` (ya existe). Solo cambia el shell/nav.

## 4. Signup

- En `/login` agregar tab "Soy residente" que registra con `role: 'residente'` en metadata.
- El admin (desde `/residentes`) puede invitar a un residente por email; al hacer signup con ese email, un trigger vincula `residentes.user_id` automáticamente (match por email).

## 5. Navegación

- Sidebar admin: agregar enlace "Portal residente" y "Vista guardia" (solo visibles si rol corresponde).
- Topbar: mostrar rol actual.

## 6. Notas técnicas

- Todo cliente Supabase normal (RLS hace el filtrado). No se requieren server functions.
- El formulario del portal usa los mismos hooks (`useSaveAcceso`) pero con campos pre-llenados y deshabilitados.
- Validación de horarios de área NO aplica aquí (es para reservas, no accesos).
