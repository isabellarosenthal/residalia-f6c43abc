## Rebrand: Twilight Glow → Astronaut Yellow

Cambiar la paleta lavanda/morada actual a amarillo + blanco + dark navy blue, con un astronauta como mascot/logo de Altura Cloud.

### 1. Nueva paleta (`src/styles.css`)

Reemplazar tokens Twilight Glow por:
- **Yellow primary**: `#ffd60a` (CTAs, acentos) → glow `#ffea5c`
- **Dark navy**: `#0a1e3f` (texto principal, sidebar, headers) → `#13294b` (body text)
- **White**: `#ffffff` (background principal) → `#fffdf5` (warm white para secciones)
- **Soft yellow surface**: `#fff8d6` (cards suaves, hovers)
- **Muted**: `#6b7a99` (text secundario sobre blanco)
- **Accent dark**: `#001a4d` (deep navy para contraste)
- Gradients: `--gradient-sunny` (yellow → soft yellow), `--gradient-deep-sky` (navy → mid navy)
- Sombras: `--shadow-warm` (yellow glow sutil), `--shadow-deep` (navy soft)
- Sidebar: navy oscuro `#0a1e3f` con acentos amarillos
- Mantener Outfit + Figtree

### 2. Logo astronauta

Generar nuevo `src/assets/altura-cloud-logo.png`:
- Astronauta minimalista flotando sobre/al lado de una nube
- Casco con visor reflejando un toque amarillo
- Estilo line-art moderno sobre fondo transparente
- Paleta: navy + amarillo + blanco
- Reemplaza el logo lavanda actual (mismo path, importado en Sidebar + LandingPage)

### 3. Sweep de hex hardcodeados (~73 files)

Reemplazo 1:1 de los hex Twilight Glow por los nuevos:
- `#818cf8` (indigo) → `#ffd60a` (yellow primary)
- `#6366f1` (primary-dark) → `#e6c200` (yellow dark)
- `#a78bfa` (lavender glow) → `#ffea5c` (yellow glow)
- `#1e1b4b` (deep) → `#0a1e3f` (navy deep)
- `#312e81` (body) → `#13294b` (navy body)
- `#8b8bb5` (muted) → `#6b7a99`
- `#eef2ff` (bg suave) → `#fffdf5` (warm white)
- `#faf9ff` (bg base) → `#ffffff`
- `#ddd6fe` (accent suave) → `#fff8d6` (soft yellow)
- `#8b5cf6` (purple action) → `#001a4d` (deep navy)
- `#c7d2fe` → `#ffe87a`
- `#6d28d9` → `#001a4d`

Aplica a los 73 archivos del rebrand anterior (componentes, routes, EdificioPlaceholder, etc.).

### 4. EdificioPlaceholder

Regenerar las 5 paletas de gradientes a combinaciones yellow/navy/white en vez de lavender.

### 5. Manifest

`public/manifest.webmanifest`: `theme_color: #ffd60a`, `background_color: #ffffff`.

### 6. Verificación

- Restart dev server
- Revisar landing, dashboard, sidebar, portal residentes, configuracion
- Confirmar 0 referencias residuales a `#818cf8`, `#a78bfa`, `#1e1b4b`

### Fuera de alcance

Sin cambios en lógica, queries, layout o copy. Solo color, logo y tokens visuales. Mantengo nombre "Altura Cloud".
