# Mejoras a lo que ya tenemos

Foco: pulir y potenciar módulos ya construidos, más el nuevo de **turnos y rondines de guardias** (que te gustó). Sin agregar módulos nuevos grandes.

## Fase A — Guardias: turnos + rondines (lo nuevo que pediste)

**Turnos de guardia**
- Nueva tabla `guardia_turnos`: guardia (user_id), edificio, fecha, hora_inicio, hora_fin, estado (programado / en_curso / completado / ausente).
- Vista en `/guardia` (portal del guardia): "Mi turno de hoy" con botón **Iniciar turno** y **Cerrar turno** (registra timestamps reales).
- Vista admin en `/accesos` (nueva tab "Turnos"): calendario semanal de quién cubre qué, asignar/editar turnos, marcar ausencias.

**Rondines (patrol checkpoints)**
- Tablas: `puntos_rondin` (nombre, ubicación/QR code por edificio) y `rondines_log` (turno_id, punto_id, timestamp, foto_opcional, notas).
- Admin: crear puntos de control (genera QR imprimible para pegar en azotea, sótano, lobby, etc.).
- Guardia: escanea el QR desde `/guardia` → registra paso con hora, opcional foto/nota.
- Reporte: línea de tiempo del rondín del turno + alerta si faltó algún punto.

## Fase B — Potenciar módulos existentes (quick wins de alto impacto)

**Dashboard**
- Widgets accionables (no solo números): "5 cobros vencen esta semana", "2 incidencias sin asignar", "Turno de guardia sin cubrir mañana" → clic lleva al módulo filtrado.
- Gráfico de recaudación últimos 6 meses (ya hay datos, falta visual).

**Finanzas**
- Recordatorios automáticos de morosos (cron diario que ya podemos enganchar) con WhatsApp link prellenado.
- Exportar estado de cuenta a PDF por unidad (ya tenés `EstadoCuentaUnidad`, falta botón de descarga).
- Vista "Top morosos" ordenada por monto + días vencidos.

**Accesos**
- Notificación push/email al residente cuando llega su visita y el guardia escanea el QR.
- Historial visual por unidad: "Visitas de los últimos 30 días" con gráfica.
- Lista negra / personas bloqueadas a nivel edificio.

**Residentes**
- Estado de cuenta inline en `ResidenteDetailDialog` (saldo, último pago, próximo vencimiento).
- Bulk import desde CSV/Excel (hoy es uno por uno).
- Reenvío de invitación si expiró, con un clic.

**Áreas comunes / Reservas**
- Bloqueos por mantenimiento (admin marca el área no disponible en rango de fechas).
- Reglas: máx X reservas por residente/mes, anticipación mínima/máxima.
- Confirmación automática vs requiere aprobación admin (toggle por área).

**Comunicaciones**
- Segmentación: enviar comunicado solo a torre A, solo a morosos, solo a propietarios.
- Confirmación de lectura (quién abrió el comunicado).

**Mantenimiento**
- Foto adjunta en incidencias (residente reporta con foto desde portal).
- Estados con SLA: alerta si una incidencia urgente lleva >24h sin atender.

**Portal residente**
- Centro de notificaciones (visitas que llegaron, anuncios, cobros nuevos).
- Reservar área común desde el portal (hoy creo que solo admin lo hace fluido).

## Sugerencia de orden

1. **Fase A completa** (guardias turnos + rondines) — es lo que más te emocionó y es diferenciador real.
2. **Dashboard accionable + Finanzas recordatorios/PDF** — impacto inmediato visible al admin.
3. **Accesos notificaciones + Portal notif center** — cierra el loop residente↔guardia↔admin.
4. El resto en orden que prefieras.

¿Arrancamos por **Fase A** completa, o querés que primero haga solo turnos (sin rondines) para validar y luego rondines aparte?
