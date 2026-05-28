## Problema

`/configuracion` → tab "Usuarios" hoy está bloqueada a `super_admin` y las RLS de `user_roles`/`profiles` también, así que un admin de su propio condominio no puede invitar a nadie. Además residentes se invitan por otro flujo (tabla `residentes`).

## Cambios

### 1. DB — función SECURITY DEFINER para asignar rol en un condominio

`public.assign_user_to_condominio(_email text, _role app_role, _condo_id uuid)`:
- Verifica `can_manage_condominio(_condo_id)` — si no, raise exception.
- Bloquea asignar `super_admin` desde aquí.
- Busca `profiles.id` por email. Si no existe → retorna `'pending'` (el usuario debe registrarse primero; al hacerlo, `handle_new_user` lo crea y luego se vuelve a llamar) — para simplicidad MVP devolvemos error claro "Usuario debe registrarse primero".
- Inserta/actualiza `user_roles(user_id, role)` (upsert por user_id).
- Inserta en `condominio_members(condominio_id, user_id, role='member')` on conflict do nothing.
- Retorna user_id.

`public.remove_user_from_condominio(_user_id uuid, _condo_id uuid)`:
- Verifica `can_manage_condominio`.
- Borra de `condominio_members`. (No toca `user_roles` — el rol global queda; opcionalmente borrar si no es miembro de otros condos.)

### 2. DB — RLS lectura para admin del condo

Política extra en `profiles` y `user_roles`: SELECT permitido si el usuario pertenece a un condominio que el caller `can_manage_condominio`. Implementado con función `public.shares_condominio_with(_target uuid)` SECURITY DEFINER que busca `condominio_members` en común entre caller y `_target`.

### 3. Frontend — `src/routes/configuracion.tsx`

- Quitar el gate `isSuper`. La tab "Usuarios" se muestra a `super_admin` y a `admin_condominio` (o cualquiera que tenga al menos un condo donde `admin_id = auth.uid()`).
- Sub-secciones dentro de Usuarios:
  - **Staff** (admin_condominio, junta_directiva, agente_inmobiliario, gerente_crm, guardia): selector de edificio (si tiene >1) + input email + select rol → llama RPC `assign_user_to_condominio`. Lista miembros de `condominio_members` con su rol global.
  - **Residentes**: link a `/residentes` (ahí ya se crean residentes con email; el trigger `handle_new_user` ya los auto-vincula al registrarse). No duplicar UI aquí.
- `super_admin` sigue viendo todos los usuarios globales como hoy.
- Quitar `super_admin` del select de roles para admins de condo (solo super puede asignar super).

### 4. Auth context

`useAuth` ya expone `role`. Añadir helper `canManageAnyCondo` (true si role ∈ {super_admin, admin_condominio} o si tiene condos donde `admin_id = uid`). Usarlo para mostrar la tab.

## Notas técnicas

- El alta de residente sigue como está: admin crea fila en `residentes` con email → residente hace signup en `/login` tab "Soy residente" → trigger `handle_new_user` setea `residentes.user_id`.
- Guardias y staff: admin los invita por email aquí; ellos hacen signup como admin (cualquier tab) → el RPC les sobreescribe el rol al asignado. Mejor: documentar que deben registrarse primero, luego el admin asigna.
- Las RLS nuevas usan SECURITY DEFINER para evitar recursión.
