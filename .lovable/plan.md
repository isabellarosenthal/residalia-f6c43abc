# Completar módulos existentes

Pago manual, notificaciones solo in-app, storage solo para propiedades y logos. Sin pasarela, sin email/WhatsApp por ahora.

## 1. Finanzas
- **Estado de cuenta por unidad/residente**: saldo, vencidos, próximos, historial — exportable a CSV/PDF.
- **Mora automática**: campo `dias_mora` calculado; badge "Vencido"; filtro "Solo morosos".
- **Recordatorios in-app**: bandeja de notificaciones (campana en topbar) con cobros próximos a vencer y vencidos.
- **Recibo imprimible**: vista de un cobro pagado en formato recibo (print-friendly).
- **Generación masiva mejorada**: previsualizar antes de crear, evitar duplicados del mismo mes/concepto.

## 2. Residentes
- **Personas autorizadas**: tab dentro del detalle del residente para agregar/quitar (tabla `personas_autorizadas`).
- **Vehículos**: tab con placa/marca/modelo (tabla `vehiculos`).
- **Vincular a cuenta de usuario**: botón "Invitar a portal" que asocia `user_id` cuando el residente se registra con ese email.
- **Vista detalle** unificada (hoy solo hay tabla + form).

## 3. Accesos
- **QR real**: generar QR con `qr_code` único al crear pase; vista pública `/pase/:qr` para mostrar.
- **Registro entrada/salida**: botones en la tabla para marcar `fecha_entrada`/`fecha_salida`, incrementar `usos_actuales`.
- **Validación**: bloquear si excede `usos_maximos` o `minutos_max_estadia`.
- **Filtros**: hoy/semana, activos/expirados, por tipo.

## 4. Áreas comunes
- **Reglas de reserva**: anticipación mínima/máxima, duración máx, capacidad — guardarlas en `areas_comunes` (requiere migración: `anticipacion_min_horas`, `duracion_max_horas`).
- **Detección de conflictos**: validar solape antes de insertar reserva.
- **Calendario semanal** del área seleccionada.
- **Cancelación** con motivo y estado `cancelada`.

## 5. CRM (Propiedades / Pipeline / Prospectos)
- **Matching prospecto ↔ unidad**: en detalle de prospecto, listar unidades que cumplen presupuesto/zona/tipo; botón "Marcar interés" → `propiedades_interes`.
- **Galería de fotos** de la unidad (storage).
- **Vista pública compartible** de la unidad `/propiedad/:id` (sin login) para enviar a prospectos.
- **Actividades CRM**: timeline en detalle de prospecto con llamadas/visitas/notas (tabla `actividades_crm` ya existe; falta UI completa).

## 6. Reportes
- **Filtro rango de fechas custom** (hoy es solo selector limitado).
- **Comparativa** mes vs mes anterior, año vs año.
- **Export PDF** (no solo CSV) usando `window.print` con CSS print.

## 7. Configuración
- **Miembros del condominio**: gestión real de `condominio_members` (invitar por email, asignar rol, remover).
- **Branding**: subir logo del condominio (storage), color primario.
- **Datos del condominio**: extender form actual con todos los campos.

## 8. Transversal
- **Storage buckets**: `propiedades-fotos` (público), `condominio-logos` (público) con RLS de escritura por miembros del condominio.
- **Notificaciones in-app**: tabla `notificaciones` (user_id, tipo, mensaje, link, leido), campana en topbar, generadas automáticamente por triggers (cobro vencido, nueva reserva, etc.).
- **Hooks/queries** nuevos en `src/lib/queries.ts` para todo lo anterior.

## Detalles técnicos
- **Migraciones nuevas**:
  - `areas_comunes`: añadir `anticipacion_min_horas`, `duracion_max_horas`, `costo_reserva`.
  - `accesos`: nada nuevo, ya tiene todo.
  - Nueva tabla `notificaciones` con RLS por `user_id`.
  - Buckets storage + políticas RLS por membresía de condominio.
  - Trigger para crear notificación al vencer cobro (job diario vía `pg_cron` o cálculo en query — preferir cálculo en query para no añadir cron).
- **Server functions**: ninguna nueva imprescindible — todo sigue con cliente Supabase + RLS (patrón actual del proyecto). Si hace falta lógica privilegiada (invitar usuario por email), se añadirá un `createServerFn` puntual.
- **UI**: respetar el design system actual (tokens en `styles.css`, componentes `ui-pentos`).
- **Ejecución**: un módulo por turno para mantener cambios revisables. Empezamos por **Finanzas**.

¿Procedo con el módulo Finanzas?
