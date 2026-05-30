## Rebrand a Altura Cloud

Cambio integral de marca + sistema visual. Tres frentes: identidad (nombre + logo), tokens de color/tipografía, y barrido de hex hardcodeados.

### 1. Identidad

- **Nombre**: "PropCloud" / "Prop Cloud" → "Altura Cloud" en los 6 archivos donde aparece literal: `LandingPage.tsx`, `OnboardingWizard.tsx`, `InstallAppButton.tsx`, `__root.tsx` (title), `configuracion.tsx`, `admin-panel.tsx`, más `public/manifest.webmanifest`.
- **Logo nuevo**: genero `src/assets/altura-cloud-logo.png` (transparente) — una nube etérea sobre forma de cumbre/altura, en lavanda con halo iridiscente. Reemplazo el ícono actual del Sidebar / Topbar / landing / login.
- **Favicon + manifest**: actualizo `public/manifest.webmanifest` con nuevo nombre y `theme_color`.

### 2. Sistema visual (`src/styles.css`)

Reescribo los tokens raíz con la paleta **Twilight Glow** y la tipografía elegida:

- Fuentes: Outfit (display) + Figtree (sans), reemplazando Plus Jakarta + Inter.
- Tokens nuevos (oklch):

```text
--primary           #818cf8  (indigo)
--primary-dark      #6366f1
--primary-light     #c7d2fe
--primary-glow      #a78bfa  (lavanda)

--background        #faf9ff
--bg-subtle         #eef2ff
--card              #ffffff

--text-dark         #1e1b4b
--text-body         #312e81
--text-muted        #8b8bb5

--accent            #ddd6fe
--accent-foreground #6d28d9

--border            #e0e7ff
--border-strong     #c7d2fe
--ring              #a78bfa

--sidebar           #1e1b4b  (indigo profundo)
--sidebar-fg        #eef2ff
--sidebar-accent    #a78bfa

--gradient-ethereal linear-gradient(135deg,#c7d2fe 0%,#ddd6fe 50%,#a78bfa 100%)
--shadow-dreamy     0 20px 60px -20px color-mix(in oklab, #a78bfa 40%, transparent)
```

Mantengo success/danger pero ablando los tonos a versiones pastel coherentes.

### 3. Barrido de hex hardcodeados

73 archivos usan los colores naranja/marrón directos. Hago un reemplazo dirigido (mismo hex → mismo nuevo hex) en todos los `.tsx` bajo `src/`:

```text
#c94f0c → #818cf8     (primary)
#a33d08 → #6366f1     (primary-dark)
#ff6a00 → #a78bfa     (glow / CTA)
#e85f00 → #8b5cf6
#2d1200 → #1e1b4b     (text-dark)
#4a2800 → #312e81     (text-body)
#9a7060 → #8b8bb5     (muted)
#f5ede8 → #eef2ff     (bg-subtle)
#fff5ef → #faf9ff
#f5e6de → #ddd6fe     (accent)
#e8ddd8 → #e0e7ff     (border)
#c9b8b0 → #c7d2fe
#faf9f7 → #faf9ff
#fdecea → #fce7f3     (danger soft)
#fbeae6 → #fce7f3
#fbd9d0 → #fbcfe8
#c0392b → #be185d     (danger ajustado)
#1e6b3a → #166534     (success ok)
#e6f4ea → #dcfce7
```

Esto deja la UI completa (landing, admin tabs, portal, dialogs, tablas, sidebar, topbar) sobre la paleta nueva sin tocar lógica.

### 4. Toques etéreos extra

- Landing hero: gradiente `--gradient-ethereal` de fondo + glow suave en CTA principal.
- Sidebar admin: fondo `--sidebar` indigo con activo en `--sidebar-accent` lavanda y ligero glow.
- Portal residentes: tarjetas con `--shadow-dreamy` y bordes redondeados ya existentes — solo cambian colores.
- `EdificioPlaceholder` (gradientes hardcoded por tipo): re-derivo a tonos azul/lavanda/rosa pastel.

### 5. Verificación

- Restart dev server tras la edición masiva.
- Revisar landing, `/configuracion`, `/edificios/:id`, `/portal`, `/admin-panel` y confirmar contraste legible.
- Buscar `rg "PropCloud|c94f0c"` final para asegurar 0 ocurrencias residuales.

### Fuera de alcance

- No toco lógica, queries, ni estructura de componentes.
- No cambio layout/composición — solo color, tipografía, copia de marca y logo.
- Iconos lucide siguen iguales (solo cambia color via `currentColor`).
