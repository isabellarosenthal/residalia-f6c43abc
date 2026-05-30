## Reasignar roles: navy = primary, amarillo = accent

El problema: amarillo `#ffd60a` sobre blanco no tiene contraste suficiente (WCAG falla a ~1.5:1), y lo estamos usando como color de botones, links, headlines resaltados e iconos. Hay que invertir los roles.

### Nueva jerarquía cromática

- **Primary (navy `#0a1e3f`)** — botones CTA, links, headlines destacados, iconos principales, badges sólidos. Sobre blanco da contraste 15:1 ✓
- **Accent (yellow `#ffd60a`)** — solo para: highlights pequeños (underlines, dots, borders activos), fondo del visor del astronauta, hover states, badges decorativos sobre navy, líneas/divisores, focus rings
- **Backgrounds suaves**: `#fffdf5` (warm cream) sigue igual
- Texto y muted sin cambios

### Cambios

**1. `src/styles.css`** — swap de tokens:
- `--primary: #0a1e3f` (era amarillo)
- `--primary-foreground: #ffffff`
- `--primary-dark: #001a4d`
- `--primary-glow: #13294b`
- Crear `--accent-yellow: #ffd60a` y `--accent-yellow-soft: #fff8d6` como tokens dedicados
- `--ring: #0a1e3f` (focus visible navy)
- Mantener gradient sunny para fondos amarillos contenidos

**2. Sweep en componentes (~70 archivos)** — reemplazos contextuales:
- `bg-[#ffd60a]` en botones CTA / pills → `bg-[#0a1e3f] text-white`
- `text-[#ffd60a]` en headlines / labels sobre fondo blanco → `text-[#0a1e3f]` (o `text-[#001a4d]`)
- `hover:bg-[#e6c200]` → `hover:bg-[#001a4d]`
- `hover:border-[#ffd60a]` → mantener (borde de hover, amarillo OK como acento)
- Iconos amarillos sobre fondo blanco (`text-[#ffd60a]` en chips) → cambiar a `text-[#0a1e3f]` con fondo `bg-[#fff8d6]` (amarillo se queda como surface decorativo)
- Badges del tipo `bg-[#fffdf5] text-[#ffd60a]` → `bg-[#fff8d6] text-[#0a1e3f]`

**3. Conservar amarillo como acento en:**
- Visor del astronauta (logo)
- Pequeños dots / underlines decorativos en hero ("sin hojas de cálculo" → mantener color amarillo pero con sombra/bg navy detrás, o cambiarlo a underline navy con highlight amarillo fino)
- Hover borders en cards
- Bullets de "Hecho en Honduras" badge → fondo amarillo OK porque texto es navy
- Footer accent
- Banda navy de stats (amarillo sobre navy = excelente contraste)

**4. Sidebar admin** — ya es navy con texto cream; mantener accent amarillo solo en item activo (background sutil `#fff8d6/10` o borde amarillo).

**5. Verificación**
- Restart dev server
- Revisar landing, /dashboard, /configuracion, /portal
- Confirmar que cada uso restante de `#ffd60a` está sobre fondo navy o es un highlight pequeño

### Fuera de alcance

Sin tocar lógica, layout, ni el logo del astronauta. Solo reasignar colores.
