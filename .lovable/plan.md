## Estado actual

Finanzas ya tiene: resumen con KPIs y gráfico 6m, tabla de cobros con filtros y marcar pagado, egresos básicos, estado de cuenta por unidad (CSV + imprimir), generador de cobros mensuales y recibo imprimible.

## Brechas detectadas

- No hay pagos parciales reales (el estado existe pero no se puede registrar abono).
- No hay recargo por mora ni job que mueva `pendiente → vencido`.
- Egresos sin comprobante (no hay storage), sin categorías predefinidas, sin presupuesto.
- Sin recordatorios a morosos (email/WhatsApp).
- Sin reportes contables: estado de resultados mensual, flujo de caja, top morosos, ingresos por concepto.
- Sin exportación masiva (todos los cobros/egresos a CSV).
- Sin filtros por rango de fechas ni por unidad en cobros.
- Sin pago en línea desde el recibo.

## Plan — 3 fases

### Fase 1 — Pagos avanzados y mora (prioridad alta)

**DB (migración)**
- Tabla `pagos(id, cobro_id, monto, metodo, referencia, fecha, registrado_por, comprobante_url, created_at)` con RLS vía `can_access_condominio` (join a `cobros`).
- Trigger en `pagos`: recalcula `cobros.estado` (`pagado` si suma ≥ monto, `parcial` si >0, sino sin cambio) y `cobros.fecha_pago` (última fecha cuando queda pagado).
- Función `marcar_cobros_vencidos()` SECURITY DEFINER que setea `estado='vencido'` donde `estado='pendiente'` y `fecha_vencimiento < CURRENT_DATE`. Programada con `pg_cron` diaria (o ejecutada on-demand desde el resumen).
- Columnas en `condominios`: `recargo_mora_pct numeric default 0`, `dias_gracia int default 5`. Cálculo de recargo se hace en el cliente al mostrar (no muta cobro).

**Frontend**
- Nuevo diálogo `RegistrarPagoDialog` desde la tabla: monto, método, referencia, fecha, subir comprobante. Reemplaza el botón "marcar pagado" (que ahora abre el diálogo prellenado con el monto pendiente).
- En `CobrosTable`: filtro por rango de fechas, filtro por unidad, columna "abonado/saldo".
- Detalle de cobro: lista de pagos asociados con opción de anular.
- Botón "Marcar vencidos" en el resumen que llama la función SQL.

### Fase 2 — Egresos profesionales y comprobantes (prioridad media)

**DB**
- Bucket de storage `comprobantes` (privado) con políticas: insert/select si `can_access_condominio` del egreso/pago dueño del archivo (estructura `{condominio_id}/{egreso_id}/{file}`).
- Tabla `presupuestos(id, condominio_id, anio, mes, categoria, monto)` para presupuesto vs real.
- Catálogo `categorias_egreso` (semilla: Mantenimiento, Servicios, Seguridad, Limpieza, Administración, Reparaciones, Áreas comunes, Otros). O lista fija en frontend.

**Frontend**
- `EgresoFormDialog`: upload de comprobante (imagen/PDF), categoría desde catálogo fijo, proveedor desde tabla `proveedores`.
- Vista de presupuesto mensual: barra de avance por categoría (real / presupuestado).
- Exportar todos los egresos del periodo a CSV con filtros.

### Fase 3 — Reportes y recordatorios (prioridad media)

**Server function** `enviar_recordatorios_morosos(condominio_id, canal: 'email'|'whatsapp')`:
- Consulta cobros vencidos con residente, genera plantilla con saldo y link al portal/recibo, envía vía Resend (email) o registra en `comunicados` para envío manual de WhatsApp.

**Frontend — nueva tab "Reportes financieros"**
- Estado de resultados mensual (ingresos por concepto, egresos por categoría, utilidad).
- Flujo de caja: tabla de movimientos diarios con saldo acumulado.
- Top 10 morosos con monto total y días.
- Ingresos por concepto (donut/bar).
- Exportar cada reporte a CSV/PDF (impresión).

**Recibos**
- Botón "Compartir recibo" en `recibo.$cobroId.tsx` (copiar link público).
- (Opcional, requiere Stripe) Botón "Pagar en línea" que crea Payment Link.

## Detalles técnicos

- Trigger de pagos: `AFTER INSERT/DELETE/UPDATE OF monto` recalcula con `SUM(monto)` agrupado.
- Storage policy ejemplo: `bucket_id = 'comprobantes' AND can_access_condominio((storage.foldername(name))[1]::uuid)`.
- Recargo en cliente: `monto * (recargo_mora_pct/100) * max(0, dias_mora - dias_gracia) / 30`.
- `pg_cron` se programa con `SELECT cron.schedule(...)` en migración; si la extensión no está, se omite y queda botón manual.
- Email vía Resend requiere `RESEND_API_KEY` (lo pediré al llegar a Fase 3).

## Recomendación

Empezar por **Fase 1** sola: es la que más valor entrega (pagos parciales + estado vencido correcto) y desbloquea el resto. ¿Aprobás Fase 1 para arrancar?
