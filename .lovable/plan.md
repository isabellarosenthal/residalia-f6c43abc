
## Objetivo
Agregar en `/configuracion` un panel con el plan actual del admin y contadores de cuánto le queda disponible según los límites del plan.

## Qué se va a mostrar
En un nuevo tab **"Mi Plan"** (o card destacada arriba del tab Usuarios), mostrar:

- **Plan actual** (nombre + precio mensual)
- **Edificios**: `usados / max` + "Puedes crear X edificios más"
- **Administradores**: `usados / max` + "Puedes invitar a X admins más" (por edificio seleccionado)
- **Unidades**: `usados / max` + "Puedes crear X unidades más" (por edificio seleccionado)
- Botón "Actualizar plan" → navega a landing/pricing

## Implementación

1. **Nuevo server function** `src/lib/plan-usage.functions.ts` con `getMyPlanUsage`:
   - Usa `requireSupabaseAuth`
   - Lee `get_admin_plan_limits(userId)` → max_edificios, max_unidades, max_admins
   - Cuenta `condominios` del admin → edificios usados
   - Para cada condominio: cuenta `unidades` y `condominio_members` con role in ('admin','owner')
   - Devuelve: `{ plan: {nombre, precio}, edificios: {used, max}, porEdificio: [{id, nombre, unidades:{used,max}, admins:{used,max}}] }`

2. **Editar `src/routes/configuracion.tsx`**:
   - Agregar tab "Mi Plan" con icono `Crown` o `Gem`
   - Componente `MiPlanTab` que llama al server fn vía `useQuery`
   - Renderiza cards con `Progress` bars (shadcn) mostrando uso vs límite
   - Texto claro: "Puedes crear N edificios más", etc.
   - Si `max` es ilimitado (null en BD → 2147483647), mostrar "Ilimitado"

## Archivos
- crear: `src/lib/plan-usage.functions.ts`
- editar: `src/routes/configuracion.tsx`

Sin cambios de BD — los límites ya existen en `planes` y las funciones SQL ya están.
