
## Módulo Residentes (`/residentes`)

Reemplazar el placeholder por una vista funcional completa:

- **Listado** con búsqueda por nombre/DNI/teléfono, filtro por edificio (dropdown de `condominios`), filtro por tipo (propietario/inquilino/familiar) y estado (activo/inactivo).
- **Tarjeta/tabla por residente** mostrando: nombre, tipo, edificio y unidad asignada, teléfono, email, fecha de ingreso, badge de estado.
- **Crear / Editar residente** (diálogo): nombre, apellido, DNI, teléfono, teléfono alt., email, tipo, edificio (select de condominios), unidad (select dependiente del edificio, lista solo unidades de ese edificio), fecha de ingreso, foto opcional.
- **Eliminar / desactivar** residente.
- Al guardar un residente con unidad, también se actualiza la unidad correspondiente (`propietario_id` o `inquilino_id` según `tipo`) y se marca `estado_administrativo = 'ocupada'`.
- **Nueva pestaña "Residentes" en el detalle del edificio** (`/edificios/$id`) que muestra los residentes de ese edificio con acción rápida de agregar.

## Módulo Finanzas (`/finanzas`)

Vista con sub-pestañas, todas filtrables por edificio:

1. **Resumen** — KPIs: Ingresos del mes, Egresos del mes, Saldo neto, Morosidad (% y monto), Cobros pendientes. Gráfica de barras (recharts) ingresos vs egresos últimos 6 meses.
2. **Cobros** (`tabla cobros`) — Lista con concepto, unidad, residente, monto, vencimiento, estado (pendiente/pagado/vencido/parcial), método. Acciones: crear cobro, marcar como pagado (genera recibo numerado), editar, eliminar. Filtros por estado y rango de fechas. Botón "Generar cobros mensuales" que crea cobros automáticos a todas las unidades de un edificio usando `cuota_base` o `mantenimiento_mensual`.
3. **Egresos** (`tabla egresos`) — Lista con categoría, proveedor, descripción, monto, fecha, comprobante. Crear/editar/eliminar.
4. **Estado de cuenta por unidad** — Selector de edificio + unidad; muestra historial de cobros y saldo pendiente de esa unidad.

Selector global de edificio en la parte superior (persistido en URL search param `edificio`) que filtra todas las pestañas.

## Conexión entre módulos

- Edificios → cuenta de residentes y morosidad por edificio (KPIs nuevos en card de edificio).
- Unidad → en su panel de detalle, mostrar residente actual y últimos cobros.
- Residente → desde su tarjeta, link a su unidad y estado de cuenta.

## Cambios técnicos

- Ampliar `src/lib/queries.ts` con hooks: `useResidentesByEdificio`, `useSaveResidente`, `useDeleteResidente`, `useCobros(edificioId?, filtros)`, `useSaveCobro`, `useMarcarPagado`, `useDeleteCobro`, `useEgresos`, `useSaveEgreso`, `useDeleteEgreso`, `useGenerarCobrosMensuales`, `useEstadoCuentaUnidad`, `useFinanzasResumen(edificioId, mes)`.
- Nuevos componentes:
  - `src/components/residentes/ResidentesTable.tsx`, `ResidenteCard.tsx`, `ResidenteFormDialog.tsx`
  - `src/components/finanzas/FinanzasResumen.tsx`, `CobrosTable.tsx`, `CobroFormDialog.tsx`, `EgresosTable.tsx`, `EgresoFormDialog.tsx`, `GenerarCobrosDialog.tsx`, `EstadoCuentaUnidad.tsx`, `EdificioSelector.tsx`
- Reescribir `src/routes/residentes.tsx` y `src/routes/finanzas.tsx` con AppShell + lazy load de los diálogos pesados.
- Añadir pestaña Residentes en `src/routes/edificios.$edificioId.tsx`.
- No requiere migraciones — las tablas `residentes`, `cobros`, `egresos` ya existen con todas las columnas necesarias.

## Fuera de alcance (para no inflar el cambio)

- Generación de PDF de recibos (sólo número de recibo y marca de pagado).
- Subida de comprobantes a storage (sólo campo URL por ahora).
- Notificaciones automáticas de morosidad.
- Conciliación bancaria.

¿Procedo así, o querés ajustar algo (ej. omitir egresos, omitir la pestaña en el detalle del edificio, etc.)?
