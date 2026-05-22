# Plan: Edificios + Unidades → Residentes

Construiré primero el módulo **Edificios + Unidades** (el core arquitectónico unificado), y luego **Residentes**. Ambos comparten la misma ficha de edificio.

---

## Fase 1 — Edificios + Unidades

### 1.1 Listado de Edificios (`/edificios`)
- Grid de cards de condominios con:
  - Placeholder de color + ícono (sin imágenes externas)
  - Nombre, tipo (edificio/residencial), ciudad
  - KPIs por edificio: total unidades, % ocupación administrativa, # en venta, # en renta
  - Badge de estado (activo)
- Botón "+ Nuevo edificio" → dialog con formulario (nombre, tipo, dirección, ciudad, departamento, moneda, cuota_base)
- Buscador + filtros (ciudad, tipo)
- Empty state si no hay edificios

### 1.2 Ficha del Edificio (`/edificios/$edificioId`)
Layout con tabs:
- **Resumen**: KPIs (ocupación admin, comercial, ingresos del mes, morosidad), datos generales editables, mini-tabla de últimas actividades
- **Unidades**: tabla/grid de todas las unidades del edificio
- **Configuración**: editar datos del edificio, eliminar

### 1.3 Tabla de Unidades dentro del Edificio
Columnas:
- Número / piso / tipo
- Habitaciones / baños / parqueos / m²
- **Estado administrativo** (badge: ocupada / disponible / vacía)
- **Estado comercial** (badge: ocupada / disponible / en_venta / en_renta / reservada / vendida / rentada)
- Propietario (nombre o "—")
- Inquilino (nombre o "—")
- Precio venta / renta (cuando aplique)
- Acciones: ver, editar, eliminar

Filtros: por estado admin, estado comercial, tipo, piso. Buscador por número.

Botón "+ Nueva unidad" + acción masiva "Generar unidades en bloque" (genera N unidades por piso).

### 1.4 Ficha de Unidad (`/edificios/$edificioId/unidades/$unidadId`)
Diálogo o sub-ruta con tabs:
- **Datos generales**: número, piso, tipo, habitaciones, baños, baños_visita, parqueos, m² construcción/terreno
- **Estado administrativo**: estado, propietario, inquilino, mantenimiento mensual, fecha disponibilidad
- **Estado comercial (CRM)**: estado comercial, precio venta, precio renta, depósito, negociable, descripción comercial, amenidades (chips), agente asignado, fecha publicación

Validación en tiempo real con react-hook-form + zod.

### 1.5 Componentes nuevos
- `src/components/edificios/EdificioCard.tsx`
- `src/components/edificios/EdificioFormDialog.tsx`
- `src/components/edificios/EdificioPlaceholder.tsx` (placeholder color + ícono)
- `src/components/unidades/UnidadesTable.tsx`
- `src/components/unidades/UnidadFormDialog.tsx`
- `src/components/unidades/EstadoBadge.tsx` (admin + comercial)
- `src/components/unidades/GenerarUnidadesDialog.tsx`

### 1.6 Rutas
- `src/routes/edificios.tsx` (listado) — reemplazar ComingSoon
- `src/routes/edificios.$edificioId.tsx` (ficha con tabs)
- Acceso CRUD directo via cliente Supabase del browser (RLS ya permite a authenticated)

---

## Fase 2 — Residentes

### 2.1 Listado (`/residentes`)
- Tabla con: avatar inicial (círculo #c94f0c), nombre, DNI, tipo (propietario/inquilino/familiar), edificio, unidad, teléfono, email, activo
- Filtros: edificio, tipo, activo
- Buscador por nombre / DNI / teléfono
- Botón "+ Nuevo residente"

### 2.2 Ficha del residente (dialog/drawer)
Tabs:
- **Datos**: nombre, apellido, DNI, tipo, teléfono, teléfono_alt, email, fecha_ingreso, activo
- **Asignación**: condominio + unidad (select dependiente)
- **Vehículos**: lista CRUD (placa, marca, modelo, color, año)
- **Personas autorizadas**: lista CRUD (nombre, relación, tipo_acceso)

### 2.3 Integración con Unidades
- Al asignar residente como `propietario` o `inquilino` de una unidad, actualizar `unidades.propietario_id` / `unidades.inquilino_id` y mover `estado_administrativo` a `ocupada` automáticamente.

### 2.4 Componentes
- `src/components/residentes/ResidentesTable.tsx`
- `src/components/residentes/ResidenteFormDialog.tsx`
- `src/components/residentes/VehiculosSection.tsx`
- `src/components/residentes/PersonasAutorizadasSection.tsx`
- `src/components/ui-pentos/AvatarInicial.tsx` (círculo naranja con iniciales)

---

## Stack técnico (resumen)
- React Hook Form + Zod para todos los formularios
- TanStack Query para fetch/cache/invalidación
- Acceso a Supabase desde el cliente browser (RLS ya configurada)
- Tabla = `@/components/ui/table` con sorting básico
- Diálogos con `Dialog` shadcn; formularios largos con `Sheet` (drawer derecho)
- Skeletons crema durante loading
- Toasts con `sonner` para feedback de mutaciones
- Sin imágenes externas, sin azul/teal/morado

## Orden de implementación
1. Listado Edificios + form crear/editar
2. Ficha Edificio con tabs (Resumen + Unidades + Config)
3. Tabla Unidades + form crear/editar (un solo dialog con tabs admin/CRM)
4. Generar unidades en bloque
5. Listado Residentes + form
6. Vehículos + Personas autorizadas
7. Sincronización automática residente ↔ unidad

¿Apruebas para implementar Fase 1 ahora? Luego paso a Fase 2.