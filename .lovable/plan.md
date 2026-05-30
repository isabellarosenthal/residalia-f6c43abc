## Nuevos planes (fuente única)

| Plan | Precio | Edificios | Unidades/edificio | Admins |
|---|---|---|---|---|
| Lobby | L 990 | 1 | 60 | 2 |
| Torre | L 2,490 | 3 | 150 | 5 |
| Penthouse | L 4,990 | ∞ | ∞ | ∞ |

## Cambios

**1. Migración BD (`planes`)**
- Agregar columnas `max_edificios int`, `max_admins int` (nullable = ilimitado).
- Renombrar concepto: `max_unidades` pasa a significar "unidades por edificio".
- Actualizar filas:
  - Lobby → precio 990, max_edificios 1, max_unidades 60, max_admins 2
  - Torre → precio 2490, max_edificios 3, max_unidades 150, max_admins 5
  - Penthouse → precio 4990, max_edificios NULL, max_unidades NULL, max_admins NULL
- Quitar `max_residentes` (ya no se usa en la nueva matriz).

**2. Landing — `src/components/landing/LandingPage.tsx`**
- Actualizar array `PLANS`: precios (990/2490/4990) y nuevos límites (edificios, unidades/edif, admins) en cada `limits[]`.

**3. Admin Panel — `src/routes/admin-panel.tsx`**
- `PlanesSection`: mostrar Precio, Edificios, Unidades/edificio, Admins en lugar de Unidades/Residentes.
- Actualizar tipo `FullPlan` y el `<select>` de plan en `SuscripcionesSection` (sigue mostrando `nombre — L{precio}`).

**4. Server fn — `src/lib/admin-stats.functions.ts`**
- `listPlanes` y `listSuscripciones`: incluir `max_edificios` y `max_admins` en el SELECT.
- Quitar referencias a `max_residentes`.

**5. Tipos Supabase**
- Se regeneran automáticamente tras la migración.

## Fuera de alcance
No se aplican aún los límites en runtime (bloquear creación al pasar el tope) — eso requiere lógica adicional en creación de edificios/unidades/invitaciones. Si lo quieres, lo hacemos en un paso siguiente.