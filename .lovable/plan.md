## Rediseño Admin Panel + gestión de suscripciones

### 1. Rediseño visual (claro, en línea con el resto de la app)
- Reemplazar el fondo negro/gradiente por el tema claro estándar del sistema (`bg-background`, `text-foreground`, tokens semánticos de `src/styles.css`).
- Tarjetas con `bg-card`, `border-border`, sombras suaves; acentos con `primary` en vez de naranja hardcoded.
- Mismo header y sidebar que el resto del dashboard (no header aparte), agregando "Admin Panel" como sección dentro del layout existente.

### 2. Nueva sección: Gestión de Suscripciones
Tabla principal con TODOS los condominios (no solo recientes), con columnas:
- Nombre / Ciudad / Admin (email)
- Plan actual (badge)
- Estado suscripción (activa / pausada / cancelada)
- Unidades / Residentes
- Fecha alta
- **Acciones**: cambiar plan, pausar/activar, revocar acceso

Acciones disponibles por fila:
- **Cambiar plan**: dropdown con planes (Free/Pro/Enterprise) → actualiza `suscripciones.plan_id`
- **Pausar / Reactivar**: cambia `suscripciones.estado` entre `activa` y `pausada`
- **Revocar acceso**: marca `condominios.activo = false` (impide login del admin)
- **Restaurar acceso**: `activo = true`

### 3. Gestión de Planes (sección colapsable)
- Listar planes existentes con precio, max_unidades, max_residentes
- Editar precio y límites inline
- Activar/desactivar plan

### 4. Backend (server functions nuevos)
En `src/lib/admin-stats.functions.ts` agregar:
- `listSuscripciones()` → lista completa con joins (condominio + admin + plan + counts)
- `updateSuscripcionPlan({ condominio_id, plan_id })`
- `updateSuscripcionEstado({ condominio_id, estado })`
- `toggleCondominioActivo({ condominio_id, activo })`
- `listPlanes()` / `updatePlan({ id, precio_mensual, max_unidades, max_residentes, activo })`

Todos protegidos con `requireSupabaseAuth` + check de `super_admin` vía `has_role`.

### 5. Estructura de la página
```text
┌─ Resumen (stats cards — tema claro) ─┐
├─ Distribución por plan ──────────────┤
├─ Signups últimos 30 días ────────────┤
├─ GESTIÓN DE SUSCRIPCIONES ───────────┤
│  Tabla con acciones por fila          │
├─ PLANES ─────────────────────────────┤
│  Editar precios y límites             │
└──────────────────────────────────────┘
```

### Archivos a tocar
- `src/routes/admin-panel.tsx` — rediseño completo + nuevas secciones
- `src/lib/admin-stats.functions.ts` — agregar server functions de gestión
- Nuevos componentes: `src/components/admin/SuscripcionesTable.tsx`, `src/components/admin/PlanesEditor.tsx`
