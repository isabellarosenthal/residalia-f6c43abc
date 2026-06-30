## Referidos por agencias en unidades en renta/venta

### Schema (`unidades`)
Agregar columnas:
- `referido_renta_nombre text` — persona o agencia que refirió la unidad para renta.
- `referido_renta_agencia text` — nombre de la agencia.
- `referido_renta_url text` — link (sitio web, listing).
- `referido_venta_nombre text`
- `referido_venta_agencia text`
- `referido_venta_url text`

### UI — `UnidadFormDialog.tsx`
Nueva sección colapsable **"Referido por (agencia de bienes raíces)"** con dos bloques:
- **Renta** (visible cuando `precio_renta > 0` o `estado_comercial` incluye renta): nombre, agencia, link.
- **Venta** (visible cuando `precio_venta > 0` o estado incluye venta): nombre, agencia, link.
Validar URL básica (debe iniciar con http(s)://).

### UI — `UnidadesTable.tsx` / detalle
Mostrar badge "Ref: {agencia}" con `<a target="_blank">` cuando la unidad tiene referido en renta o venta, junto al precio correspondiente.

### Queries
Actualizar tipo `Unidad` y `useSaveUnidad` para incluir los 6 campos nuevos.