## Plan

### 1. Restaurar imagen del hero tal cual
- Copiar `user-uploads://image-51.png` → `src/assets/hero-astronaut.png` (sobrescribir). Sin remover fondo, sin editar — la imagen exacta que subiste, ya que su propio fondo blanco se funde con el fondo blanco de la landing.

### 2. Reparar `LandingPage.tsx` usando TODOS los colores del brand kit

Voy a hacer un pase manual (no más find-and-replace ciegos) reasignando cada uso de `#4F46E5` que actualmente está roto a su token correcto del kit:

**Paleta usada:**
- `#4F46E5` Royal Blue — botón primario, links, acento
- `#4338CA` Deep Indigo — hover de primario, headings con contraste, stats band
- `#7AA2FF` Cornflower Blue — acentos suaves, hover suave
- `#E9E2FF` Lavender Mist — fondos de chips/badges/iconos, labels sobre indigo oscuro
- `#0F172A` Text Primary — headings y texto principal
- `#475569` Text Secondary — descripciones, navegación
- `#E2E8F0` Border — divisores
- `#F1F5F9` Surface — fondos de cards
- Estado: `#16A34A` success, `#3B82F6` info, `#F59E0B` warning, `#EF4444` error, `#8B5CF6` neutral

**Fixes específicos:**

a) **Texto base**: `text-[#4F46E5]` en el `<div>` raíz (línea 63) → `text-[#0F172A]`.

b) **Nav**: links del nav → `text-[#475569]`, hover `hover:text-[#4F46E5]`. Brand "Altura Cloud" → `text-[#0F172A]`.

c) **Botones primarios** (líneas 82, 120, 144, 316): `bg-[#4F46E5] text-[#4F46E5]` → `bg-[#4F46E5] text-white` con `hover:bg-[#4338CA]`.

d) **Botón "Cerrar sesión" / dropdown items**: textos → `text-[#0F172A]`, subtítulos → `text-[#475569]`, hover fondo → `hover:bg-[#E9E2FF]`.

e) **Hero**:
   - Badge "Hecho en Honduras": `bg-[#E9E2FF] text-[#4338CA]`.
   - H1: `text-[#0F172A]`.
   - Párrafo: `text-[#475569]`.
   - Botón secundario "Ver planes": border `#E2E8F0`, text `#0F172A`, hover border `#4F46E5`.
   - Check de "Sin tarjeta": `text-[#16A34A]`.

f) **Stats band** (línea 175): `bg-[#4338CA] text-white`. Números blancos. Labels → `text-[#E9E2FF]` (visibles).

g) **Cards de funciones** (líneas 203-212): variar `iconBg` con los colores de estado del kit (`#4F46E5`, `#7AA2FF`, `#8B5CF6`, `#16A34A`, `#3B82F6`, `#F59E0B`, `#EF4444`, `#4338CA`, `#7AA2FF`) — ya casi están. Título → `text-[#0F172A]`. Descripción → `text-[#475569]`. Link "Ver X" → `text-[#4F46E5]`.

h) **Sección "How it works"**: H2 → `text-[#0F172A]`. Círculos numerados: `bg-[#4F46E5] text-white`. Títulos pasos → `text-[#0F172A]`.

i) **"¿Por qué Altura Cloud?"** (caja indigo, línea 267): `bg-[#4338CA]`. Iconos `text-[#7AA2FF]`. Títulos `text-white`. Descripciones `text-[#E9E2FF]/80`. Subtítulo bajo H2 → `text-[#E9E2FF]`.

j) **Planes** (línea 296+): H2 → `text-[#0F172A]`. Plan destacado: `bg-[#4338CA] text-white`, sub `text-[#E9E2FF]`, botón blanco con `text-[#4338CA]`. Planes no destacados: `bg-[#F1F5F9]`, título `text-[#0F172A]`, botón `bg-[#4F46E5] text-white`. Badge "Más popular": `bg-[#E9E2FF] text-[#4338CA]`. Checks de features: `text-[#16A34A]`.

k) **FAQ y footer** (resto del archivo): mismo criterio — headings `#0F172A`, body `#475569`, acentos `#4F46E5`.

l) Quitar emojis dentro del párrafo del hero (💰🔑👥🔧🏘️) — quedan fuera del lenguaje visual del astronauta moderno. Reemplazar por texto limpio.

### 3. No tocar
- `styles.css` (ya quedó bien con los tokens v1.0).
- Otros archivos fuera de la landing.

Resultado: landing legible, contrastada, usando 7-8 colores del kit en lugar de 2.