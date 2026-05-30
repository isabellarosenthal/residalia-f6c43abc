## Landing: estilo Pibank + Poppins + cards con preview del dashboard

### 1. Tipografía → Poppins

`src/styles.css`:
- Reemplazar import de Outfit + Figtree por Poppins (400, 500, 600, 700, 800)
- `--font-sans: "Poppins"`, `--font-display: "Poppins"` (Pibank usa una sola fuente, navy bold)

### 2. Botones estilo Pibank (amarillo navy)

El amarillo SÍ se usa para CTAs — la clave es **texto navy sobre amarillo** (no blanco). Eso lee perfecto.

- Crear clases utilitarias o cambiar los CTAs principales: `bg-[#ffd60a] text-[#0a1e3f] hover:bg-[#ffe040]` (era `bg-[#0a1e3f] text-white`)
- Botones secundarios: `bg-white text-[#0a1e3f] border border-[#0a1e3f]` (estilo "Área cliente" de Pibank)
- Pills/CTAs aplican en: header nav ("Crear cuenta", "Ir al dashboard"), hero ("Crear mi cuenta gratis"), pricing cards, CTA final, "Saber más" en cards de features

Botones dentro del app/dashboard (no landing) los dejamos navy sólido para no rebrandar de nuevo todos los formularios.

### 3. Hero estilo Pibank

- Bloque amarillo grande detrás del título/stats con corner-radius asimétrico (top-left + bottom-right grandes). Contiene un stat principal (ej. "13+ módulos integrados", bullets blancos, CTA navy/blanco)
- Imagen del astronauta o condo grande al lado derecho, sin recorte
- Headline navy bold grande sin highlight amarillo (el bloque amarillo ya hace el contraste)

### 4. "Empieza a operar hoy mismo" — refinar

Mantener la estructura pero estilo Pibank:
- Número en círculo navy con texto blanco (ya está bien)
- Quitar emoji al lado del número (ruido visual) o reemplazar con icono lucide line-art en navy
- Subtítulo de "Cuatro pasos…" en gris más claro, tipografía más liviana

### 5. Última sección — Cards con preview del dashboard

Reemplazar el "Final CTA" simple por una sección estilo Docusign con **3 cards grandes** que muestren features reales del producto con mockup visual:

- **Card 1 — "Cobros en un clic"** (fondo `#fff8d6` amarillo suave)
  - Titulo navy + descripción
  - Link "Ver cobros →"
  - Mockup: tarjeta blanca con tabla de cobros (4 filas con monto en L, estado pagado/pendiente), tipo screenshot

- **Card 2 — "Accesos con QR"** (fondo navy `#0a1e3f`, texto blanco, acento amarillo)
  - Mockup: tarjeta blanca con QR estilizado + datos del visitante

- **Card 3 — "Pipeline inmobiliario"** (fondo `#fffdf5`)
  - Mockup: 3 columnas kanban (Nuevo → Visita → Cierre) con tarjetas de prospectos

Los mockups son HTML/JSX puro (no imágenes generadas) — divs con shadcn-style: header, filas con avatares iniciales, badges de estado, montos. Estilo del dashboard real para que el usuario reconozca el producto.

Debajo de las cards: CTA grande estilo Pibank ("Empezar ahora" pill amarillo con texto navy).

### Fuera de alcance

- No tocar dashboard ni admin (solo landing)
- No regenerar logo
- No cambiar paleta de tokens (solo uso de amarillo en botones de landing)
- No tocar sidebar
