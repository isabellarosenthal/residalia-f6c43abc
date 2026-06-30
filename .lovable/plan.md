## Acceso Rápido para delivery y transporte

Agregar botones de un solo toque para generar pases QR temporales pre-llenados para servicios comunes: **Rappi, Uber Eats, PedidosYa, Uber, DiDi, InDriver**.

### 1. Portal de residente (`src/routes/portal.index.tsx`)

Nueva tarjeta "Acceso Rápido" debajo del QR rotativo:
- Grid de 4 íconos a color (bolsa naranja, comida verde, cubiertos rojo, carro azul) — estilo de la referencia.
- Tap = genera pase inmediato con:
  - `visitante_nombre`: "Rappi" / "Uber Eats" / etc.
  - `tipo`: `delivery` (Rappi/UberEats/PedidosYa) o `transporte` (Uber/DiDi/InDriver)
  - `fecha_entrada`: ahora
  - `fecha_salida_esperada`: +2 horas
  - `usos_maximos`: 1
- Tras crear, abrir directamente el modal/pase con QR para enseñar al guardia.
- Toast de confirmación.

### 2. Admin → Registrar acceso (`src/components/accesos/AccesoFormDialog.tsx`)

Fila de chips "Acceso Rápido" arriba del formulario:
- Mismos 6 servicios.
- Tap rellena `visitante_nombre`, `tipo`, y duración esperada — el admin solo confirma y guarda.

### 3. Componente compartido

Crear `src/components/accesos/QuickAccessButtons.tsx` con la lista de servicios + íconos (lucide: `ShoppingBag`, `UtensilsCrossed`, `Bike`, `Car`) y colores. Reutilizado en ambos lados.

### Notas

- Sin cambios de schema — usa la tabla `pases`/`accesos` existente.
- Sin logos de marca (evita problemas de trademark) — íconos genéricos coloreados.
- Lista de servicios hardcodeada por ahora; configurable después si se pide.
