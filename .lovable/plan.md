## Validar horario disponible del área al reservar

Cada área tiene `horario_inicio` y `horario_fin`. Hoy la reserva no valida que la hora elegida esté dentro de ese rango (solo valida solapamiento con otras reservas).

### Cambios

**1. `ReservaFormDialog.tsx`** — extender `conflicto` para incluir validación de horario:
- Si el área tiene `horario_inicio`/`horario_fin`, comprobar que la hora local de `fecha_inicio` ≥ `horario_inicio` y `fecha_fin` ≤ `horario_fin`.
- Soportar rangos que cruzan medianoche (ej. 18:00–02:00).
- Si no cumple, mostrar alerta roja y desactivar "Guardar" igual que con solapamientos. Mensaje: `"La Terraza solo está disponible de 08:00 a 22:00."`
- Mostrar el horario del área debajo del selector de área como ayuda visual.

**2. `ReservasCalendar.tsx`** — al hacer clic en una celda fuera del horario:
- Si hay filtro de área activo y el clic cae fuera del horario, mostrar un toast con el mensaje en vez de abrir el diálogo (o abrirlo igual y dejar que la validación lo bloquee). Propongo: abrir el diálogo, la validación bloquea el guardado.
- Opcionalmente sombrear las franjas fuera de horario (gris suave) cuando hay un área filtrada, para feedback visual inmediato.

### Notas
- No requiere cambios en BD ni en queries.
- Áreas sin horario configurado (`null`) siguen permitiendo cualquier hora.