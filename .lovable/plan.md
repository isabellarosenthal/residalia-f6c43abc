## Objetivo
Permitir que al crear/editar un residente tipo "inquilino", se le vincule a un propietario existente de la misma unidad/edificio como su "relacionado" (hijo/adicional del propietario).

## Cambios

### 1. Base de datos (migración)
- Agregar columna `relacionado_id uuid` a `public.residentes` con FK a `public.residentes(id) ON DELETE SET NULL`.
- Índice en `relacionado_id`.

### 2. Formulario `ResidenteFormDialog.tsx`
- Agregar campo opcional **"Propietario asociado"** (Select) que solo aparece cuando `tipo = inquilino`.
- Cargar lista de propietarios del edificio seleccionado (filtrado opcional por la unidad seleccionada si hay una).
- Guardar `relacionado_id` junto con el resto del residente.
- En edición precargar el valor.

### 3. `src/lib/queries.ts`
- Extender tipo `Residente` y el payload de `useSaveResidente` con `relacionado_id`.
- Helper `usePropietarios(condominioId, unidadId?)` para alimentar el select.

### 4. Tabla `ResidentesTable` (visual ligero)
- En la fila de un inquilino, mostrar bajo el nombre un badge "↳ asociado a {Nombre Propietario}" cuando exista `relacionado_id`. Sin cambios de columnas.

## Notas
- Solo inquilinos pueden tener propietario asociado; si el usuario cambia el tipo a propietario, el campo se limpia.
- No se modifican RLS (la columna hereda las policies de la tabla).
