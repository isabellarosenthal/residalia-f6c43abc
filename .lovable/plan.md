
## Objetivo
1. Importación masiva de residentes desde CSV con plantilla descargable.
2. Mostrar relaciones (afiliados) dentro de la unidad.
3. Cuando se asigna propietario o inquilino en la unidad, agregar tabs con la info completa del residente.

---

## 1. Importación masiva de residentes (CSV)

**Ubicación**: botón "Importar CSV" en `src/routes/residentes.tsx`, junto a "Nuevo residente".

**Plantilla descargable** (`plantilla-residentes.csv`) con columnas:
- `nombre` *(requerido)*
- `apellido` *(requerido)*
- `tipo` → `propietario` | `inquilino` | `familiar` *(default: propietario)*
- `unidad_numero` → número de apartamento, o `bloque-lote` (ej. `B2-15`). Se busca/empareja contra `unidades.numero` del edificio.
- `piso` *(opcional, informativo si la unidad no existe aún)*
- `email`
- `telefono`
- `telefono_alt`
- `dni`
- `recargo_mora_pct` *(opcional)*
- `relacionado_con` *(opcional)* → `email` o `nombre apellido` del titular al que se afilia (para inquilinos/familiares).

**Diálogo de importación** (`BulkImportResidentesDialog.tsx`):
- Paso 1: descargar plantilla + seleccionar archivo `.csv`.
- Paso 2: vista previa en tabla, validación fila por fila (badges OK / Error / Aviso, errores en rojo).
- Paso 3: confirmar importación.
- Procesamiento en 2 pasadas: primero crea/upsert de titulares, luego afiliados con `relacionado_id` resuelto.
- Vincula `unidad_id` por `numero` dentro del `condominio_id` actual; si no existe la unidad, queda nulo y se reporta.
- Resultado final: toast con `creados / actualizados / errores`.

**Parser**: `papaparse` (ya tiende a estar en proyectos similares; se instala si no está). Sin cambios de esquema en DB.

---

## 2. Relaciones / afiliados dentro de la unidad

En `UnidadFormDialog.tsx`, dentro del tab **Administración** debajo de propietario/inquilino, agregar bloque **"Personas en esta unidad"**:
- Lista de residentes cuyo `unidad_id = unidad.id`, separados por tipo (Propietario, Inquilino, Familiares/Afiliados).
- Cada fila muestra nombre + email + teléfono + tipo + badge "Afiliado a …" si tiene `relacionado_id`.
- Solo lectura desde el diálogo de unidad (edición se hace en módulo Residentes).

---

## 3. Tabs dinámicos con info del residente asignado

En `UnidadFormDialog.tsx`, los tabs se vuelven dinámicos:
- Siempre: **Datos generales**, **Administración**.
- Si hay `propietario_id` seleccionado → agrega tab **Propietario** con: nombre, apellido, DNI, email, teléfono, teléfono alt, fecha de ingreso, recargo mora %, foto si existe, link a "Ver/editar en Residentes".
- Si hay `inquilino_id` → agrega tab **Inquilino** con la misma estructura.
- Si el residente tiene `relacionado_id`, mostrar al titular vinculado.
- Los tabs se actualizan al cambiar el select (sin guardar todavía); datos se obtienen del array `residentes` ya cargado por `useResidentes()`.

---

## Archivos a tocar
- `src/routes/residentes.tsx` — botón "Importar CSV".
- `src/components/residentes/BulkImportResidentesDialog.tsx` *(nuevo)*.
- `src/lib/residentes-import.ts` *(nuevo)* — parser + validación + lógica de upsert en 2 pasadas.
- `src/components/unidades/UnidadFormDialog.tsx` — tabs dinámicos + bloque "Personas en esta unidad".
- `package.json` — agregar `papaparse` si falta.

Sin migraciones de base de datos.
